import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginatedResult } from '../common/responses/paginated-result.js';
import { Prisma } from '../generated/prisma/client.js';
import type { ApprovalStatus } from '../generated/prisma/enums.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin: get all users with pagination.
  async findAll(page: number, limit: number) {
    if (!Number.isSafeInteger(page) || page < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }

    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip) || skip > 2_147_483_647) {
      throw new BadRequestException('Requested page is too large');
    }

    const [users, total] = await this.prisma.$transaction(
      [
        this.prisma.user.findMany({
          skip: skip,
          take: limit,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            role: true,
            approvalStatus: true,
            banned: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.user.count(),
      ],
      {
        isolationLevel: 'RepeatableRead',
      },
    );

    return new PaginatedResult(users, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }

  // Admin: change a user's approval status.
  async updateApprovalStatus(userId: string, approvalStatus: ApprovalStatus) {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          approvalStatus,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          approvalStatus: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }
}
