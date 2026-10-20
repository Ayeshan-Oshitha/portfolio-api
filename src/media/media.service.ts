import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CurrentUser } from '../auth/approved-user.guard.js';
import { MAX_MEDIA_BYTES, MEDIA_TYPES, type MediaContentType } from './media.constants.js';
import type { CreateUploadUrlDto } from './dto/create-upload-url.dto.js';
import type { ConfirmMediaDto } from './dto/confirm-media.dto.js';

const UPLOAD_URL_TTL_SECONDS = 300;

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Step 1 of an upload: give the browser a short-lived PUT URL.
  public async createUploadUrl(user: CurrentUser, dto: CreateUploadUrlDto) {
    const key = this.storage.buildKey(user.id, MEDIA_TYPES[dto.contentType]);
    const uploadUrl = await this.storage.createUploadUrl(
      key,
      dto.contentType,
      UPLOAD_URL_TTL_SECONDS,
    );

    return {
      key,
      uploadUrl,
      method: 'PUT',
      headers: { 'Content-Type': dto.contentType },
      expiresIn: UPLOAD_URL_TTL_SECONDS,
    };
  }

  // Step 2 of an upload: verify the file landed in storage, then save it.
  public async confirm(user: CurrentUser, dto: ConfirmMediaDto) {
    const ownKeyPattern = new RegExp(
      `^users/${user.id}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp|gif|svg|pdf)$`,
    );
    if (!ownKeyPattern.test(dto.key)) {
      throw new ForbiddenException('You can only confirm your own uploads');
    }

    const object = await this.storage.headObject(dto.key);
    if (!object) {
      throw new NotFoundException('Uploaded file not found in storage');
    }

    if (!(object.contentType in MEDIA_TYPES) || object.size > MAX_MEDIA_BYTES) {
      await this.storage.deleteObject(dto.key);
      throw new BadRequestException('File type not allowed or file larger than 10 MB');
    }

    try {
      const media = await this.prisma.media.create({
        data: {
          key: dto.key,
          contentType: object.contentType as MediaContentType,
          size: object.size,
          originalName: dto.originalName,
          ownerId: user.id,
        },
      });
      return this.withUrl(media);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('This file is already saved');
      }
      throw error;
    }
  }

  // Owners see their own media; admin sees all.
  public async findAll(user: CurrentUser, page: number, limit: number) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const where: Prisma.MediaWhereInput = { ownerId: user.id };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.media.count({ where }),
    ]);

    return new PaginatedResult(
      items.map((m) => this.withUrl(m)),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  public async remove(user: CurrentUser, id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });

    // Same 404 for "missing" and "not yours", so users can't probe other users' IDs.
    if (!media || media.ownerId !== user.id) {
      throw new NotFoundException('Media not found');
    }

    await this.storage.deleteObject(media.key);
    await this.prisma.media.delete({ where: { id } });
    return { id };
  }

  private withUrl<T extends { key: string }>(media: T) {
    return { ...media, url: this.storage.getPublicUrl(media.key) };
  }
}
