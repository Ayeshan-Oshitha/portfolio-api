import {
  Injectable,
  StreamableFile,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { map, type Observable } from 'rxjs';
import { PaginatedResult } from '../responses/paginated-result.js';
import type { ApiPaginatedResponse, ApiSuccessResponse } from '../types/api-response.type.ts';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const isAuthRoute = request.path === '/api/auth' || request.path.startsWith('/api/auth/');

    if (isAuthRoute) {
      return next.handle();
    }

    return next.handle().pipe(
      map((result: unknown) => {
        const hasNoBody = response.statusCode === 204 || response.statusCode === 304;
        const isRedirect = response.statusCode >= 300 && response.statusCode < 400;

        if (hasNoBody || isRedirect || response.headersSent || result instanceof StreamableFile) {
          return result;
        }

        if (result instanceof PaginatedResult) {
          const body: ApiPaginatedResponse<unknown> = {
            success: true,
            data: result.data,
            meta: result.meta,
          };
          return body;
        }

        const body: ApiSuccessResponse<unknown> = { success: true, data: result ?? null };

        return body;
      }),
    );
  }
}
