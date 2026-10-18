---
name: review-my-code
description: Read-only review of the code Oshitha has written so far against the project rules, reporting problems with exact file and line and the fix to type. Use when they ask "is my code correct", "check my files", or before moving to the next day.
---

# review-my-code

Review without editing. Oshitha applies the fixes.

## Procedure
1. List what changed: `git status --short` (in `portfolio-api`), then read the relevant files in full. Never print `.env` values; check key names only.
2. Run read-only checks: `npx tsc --noEmit`, `npx nest build`, and `npm ls` when versions matter.
3. If it's runnable, briefly boot it, call `/health` (and any new route), then stop the process.
4. Compare against `.claude/rules/backend-conventions.md` and `.claude/rules/api-and-security.md`.

## What to look for
- **Breaks startup**: env name mismatches between `.env`, `.env.example`, and `env.ts`; wrong zod checks (e.g. `postgres://` vs `postgresql://`); module not registered; missing `.js` import endings.
- **Security**: unguarded admin routes, public queries missing `isPublished: true`, secrets in code or logs, `.env` not ignored.
- **Pattern drift**: service logic in controllers, direct `process.env` use, missing DTO validation, missing Swagger decorators.
- **Dead code**: leftover starter files, unused imports.
- **Prisma**: unpinned version (should be 7.x), client output path, wrong URL used for the adapter vs CLI.

## Report format
Short table: `Severity | File:line | Problem | Fix`. Severity = ❌ breaks / ⚠️ should fix / 🧹 cleanup. Then a list of what is already correct. Give the exact code to type for each fix. End with the recommended next step.
