import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller.js';
import { PublicServicesController } from './public-services.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  controllers: [ServicesController, PublicServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
