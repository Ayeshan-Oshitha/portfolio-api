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
import { ArticlesService } from './articles.service.js';
import { CreateArticleDto } from './dto/create-article.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';
import { PublishArticleDto } from './dto/publish-article.dto.js';

@ApiBearerAuth('bearerAuth')
@ApiTags('Articles')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Approved account required' })
@UseGuards(ApprovedUserGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an article (draft)' })
  @ApiCreatedResponse({ description: 'Article created' })
  @ApiBadRequestResponse({ description: 'Invalid body, cover or tags' })
  @ApiConflictResponse({ description: 'Slug already used' })
  // Create a new draft article.
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateArticleDto) {
    return this.articlesService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your articles' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  })
  @ApiOkResponse({ description: 'Paginated list of your articles' })
  // List your own articles.
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.articlesService.findAll(user, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of your articles' })
  @ApiOkResponse({ description: 'Article' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  // Get one of your articles.
  findOne(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.articlesService.findOne(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of your articles' })
  @ApiOkResponse({ description: 'Article updated' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiConflictResponse({ description: 'Slug already used' })
  // Update an article; sending tagIds replaces its tags.
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(user, id, dto);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish or unpublish one of your articles' })
  @ApiOkResponse({ description: 'Publish state updated' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  // Turn publishing on or off.
  setPublished(
    @CurrentUser() user: CurrentUserType,
    @Param('id') id: string,
    @Body() dto: PublishArticleDto,
  ) {
    return this.articlesService.setPublished(user, id, dto.isPublished);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete one of your articles' })
  @ApiOkResponse({ description: 'Article deleted' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  // Delete an article.
  remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.articlesService.remove(user, id);
  }
}
