import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { Prisma } from '../generated/prisma/client.js';
import type { CreateContactMessageDto } from './dto/create-contact-message.dto.js';

type RequestMeta = { ipAddress?: string; userAgent?: string };

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // Public: save a contact message and email the owner. Bots that fill the honeypot get a fake success.
  async submit(dto: CreateContactMessageDto, meta: RequestMeta) {
    const { website, ...data } = dto;
    if (website) {
      return { received: true };
    }

    const message = await this.prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
        ipAddress: meta.ipAddress?.slice(0, 64),
        userAgent: meta.userAgent?.slice(0, 300),
      },
    });

    const emailSent = await this.mail.sendContactNotification(message).catch(() => false);
    if (emailSent) {
      await this.prisma.contactMessage.update({ where: { id: message.id }, data: { emailSent } });
    }

    return { received: true };
  }

  // Admin: list messages, newest first, optionally unread only.
  async findAll(page: number, limit: number, unread?: boolean) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const where: Prisma.ContactMessageWhereInput = unread ? { isRead: false } : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return new PaginatedResult(items, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  // Admin: number of unread messages (for a badge in the CMS).
  async unreadCount() {
    const count = await this.prisma.contactMessage.count({ where: { isRead: false } });
    return { count };
  }

  // Admin: get one message.
  async findOne(id: string) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  // Admin: mark a message as read or unread.
  async setRead(id: string, isRead: boolean) {
    try {
      return await this.prisma.contactMessage.update({ where: { id }, data: { isRead } });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Admin: delete a message.
  async remove(id: string) {
    try {
      await this.prisma.contactMessage.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handleError(error);
    }
  }

  // Turn Prisma errors into HTTP errors.
  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundException('Message not found');
    }
    throw error;
  }
}
