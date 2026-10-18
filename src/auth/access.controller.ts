import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApprovedUserGuard } from './approved-user.guard.js';
import { AdminGuard } from './admin.guard.js';

// This controller is for testing access control based on user approval and admin status.
@Controller('access')
export class AccessController {
  @Get('content')
  @UseGuards(ApprovedUserGuard)
  checkContentAccess() {
    return { allowed: true };
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  checkAdminAccess() {
    return { allowed: true };
  }
}
