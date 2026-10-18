import { Catch, HttpException, HttpStatus, Logger, type ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request, Response } from 'express';
import { ApiException } from '../exceptions/api.exception.js';
import type {
  ApiErrorCode,
  ApiErrorResponse,
  ApiValidationDetail,
} from '../types/api-response.type.js';

const statusCodes: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

@Catch()
export class ApiExceptionFilter extends BaseExceptionFilter {
  private readonly responseLogger = new Logger(ApiExceptionFilter.name, { timestamp: true });

  constructor(httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() != 'http') {
      super.catch(exception, host);
      return;
    }

    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const isAuthRoute = request.path === '/api/auth' || request.path.startsWith('/api/auth/');

    if (isAuthRoute) {
      super.catch(exception, host);
      return;
    }

    if (response.headersSent) {
      response.end();
      return;
    }

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let code: ApiErrorCode = statusCodes[status] ?? 'HTTP_ERROR';
    let message = 'Request failed';
    let details: ApiValidationDetail[] | null = null;

    if (status >= 500) {
      message = 'An unexpected server error occurred';

      // Log the error type without exposing database messages or secrets.
      this.responseLogger.error({
        status,
        errorType: exception instanceof Error ? exception.name : 'UnknownError',
      });
    } else if (exception instanceof ApiException) {
      code = exception.errorCode;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      const payload: unknown = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (isRecord(payload)) {
        if (typeof payload.message === 'string') {
          message = payload.message;
        } else if (isStringArray(payload.message)) {
          message = payload.message.join('; ');

          if (status === HttpStatus.BAD_REQUEST) {
            code = 'VALIDATION_ERROR';
          }
        }
      }
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };

    response.status(status).json(body);
  }
}
