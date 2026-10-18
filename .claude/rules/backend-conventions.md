# Backend conventions (`portfolio-api`)

## Runtime and tooling
- NestJS 12, **ESM** (`"type": "module"`), TypeScript strict, Vitest (not Jest), oxlint, Prettier.
- Imports **must end in `.js`** even though the files are `.ts`. Cross-folder imports use the `#src/...` subpath alias (`import { X } from '#src/config/env.js';`); same-folder imports may stay relative (`./x.service.js`). A missing `.js` is the first thing to check for "Cannot find module".
- The alias needs: `package.json` `imports` (`"#src/*.js": { "source": "./src/*.ts", "default": "./dist/*.js" }`), `tsconfig.json` `customConditions: ["source"]`, and an explicit `resolve.alias` in `vitest.config.ts` and `vitest.config.e2e.ts` (Vitest ignores the `source` condition). `package.json` must be deployed next to `dist/`. Don't use the alias in `prisma7.config.ts`.
- Top-level `await bootstrap();` in `main.ts`.
- Prisma is **pinned to 7** (`prisma@7`, `@prisma/client@7`, `@prisma/adapter-pg@7`); the `latest` tag points to a Prisma 8 pre-release. Don't install unpinned.
- `pg` comes in through `@prisma/adapter-pg`; don't install it separately.
- `dotenv` is a **dev** dependency used only by the Prisma config file. The app reads env through `@nestjs/config`.

## Formatting (same on every machine)
- LF line endings (`.gitattributes`, `.editorconfig`, Prettier `endOfLine: "lf"`).
- 2 spaces, single quotes, trailing commas, semicolons, print width 100.

## Environment
- All variables are validated with zod in `src/config/env.ts` (`validateEnv`). The app must refuse to start on a missing or invalid value.
- Add every new variable to the zod schema **and** to `.env.example` (with an empty or fake value). `.env` is never committed.
- Read config through typed `ConfigService<Env, true>` and `config.get('KEY', { infer: true })`; never `process.env` in feature code.
- Variable names: `DATABASE_URL` (pooled Neon URL, used by the app) and `DIRECT_URL` (direct URL, used only by Prisma CLI/migrations).

## Structure
- Feature modules, one folder each (see `docs/ARCHITECTURE.md`). Controllers handle HTTP only; services hold logic; Prisma access happens in services.
- `PrismaModule` is `@Global()`; inject `PrismaService` anywhere.
- `app.enableShutdownHooks()` in `main.ts`.
- Content modules have **two controllers sharing one service**: `AdminXController` (`/admin/x`) and `PublicXController` (`/public/x`).

## Prisma
- Generated client output: `src/generated/prisma` (git-ignored). Import from `../generated/prisma/client.js`.
- Prisma CLI reads `DIRECT_URL` through the Prisma config file; the app uses `DATABASE_URL` through the `PrismaPg` adapter.
- Add tables **per feature**, one migration each, named `add_<feature>` (e.g. `init_auth`, `add_tags`, `add_articles`). `migrate dev` does not run `generate`; run `npx prisma generate` after schema changes.
- Model names singular PascalCase; fields camelCase; every table has `id`, `createdAt`, `updatedAt` unless there's a reason.
- Slugs are unique per table; derive from the title with a shared slug util.

## Validation and errors
- DTO classes with class-validator for every request body; global `ValidationPipe` (`whitelist: true`, `transform: true`).
- Use Nest exceptions (`NotFoundException`, etc.). One global exception filter shapes error responses.
- Never return password hashes or internal fields; pick fields explicitly in public responses.

## Naming
- Files: `kebab-case.type.ts` (`articles.service.ts`, `admin-articles.controller.ts`, `create-article.dto.ts`).
- Classes: PascalCase with a suffix (`ArticlesService`, `PublicArticlesController`).
- Routes: plural nouns, kebab-case (`/admin/career-entries`).

## Tests
- Vitest. Add at least a service-level test or an e2e smoke check per finished module when time allows; the e2e config is `vitest.config.e2e.ts`. Don't let tests block the 8-day schedule.
