[![Humanity Passport](https://ai-humanity-passport.vercel.app/api/badge/shsanantonio/ai-humanity-passport)](https://ai-humanity-passport.vercel.app/passport/shsanantonio/ai-humanity-passport)


---

# Humanity Passport

> Our official submission for the
>
> **OpenAI Open Model Hackathon** in the **"For Humanity"** category.


Humanity Passport is a web application that uses AI to analyze open-source projects and award a badge of honor to those that positively impact humanity. Our goal is to make socially responsible software development visible, rewarding, and discoverable.

**Live application**: [https://ai-humanity-passport.vercel.app](https://ai-humanity-passport.vercel.app)

---

## Features
- **AI-Powered Analysis**: We use the gpt-oss-20b model via the high-speed Groq API to evaluate a repository's purpose, impact, and documentation.
- **Dynamic SVG Badges**: Instantly generated SVG badges that reflect the analysis verdict ("Humanity+ Passport" or "Not Approved").
- **Public Passport Pages**: Every analyzed repository gets a permanent, shareable page detailing the AI's findings and reasoning.
- **Seamless Integration**: A simple Markdown snippet allows developers to embed their badge directly into their README.md file.
- **Modern Tech Stack**: Built with Next.js 14, React, TailwindCSS, and Prisma for a fast, reliable, and scalable experience.

---

## How It Works
1. Submit a Repo: A developer submits a public GitHub repository URL on our homepage.
2. Analyze: The backend fetches repository metadata using the GitHub API and sends it to the Groq LLM for analysis.
3. Get a Badge: The system stores the result and generates a unique passport page and a dynamic SVG badge that can be embedded anywhere.

---

## Getting Started & Local Development

### Environment Setup

1) Copy the example file and set your values (never commit real secrets):

```bash
cp .env.example .env
```

2) Set the following variables:
- GROQ_API_KEY (required): API key for Groq LLM used by analysis.
- GITHUB_TOKEN (optional): GitHub personal access token to increase API rate limits.
- RATE_LIMIT_MAX (optional, default 5): Max POST /api/analyze requests per IP within the sliding window.
- RATE_LIMIT_WINDOW_MS (optional, default 60000): Sliding window duration in milliseconds.

---

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/ai-humanity-passport.git
    cd ai-humanity-passport
    ```
2. Install dependencies:

    ```bash
    npm install
    ```
3. Run the database migration:
    ```bash
    # This will set up your local SQLite database.
    npx prisma migrate dev
    ```
4. Run the development server:
    ```bash
    npm run dev
    ```
5. Open http://localhost:3000 with your browser to see the result.
---

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

---

## License
This project is licensed under the Apache License.
