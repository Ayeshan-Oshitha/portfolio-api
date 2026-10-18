# AGENTS.md: portfolio-api

Instructions for any coding agent (Codex, Claude Code, others) working in this repo.
This repo is the **NestJS backend** of a single-owner portfolio website with a private admin CMS. The frontend is the sibling folder `../portfolio-web` (starts Day 6).

**Read in this order:** this file → `docs/HANDOFF.md` (current state and next steps) → `docs/ARCHITECTURE.md` → `docs/DATA-MODELS.md` → `../PROGRESS.md` (overall checklist and log).
Rule files for detail: `.claude/rules/*.md`. Reusable procedures: `.claude/skills/*/SKILL.md` (next-step, add-content-module, commit-message, review-my-code). They are plain markdown and apply to any agent.

## Working agreement (overrides your defaults)
**The owner, Oshitha, writes all the code. The agent guides.**
- Do **not** create or edit code, config, `.env`, `package.json`, migrations or any non-markdown file. You may edit markdown only (`../PROGRESS.md`, `AGENTS.md`, `CLAUDE.md`, `docs/*.md`, `.claude/**/*.md`).
- You may run **read-only** commands to check the work: read files, `git status`, `git log`, `npm ls`, `npx tsc --noEmit`, `npx nest build`, `npx prisma validate`, calling `/health`. Don't run installs, migrations, `git add`/`commit`, or anything that changes the project; give Oshitha the command instead.
- Give **one step at a time**: goal in one line, numbered sub-steps (5.1, 5.2…), exact commands and full code (file path stated), what success looks like, likely failures. Then wait for the result.
- After each finished step: update `../PROGRESS.md` and give a **one-line Conventional Commit** message with matching `git add` commands (`type(scope): description`). Remind Oshitha to check that `.env` is not staged.
- Verify claims by looking (read the files, build, call the endpoint) before saying something works.
- Check **current documentation** for fast-moving libraries (Prisma 7, Better Auth, NestJS 12, AWS Lambda Web Functions, Scalar) and say plainly what is unverified. Don't guess from memory.
- Never ask for or print secrets (connection strings, keys, passwords). When checking `.env`, report key names and whether they have values, nothing more.
- Be direct and brief. Oshitha writes quickly with typos: interpret intent, don't comment on spelling. Explain *why* when introducing something new.
- If Oshitha's idea is wrong or risky, say so and explain. If they still decide otherwise, follow their decision.

## Stack
NestJS 12 (ESM, `"type": "module"`), TypeScript strict, Vitest, oxlint, Prettier · Prisma **7.x pinned** with `@prisma/adapter-pg` · Neon Postgres (project `Portfolio`, DB `portfoliodb`, AWS us-east-2) · Neon Object Storage (bucket `portfolio-media`, public read; S3 API with `forcePathStyle`) · Better Auth (email + password, `bearer` plugin, **sign-up disabled**) · Resend · `@nestjs/swagger` + Scalar at `/reference` · zod env validation · `@nestjs/throttler` on the public contact route.
Deploy (Day 8): AWS Lambda Web Functions (US East Ohio), fallback Render/Railway.

## Scope
Single owner. **No** multi-user, signups, approval flow or API keys. Content: Tags (technologies with logos), Articles, Certificates, Projects, Services, Career timeline, Profile, Contact messages. Every content item has `isPublished`. Full field list in `docs/DATA-MODELS.md`.

## API surface
- `/admin/*`: requires the Better Auth session (`AuthGuard`); full CRUD plus `PATCH /:id/publish`.
- `/public/*`: no auth, GET only (plus `POST /public/contact`), returns only `isPublished: true`, explicit fields.
- `/health`: open; also checks the database.
- Each content module has two controllers sharing one service: `AdminXController` and `PublicXController`.
- Uploads: admin requests a presigned PUT URL, the browser uploads directly to the bucket, the DB stores the URL.

## Code conventions
- **Imports must end in `.js`** (ESM). Cross-folder imports use the Node subpath alias `#src/...` (e.g. `import { X } from '#src/config/env.js';`); same-folder imports may stay relative (`./x.service.js`). The alias is declared in `package.json` `imports` (`"#src/*.js": { "source": "./src/*.ts", "default": "./dist/*.js" }`), `tsconfig.json` `customConditions: ["source"]`, and an explicit alias in both Vitest configs (Vitest ignores the `source` condition). `package.json` must be shipped next to `dist/` when deploying. Tested 2026-10-17 in a throwaway copy: tsc, nest build, node runtime and Vitest all work. Use top-level `await bootstrap();` in `main.ts`.
- Prettier: LF line endings, 2 spaces, single quotes, trailing commas, semicolons, width 100.
- Env: all variables validated in `src/config/env.ts` (zod) and listed in `.env.example`. Read through typed `ConfigService<Env, true>`. App uses pooled `DATABASE_URL`; Prisma CLI uses `DIRECT_URL` via `prisma7.config.ts`.
- Prisma: client generated to `src/generated/prisma` (git-ignored), imported from `../generated/prisma/client.js`. Install packages as `@7`. One migration per feature, named `add_<feature>`; run `npx prisma generate` after schema changes.
- Controllers do HTTP only, services hold logic and Prisma access; DTO classes with class-validator; global `ValidationPipe`; Swagger decorators on every route.
- Public queries filter `isPublished: true` **in the service**.
- File names `kebab-case.type.ts`; routes plural kebab-case.

## Environment notes
- Windows, PowerShell primary shell, paths contain spaces: `F:\Projects - Products\Portfolio\portfolio-api`.
- npm 12; install scripts are blocked by default (approve `prisma` and `@prisma/engines` only if needed).
- Git repo lives in this folder; `../PROGRESS.md` is outside it.
