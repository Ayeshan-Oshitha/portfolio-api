import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { MediaService } from './media.service.js';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto.js';
import { ConfirmMediaDto } from './dto/confirm-media.dto.js';

@ApiBearerAuth('bearerAuth')
@ApiTags('Media')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Approved account required' })
@UseGuards(ApprovedUserGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a presigned URL to upload a file directly to storage' })
  @ApiCreatedResponse({ description: 'Presigned PUT URL and object key' })
  // Get a presigned URL to upload a file directly to storage. The client can then use this URL to upload the file without going through the server.
  createUploadUrl(@CurrentUser() user: CurrentUserType, @Body() dto: CreateUploadUrlDto) {
    return this.mediaService.createUploadUrl(user, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Confirm an uploaded file and save it to the media library' })
  @ApiCreatedResponse({ description: 'Saved media with public URL' })
  @ApiNotFoundResponse({ description: 'File not found in storage' })
  // Confirm an uploaded file and save it to the media library.
  confirm(@CurrentUser() user: CurrentUserType, @Body() dto: ConfirmMediaDto) {
    return this.mediaService.confirm(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your own media' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiOkResponse({ description: 'Paginated media list' })
  // List your own media with pagination.
  findAll(
    @CurrentUser() user: CurrentUserType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.mediaService.findAll(user, page, limit);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a media file from storage and the library' })
  @ApiOkResponse({ description: 'Media deleted' })
  @ApiNotFoundResponse({ description: 'Media not found' })
  // Delete a media file from storage and the library.
  remove(@CurrentUser() user: CurrentUserType, @Param('id') id: string) {
    return this.mediaService.remove(user, id);
  }
}
