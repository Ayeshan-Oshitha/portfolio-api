import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';
import { PublicArticlesController } from './public-articles.controller.js';

@Module({
  controllers: [ArticlesController, PublicArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
