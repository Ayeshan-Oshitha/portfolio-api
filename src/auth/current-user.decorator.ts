import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { CurrentUser as CurrentUserType } from './approved-user.guard.js';

// Reads the user that ApprovedUserGuard/AdminGuard attached to the request.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserType =>
    context.switchToHttp().getRequest<{ currentUser: CurrentUserType }>().currentUser,
);

export function isAdmin(user: CurrentUserType): boolean {
  return user.role?.split(',').includes('admin') ?? false;
}
