# Handoff: where the project stands

## Latest continuation snapshot — 2026-10-18

This snapshot supersedes the historical state and single-owner scope below. Read `AGENTS.md` and `docs/ACCESS-CONTROL.md` from the backend root first.

- PrismaService, global module, lifecycle hooks and database health query are implemented. Health previously verified against Neon `portfoliodb`.
- Swagger/Scalar is configured at `/api/docs`, using the default theme with dark mode. Health OpenAPI documentation still describes the old raw response and needs to match the new envelope.
- Better Auth 1.7.10 and `@thallesp/nestjs-better-auth` 2.8.0 installed. `src/auth/auth.ts` exports `createAuth(config, prisma)`, using the Prisma adapter, email/password public signup, admin and bearer plugins, default ordinary-user role and PENDING approval status (`input: false`). Environment keys are validated; do not print secrets.
- `better-auth.cli.ts` exports the CLI auth instance. Initial `init_auth` migration applied. One admin-role account was confirmed by a read-only count; actual login testing remains pending.
- `ApprovalStatus` Prisma enum added. Pending migration `20261018115351_add_approval_status_enum` was changed before application to use a transactional in-place cast preserving existing statuses. Owner subsequently ran migration status and reported both migrations applied, database up to date. Generated enums import from `../generated/prisma/enums.js`.
- AuthModule uses `forRootAsync`, injecting existing ConfigService and PrismaService. `main.ts` sets `bodyParser: false`; the integration supplies non-auth parsing. Health uses `@AllowAnonymous()`.
- ApprovedUserGuard reads current account role/status from Prisma and permits admin or APPROVED ordinary users; rejects banned accounts. AdminGuard extends it and requires the admin role. Guards are attached to verification endpoints `GET /access/content` and `GET /access/admin`. AdminGuard's `@Injectable()` was added. Current ban check uses the banned flag only, without checking ban expiry.
- `src/common/` contains response types, PaginatedResult, ApiException, ApiResponseInterceptor and ApiExceptionFilter. Interceptor/filter registered globally through APP_INTERCEPTOR/APP_FILTER. Own JSON responses use `{ success: true, data, meta? }` or `{ success: false, error: { code, message, details } }`; Better Auth is excluded. Error codes are general (FORBIDDEN, UNAUTHORIZED, etc.), not auth-specific. ApiException uses `errorCode`; existing guards may use standard Nest exceptions. Do not manually wrap controller results.
- TypeScript checking passed before the last suggested commit. At that point the app was unreachable for assistant runtime checks; owner has now reported the response checks work and protected routes return Unauthorized while logged out. Do not claim authenticated role/approval tests have passed.
- `LEARNING.md` at the backend root is the owner's notebook for commands/concepts. Add future learning notes there when requested.

### Next task

Guide the owner through admin-only user management, starting with the users service and `GET /admin/users` (paginated, explicit safe fields), then `PATCH /admin/users/:id/approval-status` with validation and AdminGuard. Do not expose password hashes, session tokens or other users to ordinary users. Keep admin role and approval separate, and preserve access for the owner. Approved users manage ONLY their own content; admin can manage all content and users. Add ownerId and scoped queries when content modules are built. Public URL/owner selection still needs a decision before public content routes are implemented.

### Working agreement for the new chat

Oshitha writes application code. Provide exact code and commands one step at a time; agents edit markdown and perform read-only verification. The sole code-edit exception is explicitly requested Swagger/Scalar documentation work, after presenting exact changes and receiving explicit approval after review. Agent never runs installs, migrations or Git mutations by default. Offer commit commands after completed steps; user runs them. Check actual Git status before proposing paths. The user said they would commit response work, but the commit itself was not verified. `../PROGRESS.md` is outside the backend Git repo.

> Current access requirements (2026-10-18): approved users manage only their own content; only Oshitha as admin can manage all content, view other users, and change approval status. See docs/ACCESS-CONTROL.md (relative to the backend root). This supersedes historical single-owner and unresolved-permission statements below.

Written 2026-10-17 so another coding agent (Codex) can continue. Read `../AGENTS.md` first (working rules), then this file, then `ARCHITECTURE.md` and `DATA-MODELS.md`. The overall checklist is `../../PROGRESS.md`.

