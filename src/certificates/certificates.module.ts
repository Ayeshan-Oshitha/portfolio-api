import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller.js';
import { PublicCertificatesController } from './public-certificates.controller.js';
import { CertificatesService } from './certificates.service.js';

@Module({
  controllers: [CertificatesController, PublicCertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
