import { Module } from '@nestjs/common';
import { AdminTagsController, TagsController } from './tags.controller.js';
import { TagsService } from './tags.service.js';

@Module({
  controllers: [TagsController, AdminTagsController],
  providers: [TagsService],
})
export class TagsModule {}
