import type { PaginationMeta } from '../types/api-response.type.ts';

export class PaginatedResult<T> {
  constructor(
    public readonly data: T[],
    public readonly meta: PaginationMeta,
  ) {}
}
