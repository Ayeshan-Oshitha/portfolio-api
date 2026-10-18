import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard.js';
import { UsersService } from './users.service.js';
import { UpdateApprovalStatusDto } from './dto/update-approval-status.dto.js';

@ApiTags('Admin users')
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List registered users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  })
  @ApiOkResponse({ description: 'Paginated list of registered users' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Administrator access required' })
  // Admin: get all users with pagination.
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usersService.findAll(page, limit);
  }

  @Patch(':id/approval-status')
  @ApiOperation({ summary: 'Change a user approval status' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiOkResponse({ description: 'Approval status updated' })
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiUnauthorizedResponse({ description: 'Authentication required' })
  @ApiForbiddenResponse({ description: 'Administrator access required' })
  @ApiNotFoundResponse({ description: 'User not found' })
  // Admin: approve, reject, or return a user to pending.
  updateApprovalStatus(@Param('id') userId: string, @Body() dto: UpdateApprovalStatusDto) {
    return this.usersService.updateApprovalStatus(userId, dto.approvalStatus);
  }
}
