import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ArticlesService } from './articles.service.js';

@AllowAnonymous()
@ApiTags('Public articles')
@Controller('public/articles')
export class PublicArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'List published articles' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
  })
  @ApiQuery({ name: 'tag', required: false, description: 'Tag slug, e.g. react' })
  @ApiOkResponse({ description: 'Paginated published articles (without content)' })
  // Get published articles from all users, newest first.
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('tag') tag?: string,
  ) {
    return this.articlesService.findPublished(page, limit, tag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a published article' })
  @ApiOkResponse({ description: 'Published article with full content' })
  @ApiNotFoundResponse({ description: 'Article not found or not published' })
  // Get one published article with its full Markdown content.
  findOne(@Param('id') id: string) {
    return this.articlesService.findPublishedOne(id);
  }
}