## What this is
Scope update (2026-10-18): public registration with ordinary users and admin-controlled PENDING/APPROVED/REJECTED status replaces the original single-account/no-sign-up plan below. Oshitha is the admin and can reverse status decisions. Approved-user permissions still need clarification; approval must not grant admin rights. Follow current `AGENTS.md` over historical decisions below.

A single-owner portfolio website with a private admin CMS. The owner (Oshitha) is the only user. Backend = this repo (`portfolio-api`, NestJS). Frontend (`../portfolio-web`, Vite + React) starts on Day 6 and is still empty. 8-day plan, started 2026-10-16.

## How the owner wants to work (important)
- **Oshitha writes the code. The agent guides:** gives the next step, exact commands and full code in chat, one step at a time, and waits for the result. By default the agent edits **markdown files only** and runs **read-only** checks. Exception added 2026-10-18: for an explicitly requested Swagger/Scalar documentation code change, show the exact proposed edits with file paths, wait for Oshitha's explicit approval after review, then apply only the approved documentation changes. No standing permission or runtime API/business-logic changes. See `../.claude/rules/guide-only-workflow.md` for the scope and procedure.
- After each finished step: update `../PROGRESS.md`, then give a **one-line Conventional Commit message** with matching `git add` commands. Oshitha runs git.
- Never ask for secrets in chat. Check current docs before giving commands for fast-moving libraries and say what is unverified.
- Oshitha writes fast with typos; interpret intent. Explain new concepts briefly (they are learning).

## Done
| Item | State |
|---|---|
| Neon project `Portfolio`, DB `portfoliodb`, AWS us-east-2 | ✅ created; `.env` has `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) |
| Neon bucket `portfolio-media` (public read) | ✅ created; storage access keys **not yet created** (Day 2) |
| NestJS 12 app (ESM, Vitest, oxlint, Prettier) | ✅ |
| Formatting: `.gitattributes` (LF), `.editorconfig`?, `.prettierrc` | ✅ (verify `.editorconfig` exists) |
| Config module + zod env validation (`src/config/env.ts`) | ✅ committed |
| `GET /health` | ✅ committed (returns status only so far) |
| Starter Nest files removed | ✅ committed |
| Prisma 7.10.1 installed (pinned), `prisma/schema.prisma`, `prisma7.config.ts` (uses `env('DIRECT_URL')`), client generated into `src/generated/prisma` | ✅ (`/src/generated/prisma` is git-ignored) |
| Claude/agent guidance files (`CLAUDE.md`, `.claude/`, `docs/`) | ✅ not yet committed |

Git: one commit so far beyond the initial one (`feat: set up env validation with zod and add health endpoint, remove starter code`). Uncommitted: `.gitignore`, `package.json`, `package-lock.json`, `prisma/`, `prisma7.config.ts`, `src/prisma/`, docs and agent files.

## In progress: Day 1, step 5 (Prisma 7 + PrismaService)
Current state of the files:
- `src/prisma/prisma.service.ts` exists but contains **only the import lines**. The class is not written yet.
- `src/prisma/prisma.module.ts` does **not** exist yet.
- `PrismaModule` is **not** registered in `src/app.module.ts`.
- `app.enableShutdownHooks()` is **not** in `src/main.ts`.
- `src/health/health.controller.ts` does **not** yet inject PrismaService or run `SELECT 1`.

Remaining sub-steps (give them one at a time):
1. Write `PrismaService`: `extends PrismaClient implements OnModuleInit, OnModuleDestroy`; constructor takes `ConfigService<Env, true>`, builds `new PrismaPg({ connectionString: config.get('DATABASE_URL', { infer: true }) })`, calls `super({ adapter })`; `onModuleInit` → `$connect()`, `onModuleDestroy` → `$disconnect()`. Import the client from `../generated/prisma/client.js`.
2. `PrismaModule`: `@Global()`, provides and exports `PrismaService`.
3. Register `PrismaModule` in `AppModule` imports.
4. `app.enableShutdownHooks()` in `main.ts`.
5. Health check: inject `PrismaService`, `await this.prisma.$queryRaw\`SELECT 1\``, return `{ status: 'ok', db: 'connected', timestamp }`.
6. Run `npm run start:dev`, open `/health`, expect `"db": "connected"`. Then give the commit message (e.g. `feat(prisma): add PrismaService with pg adapter and db health check`).

