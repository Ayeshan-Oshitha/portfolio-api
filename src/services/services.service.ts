import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CurrentUser } from '../auth/approved-user.guard.js';
import type { CreateServiceDto } from './dto/create-service.dto.js';
import type { UpdateServiceDto } from './dto/update-service.dto.js';

const serviceInclude = {
  iconMedia: { select: { key: true } },
  technologies: {
    select: { tag: { select: { id: true, name: true, slug: true, iconSlug: true, color: true } } },
  },
} satisfies Prisma.ServiceInclude;
type ServiceWithRelations = Prisma.ServiceGetPayload<{ include: typeof serviceInclude }>;

// Featured first, then your sortOrder, then oldest first (stable order).
const displayOrder: Prisma.ServiceOrderByWithRelationInput[] = [
  { isFeatured: 'desc' },
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
  { id: 'asc' },
];

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Create a draft service owned by the current user.
  public async create(user: CurrentUser, dto: CreateServiceDto) {
    const { tagIds, ...data } = dto;
    await this.assertOwnMedia(user, data.iconMediaId);
    await this.assertTagsExist(tagIds);

    try {
      const service = await this.prisma.service.create({
        data: {
          ...data,
          ownerId: user.id,
          technologies: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        },
        include: serviceInclude,
      });
      return this.toResponse(service);
    } catch (error) {
      this.handleError(error);
    }
  }

  // List the current user's services in display order, with pagination.
  public async findAll(user: CurrentUser, page: number, limit: number) {
    this.assertPaging(page, limit, 100);
    const where: Prisma.ServiceWhereInput = { ownerId: user.id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        include: serviceInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: displayOrder,
      }),
      this.prisma.service.count({ where }),
    ]);
    return new PaginatedResult(
      items.map((s) => this.toResponse(s)),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Get one of the current user's services.
  public async findOne(user: CurrentUser, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, ownerId: user.id },
      include: serviceInclude,
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return this.toResponse(service);
  }

  // Update fields; sending tagIds replaces all technologies.
  public async update(user: CurrentUser, id: string, dto: UpdateServiceDto) {
    await this.assertOwnService(user, id);
    const { tagIds, ...data } = dto;
    await this.assertOwnMedia(user, data.iconMediaId);
    await this.assertTagsExist(tagIds);

    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: {
          ...data,
          technologies: tagIds
            ? { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) }
            : undefined,
        },
        include: serviceInclude,
      });
      return this.toResponse(service);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Publish or unpublish; publishedAt is set the first time it goes live.
  public async setPublished(user: CurrentUser, id: string, isPublished: boolean) {
    const existing = await this.assertOwnService(user, id);
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: serviceInclude,
    });
    return this.toResponse(service);
  }

  // Delete one of the current user's services (its technology links go with it).
  public async remove(user: CurrentUser, id: string) {
    await this.assertOwnService(user, id);
    await this.prisma.service.delete({ where: { id } });
    return { id };
  }

  // Public: list published services, optionally featured only or by tag slug.
  public async findPublished(featured?: boolean, tagSlug?: string) {
    const services = await this.prisma.service.findMany({
      where: {
        isPublished: true,
        ...(featured ? { isFeatured: true } : {}),
        ...(tagSlug ? { technologies: { some: { tag: { slug: tagSlug } } } } : {}),
      },
      include: serviceInclude,
      orderBy: displayOrder,
      take: 50,
    });
    return services.map((s) => this.toResponse(s));
  }

  // 404 unless the service exists and belongs to the current user.
  private async assertOwnService(user: CurrentUser, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true, publishedAt: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  // Only allow an icon from the current user's media library.
  private async assertOwnMedia(user: CurrentUser, mediaId?: string | null) {
    if (!mediaId) return;
    const media = await this.prisma.media.findFirst({ where: { id: mediaId, ownerId: user.id } });
    if (!media) {
      throw new BadRequestException('Icon is not in your media library');
    }
  }

  // Reject unknown tag IDs.
  private async assertTagsExist(tagIds?: string[]) {
    if (!tagIds?.length) return;
    const count = await this.prisma.tag.count({ where: { id: { in: tagIds } } });
    if (count !== tagIds.length) {
      throw new BadRequestException('One or more technologies do not exist');
    }
  }

  // Validate page and limit query values.
  private assertPaging(page: number, limit: number, maxLimit: number) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > maxLimit) {
      throw new BadRequestException(`Limit must be between 1 and ${maxLimit}`);
    }
  }

  // Add the icon URL and flatten technologies for the client.
  private toResponse({ iconMedia, technologies, ...service }: ServiceWithRelations) {
    return {
      ...service,
      iconUrl: iconMedia ? this.storage.getPublicUrl(iconMedia.key) : null,
      technologies: technologies.map((t) => t.tag),
    };
  }

  // Turn Prisma errors into HTTP errors.
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003')
        throw new BadRequestException('A technology or the icon no longer exists');
      if (error.code === 'P2025') throw new NotFoundException('Service not found');
    }
    throw error;
  }
}
