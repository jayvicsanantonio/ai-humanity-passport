# Task 2 — Database and Data Models

This document describes the implementation for Task 2 in .kiro/specs/humanity-passport/tasks.md: configuring the database with Prisma + PostgreSQL (Prisma Postgres), defining the Analysis model, generating the Prisma client, and providing a re-usable database utility for connection handling.

Status summary
- Prisma + PostgreSQL configured (generator + datasource)
- Analysis model created with unique constraint on (owner, repo) and mapped table name
- Prisma client auto-generated on install (via postinstall)
- Database utility added at src/lib/db.ts for safe, singleton client usage in Next.js
- Migrations: initial migration not yet committed; see Commands section below

Schema
- Provider: postgresql
- Data source URL: DATABASE_URL environment variable (pooled/Accelerate)
- directUrl: DIRECT_URL environment variable (direct connection for migrations)
- Table name: analyses (mapped from Prisma model Analysis)
- Unique constraint: owner + repo

```prisma path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/prisma/schema.prisma start=4
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Analysis {
  id        Int      @id @default(autoincrement())
  owner     String
  repo      String
  verdict   String   // 'approved' or 'rejected'
  details   String   // LLM analysis details
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([owner, repo])
  @@map("analyses")
}
```

Database utility
A singleton PrismaClient is exported to avoid instantiating multiple clients during Next.js hot reloads.

```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/lib/db.ts start=1
import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

Environment configuration
- Create a .env file at the project root with:

```bash path=null start=null
# Prisma Postgres (example placeholders)
DATABASE_URL="prisma://accelerate.prisma-data.net/your-project?api_key=..." # pooled/Accelerate URL used at runtime
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"     # direct connection for migrations
```

- On Vercel, add the same variables in Project Settings → Environment Variables for Development, Preview, and Production.
- If you are using a provider like Vercel Postgres/Neon instead of Prisma Postgres, use their pooled and non-pooled URLs and map them to DATABASE_URL and DIRECT_URL respectively.

Commands
- Generate Prisma client (also runs automatically after npm install via postinstall):

```bash path=null start=null
npx prisma generate --no-engine
```

- Create and apply initial migration (recommended for shared environments/CI):

```bash path=null start=null
# Prompts for a migration name; use e.g. "init"
npx prisma migrate dev --name init
```

- Deploy already-committed migrations (CI/Vercel):

```bash path=null start=null
npx prisma migrate deploy
```

- Alternatively, for local-only schema syncing without migrations (avoid in shared/prod):

```bash path=null start=null
npx prisma db push
```


db:migrate vs db:push

1) db:migrate (npm run db:migrate → prisma migrate dev)
- What it does
  - Compares your prisma/schema.prisma to the current database schema, generates a versioned migration in prisma/migrations, applies it to the database, and updates Prisma’s migration history table. Also regenerates the Prisma Client if needed.
- Why it’s needed
  - Creates a reproducible, auditable history of schema changes that can be applied consistently across developer machines, CI, staging, and production.
  - Enables safe forward-only schema evolution and roll-forward strategies.
- When to use it
  - Team development and any shared environment (CI/CD, preview, staging, production).
  - After you change schema.prisma and want to commit the change for others to apply.
  - After pulling schema changes from main to apply the new migrations locally.
  - Prefer prisma migrate deploy in production CI to apply already-committed migrations without generating new ones.

2) db:push (npm run db:push → prisma db push)
- What it does
  - Pushes the current schema.prisma directly to the database without creating migration files. It syncs the database schema immediately. Destructive changes may require the --accept-data-loss flag.
- Why it’s needed
  - Useful for rapid local prototyping and tests where you don’t need or want to manage migration files.
  - Faster feedback loop during early development or temporary throwaway databases.
- When to use it
  - Local development during early iteration or for quick experiments.
  - Automated tests with ephemeral databases (e.g., SQLite files or in-memory DB) to provision schema quickly.
  - Do not use in production or shared environments because it bypasses versioned migrations.

Notes and best practices
- Next.js runtime: Use Node.js runtime for routes that access Prisma (not edge). If you create route handlers under app/api, set `export const runtime = "nodejs"` if needed.
- Connection reuse & pooling: Keep the singleton client pattern in `src/lib/db.ts`. In serverless (Vercel), always use a pooled/Accelerate URL at runtime. Use a direct URL only for migrations/administration.
- Testing: Use a separate Postgres database for tests (local Docker or a managed test DB). Before running tests, apply migrations with `prisma migrate deploy` against the test DATABASE_URL.
- Unique constraint: The `(owner, repo)` unique constraint enforces a single analysis per repository. If you later add versioning/history, consider an additional table or a composite key with a timestamp/version field.
- Table mapping: The model is mapped to `analyses` to keep the database table name explicit and pluralized.

Next steps (related tasks)
- Task 3 (GitHub API utilities): build repository metadata + README fetchers. These will feed data into the analysis pipeline stored via Prisma.
- Task 5 (Analysis API): implement POST /api/analyze to validate input, fetch metadata, call LLM, and upsert into the `analyses` table.

