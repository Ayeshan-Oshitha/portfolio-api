import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard.js';
import { ContactService } from './contact.service.js';
import { MarkReadDto } from './dto/mark-read.dto.js';

@ApiBearerAuth('bearerAuth')
@ApiTags('Admin messages')
@ApiUnauthorizedResponse({ description: 'Authentication required' })
@ApiForbiddenResponse({ description: 'Administrator access required' })
@UseGuards(AdminGuard)
@Controller('admin/messages')
export class AdminMessagesController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'List contact messages' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  })
  @ApiQuery({ name: 'unread', required: false, type: Boolean })
  @ApiOkResponse({ description: 'Paginated messages, newest first' })
  // List contact messages, optionally unread only.
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('unread', new ParseBoolPipe({ optional: true })) unread?: boolean,
  ) {
    return this.contactService.findAll(page, limit, unread);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread messages' })
  @ApiOkResponse({ description: '{ count }' })
  // Get the number of unread messages.
  unreadCount() {
    return this.contactService.unreadCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact message' })
  @ApiOkResponse({ description: 'Message' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  // Get one message.
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read or unread' })
  @ApiOkResponse({ description: 'Message updated' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  // Mark a message as read or unread.
  setRead(@Param('id') id: string, @Body() dto: MarkReadDto) {
    return this.contactService.setRead(id, dto.isRead);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact message' })
  @ApiOkResponse({ description: 'Message deleted' })
  @ApiNotFoundResponse({ description: 'Message not found' })
  // Delete a message.
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
