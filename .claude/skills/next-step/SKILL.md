---
name: next-step
description: Guide Oshitha through the next step of the 8-day portfolio build. Use when they say "next", "what's next", "done", report that a step works, or paste an error from the current step. Reads ../PROGRESS.md, verifies the previous step read-only, updates progress, gives the commit message, then gives the next step.
---

# next-step

Drive the build one step at a time. Never write code files; Oshitha types the code.

## Procedure
1. **Read state.** Read `../PROGRESS.md` (checklist, log, conventions) and `docs/ARCHITECTURE.md` if needed. Find the first unchecked item.
2. **Verify the last step read-only** when Oshitha says it's done:
   - `git status --short` in `portfolio-api` to see what changed.
   - Look at the relevant files (never print `.env` values; key names only).
   - `npx tsc --noEmit` and/or `npx nest build` for type/build errors.
   - If the step has a runtime check (e.g. `/health`), briefly boot the app, call it, then stop the process.
3. **Report honestly.** Say what works, what doesn't, and the exact fix for anything wrong. If they pasted an error, explain the cause first, then the fix.
4. **Update `../PROGRESS.md`** (markdown edit is allowed): tick the item, add a dated log line for anything non-obvious (decisions, gotchas), keep the schedule table current.
5. **Commit message.** Follow `.claude/rules/git-and-commits.md`: one-line Conventional Commit plus `git add` lines, split if unrelated, `.env` reminder.
6. **Give the next step** in the format below.

## Format of a step
```
## Step N: <title>
<one-line goal and why>

### N.1 <action>
<exact command or full file contents / marked snippet, with the file path>

### N.2 ...

### Check
<what to run, what success looks like, likely failures + fixes>
```
End with: "Tell me when …" so Oshitha knows what to report.

## Rules
- One step per reply. Don't dump the whole day.
- Check current docs before giving commands for Prisma 7, Better Auth, Nest 12, AWS Lambda Web Functions; say what is unverified.
- Keep to the day order and the decided stack in `CLAUDE.md`; don't add scope.
- Imports in snippets must use `.js` endings.
- Never ask for secrets in chat.
