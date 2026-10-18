import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEnum } from 'class-validator';
import { ApprovalStatus } from '../../generated/prisma/enums.js';

export class UpdateApprovalStatusDto {
  @ApiProperty({
    enum: ApprovalStatus,
    example: ApprovalStatus.APPROVED,
    description: 'New account approval status',
  })
  @IsDefined()
  @IsEnum(ApprovalStatus)
  approvalStatus!: ApprovalStatus;
}
