import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { ContactService } from './contact.service.js';
import { CreateContactMessageDto } from './dto/create-contact-message.dto.js';

@AllowAnonymous()
@ApiTags('Public contact')
@UseGuards(ThrottlerGuard)
@Controller('public/contact')
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
  @ApiOperation({ summary: 'Send a contact message' })
  @ApiOkResponse({ description: 'Message received' })
  @ApiBadRequestResponse({ description: 'Invalid form data' })
  @ApiTooManyRequestsResponse({ description: 'Too many messages, try again later' })
  // Receive a message from the portfolio contact form.
  submit(@Body() dto: CreateContactMessageDto, @Req() req: Request) {
    return this.contactService.submit(dto, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
  }
}
