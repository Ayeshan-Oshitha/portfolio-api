import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApprovedUserGuard,
  type CurrentUser as CurrentUserType,
} from '../auth/approved-user.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { PublishProjectDto } from './dto/publish-project.dto.js';

@ApiBearerAuth('bearerAuth')
@ApiTags('Projects')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Approved account required' })
@UseGuards(ApprovedUserGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project (draft)' })
  @ApiCreatedResponse({ description: 'Project created' })
  @ApiBadRequestResponse({ description: 'Invalid body, images, tags or dates' })
  // Create a new draft project.
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your projects' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({ description: 'Paginated list of your projects' })
  // List your own projects.
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.projectsService.findAll(user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of your projects' })
  @ApiOkResponse({ description: 'Project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  // Get one of your projects.
  findOne(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.projectsService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of your projects' })
  @ApiOkResponse({ description: 'Project updated' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiConflictResponse({ description: 'Slug already used' })
  // Update a project; sending images or tagIds replaces that list.
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user, id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish or unpublish one of your projects' })
  @ApiOkResponse({ description: 'Publish state updated' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  // Turn publishing on or off.
  setPublished(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: PublishProjectDto,
  ) {
    return this.projectsService.setPublished(user, id, dto.isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one of your projects' })
  @ApiOkResponse({ description: 'Project deleted' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  // Delete a project.
  remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.projectsService.remove(user, id);
  }
}
