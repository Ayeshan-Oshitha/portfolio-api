import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { AdminUsersController } from './admin-users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AdminUsersController],
  providers: [UsersService, AdminGuard],
})
export class UsersModule {}
