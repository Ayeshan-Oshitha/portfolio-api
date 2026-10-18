---
name: commit-message
description: Produce one-line Conventional Commit messages with matching git add commands for Oshitha's current changes. Use when a step is finished, or when they ask for a commit message.
---

# commit-message

Oshitha runs git. Claude only suggests.

## Procedure
1. In this folder (`portfolio-api`, where the repo is), run read-only: `git status --short` and, if needed, `git diff --stat`.
2. Group the changes into logical commits (starter-code removal, config, a feature module, docs).
3. Output, in a code block:
   ```powershell
   git add <paths>
   git commit -m "type(scope): short description"
   ```
   one pair per commit. Also offer a single-commit alternative when there is more than one group.
4. Remind: run `git status` first and confirm `.env` is not staged (only `.env.example`).

## Format
`type(scope): imperative description`, lowercase, no period, ~72 characters max.
Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`, `build`.
Scopes: `config`, `health`, `prisma`, `auth`, `tags`, `articles`, `certificates`, `projects`, `services`, `career`, `profile`, `messages`, `uploads`, `mail`, `docs`, `web`.

## Notes
- A file touched by two logical changes goes in the later commit, or Oshitha can split it with `git add -p <file>`; mention this only when it matters.
- Separate migration/schema changes from module code when both exist.
- Never run `git add` or `git commit` yourself.
