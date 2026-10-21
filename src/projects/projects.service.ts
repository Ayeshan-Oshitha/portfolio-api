import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { slugify } from '../common/utils/slugify.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CurrentUser } from '../auth/approved-user.guard.js';
import type { CreateProjectDto, ProjectImageInputDto } from './dto/create-project.dto.js';
import type { UpdateProjectDto } from './dto/update-project.dto.js';

const projectInclude = {
  coverMedia: { select: { key: true } },
  images: {
    orderBy: { position: 'asc' },
    select: { mediaId: true, caption: true, position: true, media: { select: { key: true } } },
  },
  tags: {
    select: { tag: { select: { id: true, name: true, slug: true, iconSlug: true, color: true } } },
  },
} satisfies Prisma.ProjectInclude;
type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

const publicProjectInclude = {
  ...projectInclude,
  owner: { select: { id: true, name: true, image: true } },
} satisfies Prisma.ProjectInclude;

// Public order: featured first, then your sortOrder, then newest.
const publicOrder: Prisma.ProjectOrderByWithRelationInput[] = [
  { isFeatured: 'desc' },
  { sortOrder: 'asc' },
  { publishedAt: 'desc' },
  { id: 'desc' },
];

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Create a draft project owned by the current user; the slug is generated from the title.
  public async create(user: CurrentUser, dto: CreateProjectDto) {
    const { tagIds, images, startDate, endDate, ...data } = dto;
    await this.assertOwnMedia(user, [data.coverMediaId, ...(images ?? []).map((i) => i.mediaId)]);
    await this.assertTagsExist(tagIds);
    const dates = this.toDates(startDate, endDate);

    try {
      const project = await this.prisma.project.create({
        data: {
          ...data,
          ...dates,
          slug: await this.uniqueSlug(user.id, data.title),
          ownerId: user.id,
          images: images ? { create: this.toImageRows(images) } : undefined,
          tags: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
        include: projectInclude,
      });
      return this.toResponse(project);
    } catch (error) {
      this.handleError(error);
    }
  }

  // List the current user's projects in portfolio order, with pagination.
  public async findAll(user: CurrentUser, page: number, limit: number) {
    this.assertPaging(page, limit, 100);
    const where: Prisma.ProjectWhereInput = { ownerId: user.id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: projectInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.project.count({ where }),
    ]);
    return new PaginatedResult(
      items.map((p) => this.toResponse(p)),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Get one of the current user's projects.
  public async findOne(user: CurrentUser, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId: user.id },
      include: projectInclude,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.toResponse(project);
  }

  // Update fields; sending images or tagIds replaces that whole list.
  public async update(user: CurrentUser, id: string, dto: UpdateProjectDto) {
    const existing = await this.assertOwnProject(user, id);
    const { tagIds, images, startDate, endDate, ...data } = dto;
    await this.assertOwnMedia(user, [data.coverMediaId, ...(images ?? []).map((i) => i.mediaId)]);
    await this.assertTagsExist(tagIds);
    const dates = this.toDates(
      startDate === undefined ? existing.startDate?.toISOString() : startDate,
      endDate === undefined ? existing.endDate?.toISOString() : endDate,
    );

    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          ...data,
          ...dates,
          images: images ? { deleteMany: {}, create: this.toImageRows(images) } : undefined,
          tags: tagIds ? { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
        include: projectInclude,
      });
      return this.toResponse(project);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Publish or unpublish; publishedAt is set the first time it goes live.
  public async setPublished(user: CurrentUser, id: string, isPublished: boolean) {
    const existing = await this.assertOwnProject(user, id);
    const project = await this.prisma.project.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: projectInclude,
    });
    return this.toResponse(project);
  }

  // Delete one of the current user's projects (gallery and tag links go with it).
  public async remove(user: CurrentUser, id: string) {
    await this.assertOwnProject(user, id);
    await this.prisma.project.delete({ where: { id } });
    return { id };
  }

  // Public: list published projects, optionally only featured or by tag slug.
  public async findPublished(page: number, limit: number, featured?: boolean, tagSlug?: string) {
    this.assertPaging(page, limit, 50);
    const where: Prisma.ProjectWhereInput = {
      isPublished: true,
      ...(featured ? { isFeatured: true } : {}),
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: publicProjectInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: publicOrder,
      }),
      this.prisma.project.count({ where }),
    ]);
    return new PaginatedResult(
      items.map(({ owner, description: _description, ...p }) => ({
        ...this.toResponse({ ...p, description: null }),
        author: owner,
      })),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Public: get one published project with its full description.
  public async findPublishedOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, isPublished: true },
      include: publicProjectInclude,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const { owner, ...rest } = project;
    return { ...this.toResponse(rest), author: owner };
  }

  // Build a slug from the title that the user hasn't used yet (adds -2, -3, ... if needed).
  private async uniqueSlug(ownerId: string, title: string): Promise<string> {
    const base = slugify(title) || 'project';
    const taken = await this.prisma.project.findMany({
      where: { ownerId, slug: { startsWith: base } },
      select: { slug: true },
    });
    const used = new Set(taken.map((p) => p.slug));
    if (!used.has(base)) return base;

    let n = 2;
    while (used.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  // 404 unless the project exists and belongs to the current user.
  private async assertOwnProject(user: CurrentUser, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true, publishedAt: true, startDate: true, endDate: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  // Every cover/gallery media ID must be in the current user's library.
  private async assertOwnMedia(user: CurrentUser, mediaIds: (string | null | undefined)[]) {
    const ids = [...new Set(mediaIds.filter((id): id is string => !!id))];
    if (!ids.length) return;
    const count = await this.prisma.media.count({ where: { id: { in: ids }, ownerId: user.id } });
    if (count !== ids.length) {
      throw new BadRequestException('One or more images are not in your media library');
    }
  }

  // Reject unknown tag IDs.
  private async assertTagsExist(tagIds?: string[]) {
    if (!tagIds?.length) return;
    const count = await this.prisma.tag.count({ where: { id: { in: tagIds } } });
    if (count !== tagIds.length) {
      throw new BadRequestException('One or more tags do not exist');
    }
  }

  // Turn date strings into Dates (null clears) and check the end is not before the start.
  private toDates(startDate?: string | null, endDate?: string | null) {
    const start = startDate ? new Date(startDate) : startDate === null ? null : undefined;
    const end = endDate ? new Date(endDate) : endDate === null ? null : undefined;
    if (start && end && end < start) {
      throw new BadRequestException('End date cannot be before start date');
    }
    return { startDate: start, endDate: end };
  }

  // Gallery rows keep the order they were sent in.
  private toImageRows(images: ProjectImageInputDto[]) {
    const ids = images.map((i) => i.mediaId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('The same image is in the gallery twice');
    }
    return images.map((image, position) => ({
      mediaId: image.mediaId,
      caption: image.caption,
      position,
    }));
  }

  private assertPaging(page: number, limit: number, maxLimit: number) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > maxLimit) {
      throw new BadRequestException(`Limit must be between 1 and ${maxLimit}`);
    }
  }

  // Add image URLs and flatten tags for the client.
  private toResponse({ coverMedia, images, tags, ...project }: ProjectWithRelations) {
    return {
      ...project,
      coverUrl: coverMedia ? this.storage.getPublicUrl(coverMedia.key) : null,
      images: images.map(({ media, ...image }) => ({
        ...image,
        url: this.storage.getPublicUrl(media.key),
      })),
      tags: tags.map((t) => t.tag),
    };
  }

  // Turn Prisma errors into HTTP errors.
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new ConflictException('You already have a project with this slug');
      if (error.code === 'P2003')
        throw new BadRequestException('One or more tags or images no longer exist');
      if (error.code === 'P2025') throw new NotFoundException('Project not found');
    }
    throw error;
  }
}
