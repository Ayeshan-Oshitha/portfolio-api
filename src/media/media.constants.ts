export const MEDIA_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
} as const;

export type MediaContentType = keyof typeof MEDIA_TYPES;
export const MEDIA_CONTENT_TYPES = Object.keys(MEDIA_TYPES) as MediaContentType[];
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024; // 10 MB
