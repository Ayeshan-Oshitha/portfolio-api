---
name: add-content-module
description: Guide Oshitha in building a content module (articles, certificates, projects, services, career) with the standard pattern: Prisma model + migration, DTOs, one service, admin and public controllers, publish toggle, Swagger docs. Use when starting any content feature.
---

# add-content-module

The pattern is set once with **Articles** (Day 2) and repeated for every other content type. Oshitha types all code; give it in chat one sub-step at a time.

## Inputs to confirm first
- Resource name (singular/plural), fields from `docs/ARCHITECTURE.md`.
- Does it have a `slug`, `sortOrder`, `tags`, an uploaded file/image?

## Steps (each is a separate chat reply, wait for confirmation)
1. **Prisma model** in `prisma/schema.prisma`: `id`, fields, `isPublished Boolean @default(false)`, `sortOrder` if ordered, `createdAt`, `updatedAt`, unique slug if needed, tag relation if needed. Then `npx prisma migrate dev --name add_<feature>` and `npx prisma generate`.
2. **Folder** `src/content/<name>/` with `<name>.module.ts`.
3. **DTOs** in `dto/`: `create-<name>.dto.ts`, `update-<name>.dto.ts` (use `PartialType` from `@nestjs/swagger`), class-validator decorators, `@ApiProperty`.
4. **Service** `<name>.service.ts`: `create`, `findAllAdmin`, `findOneAdmin`, `update`, `remove`, `setPublished`, `findAllPublic`, `findOnePublic` (by slug when it has one). Public methods **always** filter `isPublished: true` and select explicit fields. Handle slug conflicts (409) and not-found (404).
5. **Admin controller** `admin-<name>.controller.ts` at `/admin/<plural>`, behind `AuthGuard`: `POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id`, `PATCH :id/publish`. Swagger decorators.
6. **Public controller** `public-<name>.controller.ts` at `/public/<plural>`: `GET` list, `GET :slug` or `:id`. No guard. Swagger decorators.
7. **Register** the module in `AppModule` imports.
8. **Test in Scalar** (`/reference`): create → appears in admin list → hidden on `/public/...` → publish → visible on public → unpublish → hidden. Also check unauthenticated `/admin/...` returns 401.
9. **Progress + commit**: update `../PROGRESS.md`; give commit messages, e.g. `feat(<name>): add model, admin and public controllers with publish toggle`. Suggest splitting migration (`feat(<name>): add <Name> model and migration`) from the module code.

## Checklist before calling it done
- [ ] Migration applied, client regenerated
- [ ] Public service filters `isPublished: true`
- [ ] Public responses use explicit field selection
- [ ] DTO validation rejects bad input
- [ ] Admin routes return 401 without a session
- [ ] Swagger shows all routes with schemas
- [ ] Imports end in `.js`
- [ ] `npx tsc --noEmit` passes

## Tag relation (Articles and Projects)
Implicit many-to-many with `Tag`. DTO accepts `tagIds: string[]` (or slugs); service uses `tags: { set: [...] }` on update and `connect` on create. Public responses include each tag's `name`, `slug`, `iconSlug`, `iconUrl`, `color`.
