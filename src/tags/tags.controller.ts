import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { AdminGuard } from '../auth/admin.guard.js';
import type { CurrentUser as CurrentUserType } from '../auth/approved-user.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';

@AllowAnonymous()
@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags' })
  @ApiOkResponse({ description: 'All tags with icon URLs' })
  // Get all tags with their icon URLs (public, no login needed).
  findAll() {
    return this.tagsService.findAll();
  }
}

@ApiBearerAuth('bearerAuth')
@ApiTags('Admin tags')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Administrator access required' })
@UseGuards(AdminGuard)
@Controller('admin/tags')
export class AdminTagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @ApiCreatedResponse({ description: 'Tag created' })
  @ApiConflictResponse({ description: 'Name or slug already used' })
  // Create a tag (admin only).
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateTagDto) {
    return this.tagsService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiOkResponse({ description: 'Tag updated' })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @ApiConflictResponse({ description: 'Name or slug already used' })
  // Update a tag's fields (admin only).
  update(@CurrentUser() user: CurrentUserType, @Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(user, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiOkResponse({ description: 'Tag deleted' })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  @ApiConflictResponse({ description: 'Tag is still used by articles or projects' })
  // Delete a tag (admin only).
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
