# Roles, approval and content ownership

Confirmed by Oshitha on 2026-10-18. This replaces the original single-owner/no-sign-up plan and the earlier unresolved approved-user permissions. These are requirements, not a claim that authorization has been implemented.

## Access rules

| Account | Manage content | View/manage other users | Change approval status |
|---|---|---|---|
| Admin (Oshitha) | All owners' content | Yes | Yes |
| APPROVED user | Own content only: create, list, read, update, delete and publish | No | No |
| PENDING or REJECTED user | No protected content-management access | No | No |

Approval does not change a user into an admin. Ordinary users may see their own account information and approval status, but not the user directory or other accounts' private data. Public portfolio reading remains separate from protected CMS access; published-content URLs and which owners appear publicly still need a decision.

## Required implementation

- Authenticate protected requests. Check current role and approval state server-side, including existing sessions after a status reversal.
- Add a required `ownerId` relation to User for each user-owned content model as it is implemented. Set ownership from the authenticated session on creation, never from an ordinary user's request body.
- For ordinary users, scope list, detail, update, delete and publish database operations to their own `ownerId`. An approved account alone must never unlock unrestricted content access.
- Admins may access all owners' content, but only through separate `/admin/...` endpoints guarded by `AdminGuard` (added later, per feature). Regular content routes (e.g. `/media`) are owner-only for everyone, admin included (decided 2026-10-20). Keep user listing, role management and approval updates admin-only.
- Apply ownership checks to related records, uploads and private contact inboxes as those features are added. Users must not attach another owner's private records or replace/delete another owner's files.
- Replace the global Profile singleton with one profile per owner (`ownerId` unique). Scope other unique identifiers, such as slugs, according to the chosen public URL design before their migrations.
- Pending/rejected users may inspect their own status but cannot manage content. Exact login restrictions and public URL structure remain to be decided; do not assume pending/rejected means an admin role change.

## Next development step

Implement and verify authenticated role/approval checks and admin-only user approval management before adding content modules. Add content ownership fields and query restrictions with each feature's migration. Login testing is still pending.
