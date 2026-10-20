import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { ApprovalStatus } from '../generated/prisma/enums.js';

type CurrentUser = {
  id: string;
  email: string;
  role: string | null;
  approvalStatus: ApprovalStatus;
};
type AuthenticatedRequest = Request & {
  user?: { id: string } | null;
  currentUser?: CurrentUser;
};

@Injectable()
export class ApprovedUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User is not authenticated. Please sign in.');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        banned: true,
        banExpires: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedException('User not found.');
    }

    const banIsActive =
      dbUser.banned === true && (!dbUser.banExpires || dbUser.banExpires > new Date());

    if (banIsActive) {
      throw new ForbiddenException('Account is banned');
    }

    const isAdmin = dbUser.role?.split(',').includes('admin') ?? false;

    if (!isAdmin && dbUser.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new ForbiddenException('Account approval is required');
    }

    request.currentUser = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      approvalStatus: dbUser.approvalStatus,
    };

    return true;
  }
}
