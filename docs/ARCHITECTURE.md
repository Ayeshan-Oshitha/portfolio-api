# Architecture

## Overview
```
 Visitors ──► portfolio-web (public pages) ──► /public/*  (open, GET only, published only)
 Oshitha  ──► portfolio-web (/admin)       ──► /admin/*   (session required, full CRUD)
                                                   │
                                           portfolio-api (NestJS)
                                      ┌────────────┼─────────────┐
                                 Neon Postgres   Neon Object    Resend
                                 (Prisma 7)      Storage (S3)   (email)
```
One NestJS app (modular monolith). One Vite app with `/` (portfolio) and `/admin/*` (CMS).

## Backend structure (`portfolio-api/src`)
```
main.ts          bootstrap, CORS, ValidationPipe, shutdown hooks, Swagger + Scalar
config/          zod env schema (validateEnv) + typed Env
prisma/          PrismaModule (global) + PrismaService (adapter-pg)
generated/       Prisma client output (git-ignored)
auth/            Better Auth instance + Nest wiring + AuthGuard
common/          guards, decorators, exception filter, slug util
health/          GET /health (also checks the database)
uploads/         S3 client + presigned upload URLs
tags/            technologies with logos
content/
  articles/ certificates/ projects/ services/ career/
profile/         single-row profile
messages/        contact-form inbox
mail/            Resend wrapper
```
Each content module: `x.module.ts`, `x.service.ts` (one service), `admin-x.controller.ts`, `public-x.controller.ts`, `dto/`.
- Admin controller at `/admin/x`, behind `AuthGuard`: CRUD plus `PATCH /:id/publish`.
- Public controller at `/public/x`: GET only, always filtered to `isPublished: true`.

## Data model (reference sketch; tables are added per feature)
- Better Auth tables: User, Session, Account, Verification
- **Tag**: name, slug (unique), iconSlug? (Simple Icons), iconUrl? (uploaded), color?
- **Article**: title, slug (unique), excerpt, content (md), coverImageUrl, isPublished, publishedAt, tags
- **Certificate**: title, issuer, issueDate, credentialUrl, fileUrl, isPublished, sortOrder
- **Project**: title, slug (unique), summary, content (md), repoUrl, liveUrl, coverImageUrl, isPublished, sortOrder, tags
- **Service**: title, description, features String[], iconSlug?/iconUrl?, isPublished, sortOrder
- **CareerEntry**: type (WORK|EDUCATION), role, organization, location, startDate, endDate?, description, isPublished, sortOrder
- **Profile** (one row): name, headline, bio, avatarUrl, resumeUrl, socialLinks Json
- **ContactMessage**: name, email, message, isRead, createdAt
- Tag ↔ Article and Tag ↔ Project: Prisma implicit many-to-many.
- Tags have no `isPublished`; they show up through the items that use them.

## Files and uploads
- Admin asks `POST /admin/uploads/presign` → gets a presigned PUT URL + the final public URL.
- Browser uploads straight to Neon Object Storage; the DB stores only the URL.
- S3 client needs `forcePathStyle: true`, SigV4. Bucket visibility (public read) is set in the Neon Console, not via the S3 API.
- Tag logos: prefer a Simple Icons slug; upload an SVG/PNG only when Simple Icons has none.

## Auth
Scope update (2026-10-18): public registration is now required. Oshitha is the admin; other accounts are ordinary users. Add admin-controlled PENDING/APPROVED/REJECTED status, defaulting new registrations to PENDING. Approval does not grant admin rights, and users cannot set their own role/status. The admin may change status later. Approved-user capabilities remain to be clarified before authorization is implemented. This supersedes the original sign-up-disabled description below.

Better Auth with Prisma adapter, email + password, `bearer` plugin, sign-up disabled. A seed script creates the single admin. NestJS wiring (community module vs. small custom controller + guard) is to be verified against current docs on Day 1.

## Environment variables (names only)
`NODE_ENV`, `PORT`, `DATABASE_URL` (pooled), `DIRECT_URL` (direct, migrations). Later: Better Auth secret and URL, storage endpoint/keys/bucket, Resend key, admin seed email/password, allowed CORS origins.

## Deployment (Day 8)
AWS Lambda Web Functions (US East Ohio, Node.js 24 Arm64). The app binds to `AWS_LAMBDA_HTTP_ENDPOINT` when set, else `PORT`. Fallback: Render/Railway. Frontend on Vercel/Netlify/S3+CloudFront. Neon pooled URL for the running app.

## Schedule
| Day | Focus |
|---|---|
| 1 | Setup + Auth (Prisma, Swagger + Scalar, Better Auth, seed admin) |
| 2 | Uploads + Tags + Articles |
| 3 | Certificates |
| 4 | Projects |
| 5 | Services + Career + Profile + Contact (Resend, throttler) |
| 6 | Frontend admin |
| 7 | Frontend portfolio (Figma) |
| 8 | Deploy + polish |
