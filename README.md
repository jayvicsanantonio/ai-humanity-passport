This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Documentation

- Task 1 — Project Structure and Core Dependencies: [doc/task-1-project-setup.md](doc/task-1-project-setup.md)
- Task 2 — Database and Data Models: [doc/task-2-database-and-models.md](doc/task-2-database-and-models.md)
- Task 3 — GitHub API Integration Utilities: [doc/task-3-github-api-integration.md](doc/task-3-github-api-integration.md)
- Task 4 — Groq LLM Integration: [doc/task-4-groq-llm-integration.md](doc/task-4-groq-llm-integration.md)
- Task 5 — Repository Analysis API Endpoint: [doc/task-5-analysis-api.md](doc/task-5-analysis-api.md)

## Database workflow (PostgreSQL via Prisma)

- db:migrate — Generates and applies versioned migrations (creates files under prisma/migrations) and updates the database/schema history. Use this for shared environments and after any schema change you want to commit. In production CI and during Vercel deploys, prefer `prisma migrate deploy` to apply already-committed migrations.
- db:migrate:deploy — Applies already-committed migrations without creating new ones. Use this in CI and Vercel deployments.
- db:reset — Resets the database (drops and re-applies all migrations). Useful for local development only.
- db:push — Pushes schema changes directly to the database without creating migration files. Useful for quick experiments; avoid using this in production or shared environments.

Environment variables (local development):
- DATABASE_URL: pooled or Accelerate URL used by the app at runtime.
- DIRECT_URL: direct connection URL used by Prisma Migrate and admin tools.

Pooling on Vercel:
- Serverless environments open many short-lived connections; use a pooler. If you use Prisma Postgres, pooling is built in (via Accelerate). If you use another Postgres provider, use connection pooling (e.g., PgBouncer) or Prisma Accelerate.

See details: [db:migrate vs db:push](doc/task-2-database-and-models.md#dbmigrate-vs-dbpush)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
