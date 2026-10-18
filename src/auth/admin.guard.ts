import { ForbiddenException, Injectable, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { ApprovedUserGuard } from './approved-user.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

type AdminRequest = Request & {
  currentUser?: {
    role: string;
  };
};

@Injectable()
export class AdminGuard extends ApprovedUserGuard {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<AdminRequest>();

    const isAdmin = request.currentUser?.role?.split(',').includes('admin') ?? false;

    if (!isAdmin) {
      throw new ForbiddenException('Administrator access is required');
    }

    return true;
  }
}
