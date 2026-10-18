# Handoff: where the project stands

Written 2026-10-17 so another coding agent (Codex) can continue. Read `../AGENTS.md` first (working rules), then this file, then `ARCHITECTURE.md` and `DATA-MODELS.md`. The overall checklist is `../../PROGRESS.md`.

## What this is
A single-owner portfolio website with a private admin CMS. The owner (Oshitha) is the only user. Backend = this repo (`portfolio-api`, NestJS). Frontend (`../portfolio-web`, Vite + React) starts on Day 6 and is still empty. 8-day plan, started 2026-10-16.

## How the owner wants to work (important)
- **Oshitha writes all the code. The agent guides:** gives the next step, exact commands and full code in chat, one step at a time, and waits for the result. The agent edits **markdown files only** and runs **read-only** commands to verify the work.
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
