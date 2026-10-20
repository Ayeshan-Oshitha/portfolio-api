import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import type { Env } from '../config/env.js';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(config: ConfigService<Env, true>) {
    this.bucket = config.get('AWS_S3_BUCKET', { infer: true });
    this.publicUrl = config.get('AWS_S3_PUBLIC_URL', { infer: true });
    this.s3 = new S3Client({
      endpoint: config.get('AWS_ENDPOINT_URL_S3', { infer: true }),
      region: config.get('AWS_REGION', { infer: true }),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY', { infer: true }),
      },
    });
  }

  // Unique object key per user, e.g. "users/<userId>/<uuid>.png".
  public buildKey(userId: string, extension: string): string {
    const ext = extension.replace(/^\./, '').toLowerCase();
    return `users/${userId}/${randomUUID()}.${ext}`;
  }

  // Short-lived URL the browser uses to PUT the file directly to storage.
  public async createUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  public async deleteObject(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  public getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
