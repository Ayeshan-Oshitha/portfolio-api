# Access control

## Current model — used by one person, multi-user ready (decided 2026-10-21)

Oshitha is the only person using the CMS for now. The multi-user code from 2026-10-18 is **kept as-is** so multi-user can be switched on later without a rewrite.

- Code stays: approval status (PENDING/APPROVED/REJECTED), `ApprovedUserGuard`, `AdminGuard`, `/admin/users` endpoints, `ownerId` on content, owner-scoped queries.
- Owner (admin role) passes `ApprovedUserGuard` automatically, so day-to-day it behaves like a single-owner CMS.
- Recommended: public sign-up turned off (`disableSignUp: true` in `src/auth/auth.ts`) until multi-user is wanted. Flip back to `false` to reopen registration.
- Regular content routes (`/media`, `/articles`) are owner-only for everyone, admin included. Admin "see all" routes (`/admin/...`) are deferred until multi-user is needed.
- Public routes: `/tags`, `/public/articles`, `/public/articles/:id` — read-only, published-only. Public articles are addressed by ID.
- New content modules keep the same pattern: `ownerId` set from the session, queries scoped by `ownerId`, `ApprovedUserGuard` on CMS routes.

## Rules for when multi-user is turned on

| Account | Manage content | View/manage other users | Change approval status |
|---|---|---|---|
| Admin (Oshitha) | Own content via normal routes; all content via future `/admin/...` routes | Yes | Yes |
| APPROVED user | Own content only | No | No |
| PENDING or REJECTED user | None | No | No |

- Set `ownerId` from the session, never from the request body.
- Users must not attach or delete another owner's media.
- Profile becomes one per owner (`ownerId` unique) when built.

## History

- 2026-10-16: single owner, sign-up disabled.
- 2026-10-18: public registration with approval and owner-scoped content (built with Codex).
- 2026-10-21: used as single owner; multi-user code kept for the future.
