import { HttpException } from '@nestjs/common';
import type { ApiErrorCode, ApiValidationDetail } from '../types/api-response.type.ts';

export class ApiException extends HttpException {
  constructor(
    statusCode: number,
    public readonly errorCode: ApiErrorCode,
    message: string,
    public readonly details: ApiValidationDetail[] | null = null,
  ) {
    super(
      {
        code: errorCode,
        message: message,
        details: details,
      },
      statusCode,
    );
  }
}
