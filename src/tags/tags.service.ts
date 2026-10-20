import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CurrentUser } from '../auth/approved-user.guard.js';
import type { CreateTagDto } from './dto/create-tag.dto.js';
import type { UpdateTagDto } from './dto/update-tag.dto.js';

const tagInclude = { iconMedia: { select: { key: true } } } satisfies Prisma.TagInclude;
type TagWithIcon = Prisma.TagGetPayload<{ include: typeof tagInclude }>;

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // List all tags alphabetically (public).
  async findAll() {
    const tags = await this.prisma.tag.findMany({ include: tagInclude, orderBy: { name: 'asc' } });
    return tags.map((tag) => this.toResponse(tag));
  }

  // Create a tag (admin only).
  async create(user: CurrentUser, dto: CreateTagDto) {
    await this.assertOwnMedia(user, dto.iconMediaId);
    try {
      const tag = await this.prisma.tag.create({ data: dto, include: tagInclude });
      return this.toResponse(tag);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update a tag's fields (admin only).
  async update(user: CurrentUser, id: string, dto: UpdateTagDto) {
    await this.assertOwnMedia(user, dto.iconMediaId);
    try {
      const tag = await this.prisma.tag.update({ where: { id }, data: dto, include: tagInclude });
      return this.toResponse(tag);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete a tag (admin only).
  async remove(id: string) {
    try {
      await this.prisma.tag.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Only allow an uploaded icon that belongs to the current user.
  private async assertOwnMedia(user: CurrentUser, mediaId?: string) {
    if (!mediaId) return;
    const media = await this.prisma.media.findFirst({ where: { id: mediaId, ownerId: user.id } });
    if (!media) {
      throw new BadRequestException('Icon media not found in your library');
    }
  }

  // Add an iconUrl: uploaded icon first, otherwise the Simple Icons CDN.
  private toResponse({ iconMedia, ...tag }: TagWithIcon) {
    let iconUrl: string | null = null;
    if (iconMedia) {
      iconUrl = this.storage.getPublicUrl(iconMedia.key);
    } else if (tag.iconSlug) {
      iconUrl = `https://cdn.simpleicons.org/${tag.iconSlug}${tag.color ? `/${tag.color}` : ''}`;
    }
    return { ...tag, iconUrl };
  }

  // Turn Prisma errors into HTTP errors.
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new ConflictException('A tag with this name or slug already exists');
      if (error.code === 'P2025') throw new NotFoundException('Tag not found');
    }
    throw error;
  }
}
