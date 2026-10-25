import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ContactService } from './contact.service.js';
import { PublicContactController } from './public-contact.controller.js';
import { AdminMessagesController } from './admin-messages.controller.js';

@Module({
  imports: [ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }])],
  controllers: [PublicContactController, AdminMessagesController],
  providers: [ContactService],
})
export class ContactModule {}
