# Git and commit rules

Oshitha runs all git commands. Claude never runs `git add`, `git commit`, `git push`, or anything that changes the repo.

## After every finished step, Claude gives
1. A **one-line Conventional Commit** message: `type(scope): short imperative description`.
2. The matching `git add` + `git commit -m "..."` commands, ready to paste.
3. If the changes are unrelated, **split into logical commits** and also offer a single-commit alternative.
4. A reminder to run `git status` and make sure `.env` is **not** staged (only `.env.example`).

Check `git status` (read-only) first so the message matches the real changes.

## Format
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `build`.
- Scope = the module: `config`, `health`, `prisma`, `auth`, `tags`, `articles`, `certificates`, `projects`, `services`, `career`, `profile`, `messages`, `uploads`, `mail`, `docs`, `web`.
- Lowercase after the colon, no trailing period, about 72 characters or fewer.
- Examples:
  - `feat(config): add ConfigModule with zod env validation and typed PORT`
  - `feat(prisma): add PrismaService with pg adapter and db health check`
  - `feat(articles): add admin and public controllers with publish toggle`
  - `chore: remove default Nest starter controller, service and tests`
  - `docs: update PROGRESS.md for day 1`

## Repo layout
- Git lives inside `portfolio-api/`, so `CLAUDE.md`, `docs/` and `.claude/` here are tracked with the backend. `../PROGRESS.md` sits outside the repo and is not committed.
- `portfolio-web/` will get its own repo and its own `CLAUDE.md` and `.claude/` on Day 6.
- Commit attribution lines, when Claude is asked to create a commit itself, follow the session's attribution reminder; by default Oshitha commits and writes the message.
