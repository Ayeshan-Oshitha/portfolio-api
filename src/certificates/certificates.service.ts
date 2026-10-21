import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CertificateType } from '../generated/prisma/enums.js';
import type { CurrentUser } from '../auth/approved-user.guard.js';
import type { CreateCertificateDto } from './dto/create-certificate.dto.js';
import type { UpdateCertificateDto } from './dto/update-certificate.dto.js';

const certificateInclude = {
  fileMedia: { select: { key: true, contentType: true } },
  issuerLogoMedia: { select: { key: true } },
} satisfies Prisma.CertificateInclude;
type CertificateWithMedia = Prisma.CertificateGetPayload<{ include: typeof certificateInclude }>;

// Featured first, then your sortOrder, then newest issue date.
const displayOrder: Prisma.CertificateOrderByWithRelationInput[] = [
  { isFeatured: 'desc' },
  { sortOrder: 'asc' },
  { issueDate: { sort: 'desc', nulls: 'last' } },
  { id: 'desc' },
];

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // Create a draft certificate owned by the current user.
  public async create(user: CurrentUser, dto: CreateCertificateDto) {
    const { issueDate, expiryDate, ...data } = dto;
    this.assertFileOrLogo(data.fileMediaId, data.issuerLogoMediaId);
    await this.assertOwnMedia(user, [data.fileMediaId, data.issuerLogoMediaId]);

    try {
      const certificate = await this.prisma.certificate.create({
        data: { ...data, ...this.toDates(issueDate, expiryDate), ownerId: user.id },
        include: certificateInclude,
      });
      return this.toResponse(certificate);
    } catch (error) {
      this.handleError(error);
    }
  }

  // List the current user's certificates in display order, with pagination.
  public async findAll(user: CurrentUser, page: number, limit: number) {
    this.assertPaging(page, limit, 100);
    const where: Prisma.CertificateWhereInput = { ownerId: user.id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.certificate.findMany({
        where,
        include: certificateInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: displayOrder,
      }),
      this.prisma.certificate.count({ where }),
    ]);
    return new PaginatedResult(
      items.map((c) => this.toResponse(c)),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Get one of the current user's certificates.
  public async findOne(user: CurrentUser, id: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id, ownerId: user.id },
      include: certificateInclude,
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return this.toResponse(certificate);
  }

  // Update fields; the certificate must still have a file or a logo afterwards.
  public async update(user: CurrentUser, id: string, dto: UpdateCertificateDto) {
    const existing = await this.assertOwnCertificate(user, id);
    const { issueDate, expiryDate, ...data } = dto;

    const fileMediaId = data.fileMediaId === undefined ? existing.fileMediaId : data.fileMediaId;
    const logoMediaId =
      data.issuerLogoMediaId === undefined ? existing.issuerLogoMediaId : data.issuerLogoMediaId;
    this.assertFileOrLogo(fileMediaId, logoMediaId);
    await this.assertOwnMedia(user, [data.fileMediaId, data.issuerLogoMediaId]);

    const dates = this.toDates(
      issueDate === undefined ? existing.issueDate?.toISOString() : issueDate,
      expiryDate === undefined ? existing.expiryDate?.toISOString() : expiryDate,
    );

    try {
      const certificate = await this.prisma.certificate.update({
        where: { id },
        data: { ...data, ...dates },
        include: certificateInclude,
      });
      return this.toResponse(certificate);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Publish or unpublish; publishedAt is set the first time it goes live.
  public async setPublished(user: CurrentUser, id: string, isPublished: boolean) {
    const existing = await this.assertOwnCertificate(user, id);
    const certificate = await this.prisma.certificate.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: certificateInclude,
    });
    return this.toResponse(certificate);
  }

  // Delete one of the current user's certificates (media files are kept).
  public async remove(user: CurrentUser, id: string) {
    await this.assertOwnCertificate(user, id);
    await this.prisma.certificate.delete({ where: { id } });
    return { id };
  }

  // Public: list published certificates, optionally by type or featured only.
  public async findPublished(
    page: number,
    limit: number,
    type?: CertificateType,
    featured?: boolean,
  ) {
    this.assertPaging(page, limit, 50);
    const where: Prisma.CertificateWhereInput = {
      isPublished: true,
      ...(type ? { type } : {}),
      ...(featured ? { isFeatured: true } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.certificate.findMany({
        where,
        include: certificateInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: displayOrder,
      }),
      this.prisma.certificate.count({ where }),
    ]);
    return new PaginatedResult(
      items.map((c) => this.toResponse(c)),
      { page, limit, total, totalPages: Math.ceil(total / limit) },
    );
  }

  // Public: get one published certificate.
  public async findPublishedOne(id: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id, isPublished: true },
      include: certificateInclude,
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return this.toResponse(certificate);
  }

  // A certificate needs at least a file or an issuer logo.
  private assertFileOrLogo(fileMediaId?: string | null, logoMediaId?: string | null) {
    if (!fileMediaId && !logoMediaId) {
      throw new BadRequestException('Add a certificate file or an issuer logo');
    }
  }

  // 404 unless the certificate exists and belongs to the current user.
  private async assertOwnCertificate(user: CurrentUser, id: string) {
    const certificate = await this.prisma.certificate.findFirst({
      where: { id, ownerId: user.id },
      select: {
        id: true,
        publishedAt: true,
        issueDate: true,
        expiryDate: true,
        fileMediaId: true,
        issuerLogoMediaId: true,
      },
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }

  // Every media ID sent must be in the current user's library.
  private async assertOwnMedia(user: CurrentUser, mediaIds: (string | null | undefined)[]) {
    const ids = [...new Set(mediaIds.filter((id): id is string => !!id))];
    if (!ids.length) return;
    const count = await this.prisma.media.count({ where: { id: { in: ids }, ownerId: user.id } });
    if (count !== ids.length) {
      throw new BadRequestException('File or logo is not in your media library');
    }
  }

  // Turn date strings into Dates (null clears) and check expiry is not before issue.
  private toDates(issueDate?: string | null, expiryDate?: string | null) {
    const issue = issueDate ? new Date(issueDate) : issueDate === null ? null : undefined;
    const expiry = expiryDate ? new Date(expiryDate) : expiryDate === null ? null : undefined;
    if (issue && expiry && expiry < issue) {
      throw new BadRequestException('Expiry date cannot be before issue date');
    }
    return { issueDate: issue, expiryDate: expiry };
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

  // Add file/logo URLs and an isExpired flag for the client.
  private toResponse({ fileMedia, issuerLogoMedia, ...certificate }: CertificateWithMedia) {
    return {
      ...certificate,
      fileUrl: fileMedia ? this.storage.getPublicUrl(fileMedia.key) : null,
      fileType: fileMedia?.contentType ?? null,
      issuerLogoUrl: issuerLogoMedia ? this.storage.getPublicUrl(issuerLogoMedia.key) : null,
      isExpired: certificate.expiryDate ? certificate.expiryDate < new Date() : false,
    };
  }

  // Turn Prisma errors into HTTP errors.
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') throw new BadRequestException('File or logo no longer exists');
      if (error.code === 'P2025') throw new NotFoundException('Certificate not found');
    }
    throw error;
  }
}
