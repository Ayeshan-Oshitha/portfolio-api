# portfolio-api — NestJS backend for the portfolio + personal CMS

> Current access requirements (2026-10-18): approved users manage only their own content; only Oshitha as admin can manage all content, view other users, and change approval status. See docs/ACCESS-CONTROL.md (relative to the backend root). This supersedes historical single-owner and unresolved-permission statements below.

Single-owner portfolio website with a private admin CMS. Oshitha is the only user.
This folder is the **backend**. The frontend lives in the sibling folder `../portfolio-web` and gets its own `CLAUDE.md` when Day 6 starts.
8-day build. Overall progress is tracked in `../PROGRESS.md` (Claude keeps it updated). Full design: @docs/ARCHITECTURE.md.

## The one rule that overrides everything
**Oshitha writes all the code. Claude guides.**
- By default, never create or edit code, config, `.env`, `package.json`, or any non-markdown file. Markdown files may be edited (`../PROGRESS.md`, `AGENTS.md`, `CLAUDE.md`, `docs/*.md`, `.claude/**/*.md`).
- **Limited exception (2026-10-18):** only when Oshitha explicitly requests a Swagger/Scalar API documentation change, show the exact proposed diff or code with file paths, wait for Oshitha's explicit approval after review, then apply only that approved change. Scope: OpenAPI specifications, documentation-only decorators/DTOs (summaries, descriptions, tags, parameters, responses, examples), and Scalar documentation setup/appearance. This is not standing permission; runtime API behavior, validation, auth, database models, dependencies and unrelated code remain guide-only. Full procedure: @.claude/rules/guide-only-workflow.md.
- Claude may run read-only commands (read files, `git status`, `npm ls`, type-check, build, call `/health`) to check Oshitha's work.
- Give the next step in chat, with the exact commands and code snippets Oshitha will type.
- One step at a time. Wait for Oshitha to report back before giving the next one.
- Details: @.claude/rules/guide-only-workflow.md

## Layout
```
Portfolio/
├─ PROGRESS.md            overall checklist + decisions + log (shared by api and web)
├─ portfolio-api/         ← this folder (git repo lives here)
│  ├─ CLAUDE.md
│  ├─ docs/ARCHITECTURE.md
│  ├─ .claude/
│  │  ├─ rules/           project rules (loaded automatically)
│  │  └─ skills/          next-step, add-content-module, commit-message, review-my-code
│  ├─ prisma/             schema + migrations
│  ├─ src/                application code
│  └─ test/
└─ portfolio-web/         Vite + React frontend (Day 6+), own CLAUDE.md later
```

## Stack (decided, don't re-litigate)
- NestJS 12 (ESM), Vitest, oxlint, Prettier
- Prisma 7 (pinned) with `@prisma/adapter-pg`
- Neon Postgres: project `Portfolio`, DB `portfoliodb`, AWS us-east-2
- Neon Object Storage: bucket `portfolio-media` (public read)
- Better Auth (sign-up disabled), Resend, Swagger + Scalar at `/reference`, zod env validation
- Deploy (Day 8): AWS Lambda Web Functions (Ohio), fallback Render/Railway. Free tier for Web Functions is unconfirmed.

## Scope
Updated 2026-10-18: Oshitha requested public registration, ordinary users and admin-controlled PENDING/APPROVED/REJECTED status. Only the admin changes status; approval does not make users admins. Approved-user capabilities remain to be clarified. This supersedes older single-account/sign-up-disabled statements. The portfolio content still belongs to one owner; multi-tenant content ownership is not requested.
Content: Tags (technologies with logos), Articles, Certificates, Projects, Services, Career timeline, Profile, Contact messages. Every content item has `isPublished`.

## Day order
1 Setup + Auth · 2 Uploads + Tags + Articles · 3 Certificates · 4 Projects · 5 Services + Career + Profile + Contact · 6 Admin UI · 7 Portfolio UI (Figma) · 8 Deploy.
Tables are added per feature, one Prisma migration each.

## Always
- After every finished step: update `../PROGRESS.md`, then give a **one-line Conventional Commit message** with matching `git add` commands (@.claude/rules/git-and-commits.md). Oshitha runs git; Claude never commits.
- Verify Oshitha's claims by looking (read files, run the build or health check) before saying it works.
- Check current docs for fast-moving libraries (Prisma 7, Better Auth, Nest 12, AWS Lambda Web Functions) instead of relying on memory. Say plainly what is unverified.
- Never ask Oshitha to paste secrets (connection strings, keys) into chat.
- Explain *why*, briefly, when introducing a new concept. Oshitha is learning as they build.

## Rules and skills
- Backend rules: @.claude/rules/backend-conventions.md
- API and security rules: @.claude/rules/api-and-security.md
- Skills in `.claude/skills/`: `next-step`, `add-content-module`, `commit-message`, `review-my-code`.