## Next (rest of Day 1)
- Step 6: Swagger + Scalar at `/reference` (`@nestjs/swagger`, `@scalar/nestjs-api-reference`; the Scalar package must be checked against its current docs).
- Step 7: Better Auth with the Prisma adapter and `bearer` plugin; generate its tables with the Better Auth CLI; migration `init_auth`. **Verify how Better Auth plugs into NestJS** (community module such as `nestjs-better-auth`, or a small custom controller + guard) against current docs; this was deliberately left unverified.
- Step 8: disable sign-up, `AuthGuard`, seed script for the single admin, test login in Scalar.
Then Day 2 onward as in `ARCHITECTURE.md` and `../../PROGRESS.md`.

## Decisions already made (do not re-litigate)
- Single owner. No multi-user, signups, approval flow or API keys (the owner narrowed scope from an earlier multi-user idea).
- Prisma 7 pinned, with `@prisma/adapter-pg`; Neon Postgres; Neon Object Storage for files; Better Auth (not Keycloak/Clerk, not Neon Auth); Resend for mail; Swagger + Scalar.
- Tags = technologies with logos (Simple Icons slug + color, or an uploaded icon), used by Projects and Articles only. Services have title, description, features list and an icon.
- Day order: 1 Setup+Auth · 2 Uploads+Tags+Articles · 3 Certificates · 4 Projects · 5 Services+Career+Profile+Contact · 6 Admin UI · 7 Portfolio UI (Figma, link still needed) · 8 Deploy.
- Tables added per feature, one migration each.
- Deploy target: AWS Lambda Web Functions (launched 2026-10-12, US East Ohio, Node.js 24 Arm64; app binds to `AWS_LAMBDA_HTTP_ENDPOINT`), fallback Render/Railway. Free tier for Web Functions is **unconfirmed** (confirmed only for Event Functions); set an AWS Budget alert.
- Relative imports (no path aliases) for now. `#` subpath imports are a possible later option.

## Gotchas already hit (save yourself the time)
- **npm 10 crashed** with `Cannot read properties of null (reading 'edgesOut')` on the generated Nest 12 deps; fixed by upgrading npm (the machine now has npm 12.2.0) or `--legacy-peer-deps`.
- **Relative imports need `.js`** endings (ESM), even though files are `.ts`.
- **Env names:** `.env` uses `DATABASE_URL` and `DIRECT_URL`. A mismatch with `env.ts` (`DATABASE_URL_DIRECT`) and `startsWith('postgres://')` (Neon URLs start with `postgresql://`) both previously blocked startup; both are fixed (`startsWith('postgres')`, `DIRECT_URL`).
- **Prisma:** the npm `latest` tag points to a Prisma 8 pre-release, so always install `@7`. `prisma init` created `prisma7.config.ts` (not `prisma.config.ts`) and the CLI picks it up automatically. `dotenv` is a dev dependency used only by that file. `pg` comes through `@prisma/adapter-pg`. `migrate dev` does not run `generate`.
- **npm 12 blocks install scripts** by default; `prisma` and `@prisma/engines` scripts are blocked but the schema engine binary is present. If Prisma complains, run `npm install-scripts approve prisma @prisma/engines`.
- 5 dev-tooling audit warnings exist; `npm audit --omit=dev` shows 0. Do not run `npm audit fix --force`.
- Neon Object Storage: S3-compatible but partial. Presigned GET/PUT and multipart work; bucket policy/ACL writes do not. Needs `forcePathStyle: true`, SigV4. Bucket visibility is set in the Neon console. Beta, us-east-2 only. Free storage cap for the bucket is unconfirmed (Postgres free plan is 1 GB).
- Resend free plan: 3,000 emails/month, 100/day, 1 domain.
- The primary Windows shell is PowerShell; paths contain spaces (`F:\Projects - Products\Portfolio`).

## Open items
- Figma link for the portfolio design (needed by Day 7).
- Confirm ID strategy (`cuid()` proposed) before the first content migration.
- Decide whether to commit `../PROGRESS.md` (it sits outside the repo).
- Commit the uncommitted work listed above once step 5 works.
