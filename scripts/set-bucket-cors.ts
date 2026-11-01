import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';

process.loadEnvFile('.env'); // Node 22+

const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',');

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

await s3.send(
  new PutBucketCorsCommand({
    Bucket: process.env.S3_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: origins,
          AllowedMethods: ['PUT', 'GET', 'HEAD'],
          AllowedHeaders: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  }),
);

console.log('CORS set for:', origins.join(', '));
console.log(
  JSON.stringify(
    (await s3.send(new GetBucketCorsCommand({ Bucket: process.env.S3_BUCKET }))).CORSRules,
    null,
    2,
  ),
);

// When you deploy, run it again with your real site address added:
// $env:CORS_ORIGINS = "http://localhost:5173,https://oshithacosta.com"; npx tsx scripts/set-bucket-cors.ts
