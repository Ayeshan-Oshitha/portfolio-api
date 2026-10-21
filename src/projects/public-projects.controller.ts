import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ProjectsService } from './projects.service.js';

@AllowAnonymous()
@ApiTags('Public projects')
@Controller('public/projects')
export class PublicProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List published projects (featured first)' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 50, default: 12 },
  })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'tag', required: false, description: 'Tag slug, e.g. react' })
  @ApiOkResponse({ description: 'Paginated published projects (without description)' })
  // Get published projects, featured first.
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
    @Query('tag') tag?: string,
  ) {
    return this.projectsService.findPublished(page, limit, featured, tag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a published project' })
  @ApiOkResponse({ description: 'Published project with full description' })
  @ApiNotFoundResponse({ description: 'Project not found or not published' })
  // Get one published project with its full description and gallery.
  findOne(@Param('id') id: string) {
    return this.projectsService.findPublishedOne(id);
  }
}
