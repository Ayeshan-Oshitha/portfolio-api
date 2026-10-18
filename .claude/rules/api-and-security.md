# API design and security rules

> Current access requirements (2026-10-18): approved users manage only their own content; only Oshitha as admin can manage all content, view other users, and change approval status. See docs/ACCESS-CONTROL.md (relative to the backend root). This supersedes historical single-owner and unresolved-permission statements below.

## Two surfaces
Scope update (2026-10-18): public registration is required; the older sign-up-disabled rule below is superseded. Ordinary users start PENDING; the admin controls APPROVED/REJECTED/PENDING changes. Approval never grants admin rights. Protect admin operations by role, and approved-only operations by current approval status on each request so status reversals affect existing sessions. Approved-user capabilities still need clarification before those routes are implemented.

| Surface | Path | Auth | Methods | Data |
|---|---|---|---|---|
| Admin | `/admin/*` | Better Auth session (`AuthGuard`) | full CRUD + publish toggle | everything |
| Public | `/public/*` | none | GET only (plus `POST /public/contact`) | `isPublished: true` only |

- Anything not under `/public/*` or `/health` requires authentication. Default to guarded.
- Auth routes live under Better Auth's own path (e.g. `/api/auth/*`); **sign-up is disabled**. The single admin is created by a seed script.

## Public API rules
- Always filter `isPublished: true` in the **service** (not just the controller), so an unpublished item can never leak.
- Return explicit fields; never spread whole DB rows.
- Include related tags with their icon data (`iconSlug`, `iconUrl`, `color`).
- Sort by `sortOrder` then date, as appropriate.
- CORS: restrict `/public/*` to the portfolio's origin(s) via an env var; admin origin separately.
- `POST /public/contact`: rate-limited with `@nestjs/throttler`, validated, saved to `ContactMessage`, emailed through Resend. Return 429 on abuse.

## Admin API rules
- `PATCH /admin/<resource>/:id/publish` toggles `isPublished`; set `publishedAt` for articles when first published.
- Create/update DTOs validate every field; reject unknown fields.
- Slug conflicts return 409 with a clear message.

## Uploads
- Never proxy file bytes through the API. Admin requests a **presigned PUT URL**; browser uploads to storage; DB stores the final public URL.
- Allow-list content types (images, SVG, PDF) and cap size. Generate object keys server-side (e.g. `articles/<uuid>.webp`), never trust client filenames.
- The bucket is public read; **nothing private goes in it**.

## Secrets
- Secrets live only in `.env` (git-ignored) and in the hosting platform's env settings.
- Never log secrets, connection strings, or tokens. Never echo them in chat.
- Cookies/sessions: secure, httpOnly, sameSite per Better Auth defaults for cross-origin use; verify when wiring the admin frontend.

## Documentation
- Swagger decorators on every controller route (`@ApiTags`, `@ApiOperation`, response types). Scalar renders it at `/reference`.
- Keep the OpenAPI doc accurate; it is the contract the frontend is built against.
