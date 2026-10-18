# Learning notes and commands

Personal notebook for concepts, key points, commands and mistakes learned while building this backend. Keep adding new topics to this file.

Never store passwords, API keys, tokens or database connection strings here.

## Adding a learning note

For each new topic, record:

- **Concept:** what it means, in your own words.
- **Why it matters:** what problem it solves in this project.
- **Command or example:** the exact command or a small code example.
- **When to use it:** the right point in the workflow.
- **Expected result:** what changes and how to check it.
- **Gotchas:** mistakes, limitations or errors worth remembering.

## Prisma commands

Run these commands from the `portfolio-api` folder. They serve different purposes: one updates the database structure; the other updates the TypeScript code used to query it.

### 1. Create and apply a development migration

```powershell
npx prisma migrate dev --name init_auth
```

**Meaning:** turn the model changes in `prisma/schema.prisma` into a versioned SQL migration and apply pending migrations to the development database.

- `--name init_auth` names this migration for the initial authentication tables. Use a new descriptive name for later features, such as `add_articles`.
- Migration files go under `prisma/migrations/` and belong in Git.
- This project's Prisma CLI configuration is `prisma7.config.ts`, which reads `DIRECT_URL` for the database connection.
- For our initial auth schema, the intended result is tables for users, sessions, accounts and verification records.
- This command changes the database structure; it does not create the admin account.

Use `migrate dev` for development, not production deployment. If it asks to reset the database, stop and review the reason before accepting: a reset can delete data.

### 2. Regenerate the Prisma client

```powershell
npx prisma generate
```

**Meaning:** regenerate the TypeScript database client from the current Prisma schema so application code can use the latest models and fields.

- This project generates the client into `src/generated/prisma/`.
- The generated folder is ignored by Git; do not hand-edit its files.
- Run it after schema changes and when setting up a checkout whose generated client is missing.
- An earlier client generation does not include models added afterward. For example, the client generated before adding `User` needs regenerating after the auth models are added.
- This command does not apply SQL migrations, create database tables, or create user accounts.

In Prisma 7, `migrate dev` does not automatically run `prisma generate`. Run generation explicitly after a successful migration if the client needs updating. If you already generated the client from the current schema, you do not need to repeat it merely because you restarted the app.

### How Better Auth's generator differs

```powershell
npx auth@latest generate --config ./better-auth.cli.ts --output ./prisma/schema.prisma
```

This separate command reads our Better Auth configuration, including plugins and custom fields, and generates the auth model definitions in the local Prisma schema. Review its overwrite prompt and the resulting file before migrating. It does not apply the database migration or regenerate Prisma Client.

For this project, preserve the `prisma-client` generator, output `../src/generated/prisma`, and PostgreSQL datasource when reviewing the generated schema.

### Order for the initial auth setup

1. Generate and review the Better Auth Prisma schema.
2. Run `npx prisma migrate dev --name init_auth` to create the database tables.
3. Run `npx prisma generate` to update the TypeScript client.
4. Run `npx tsc --noEmit` to check application types. A passing type check alone does not prove database connectivity or that migrations were applied.

### References

- [Prisma 7 CLI reference](https://www.prisma.io/docs/orm/v7/reference/prisma-cli-reference)
- [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Better Auth CLI](https://better-auth.com/docs/concepts/cli)
