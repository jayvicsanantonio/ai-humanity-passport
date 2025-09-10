# Task 5 — Repository Analysis API Endpoint

This document describes the implementation for Task 5 in .kiro/specs/humanity-passport/tasks.md: creating the POST /api/analyze endpoint with input validation (Zod), GitHub + LLM integration, database upsert, error handling, and rate limiting. It aligns with Requirements 1.1, 1.4, 1.5, 2.3, and 5.2.

Status summary
- API route added at src/app/api/analyze/route.ts (Node.js runtime).
- Input validated with Zod and GitHub URL refinement.
- GitHub metadata + README fetched via src/lib/github.ts.
- Groq LLM analysis via src/lib/llm.ts (model: gpt-oss-20b).
- Results upserted into the Prisma Analysis table.
- In-memory per-IP rate limiting implemented.
- Integration tests added under src/app/__tests__/analyze.test.ts.

Endpoint
- Method: POST
- Path: /api/analyze
- Request body: { repoUrl: string }
- Response body on success: { owner, repo, verdict, details }
- Error responses use a consistent shape: { error, code, details?, retryable? }

Implementation details
- Validation (Zod)
  - Schema ensures repoUrl exists and matches the GitHub pattern using existing validateGitHubUrl.
  - parseGitHubUrl is used after Zod validation to extract owner and repo.
- GitHub integration
  - createGitHubClient() creates an Octokit client (auth optional via GITHUB_TOKEN).
  - fetchRepoData() retrieves metadata and README.
- LLM integration
  - analyzeRepositoryWithGroq() sends metadata/README to Groq (gpt-oss-20b), parses JSON, and returns AnalysisResult.
- Persistence
  - Prisma upsert guarantees a single record per owner/repo (unique constraint).
- Rate limiting
  - Simple per-IP sliding window: max 5 requests within 60s (configurable via env: RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS).
- Error handling
  - GitHubApiError → maps status codes (404, 403/429, 5xx) and returns retryable flag where applicable.
  - GroqApiError → includes retryable and appropriate status (503 for retryable failures).
  - Unknown errors → 500 with INTERNAL_SERVER_ERROR.

Code references
- API route
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/api/analyze/route.ts start=1
import { z } from "zod";
import prisma from "@/lib/db";
import { createGitHubClient, fetchRepoData, GitHubApiError } from "@/lib/github";
import { analyzeRepositoryWithGroq, GroqApiError } from "@/lib/llm";
import { parseGitHubUrl, validateGitHubUrl } from "@/lib/validation";

export const runtime = "nodejs";

// ... see file for full implementation
```

Testing (Vitest)
- Location: src/app/__tests__/analyze.test.ts
- Strategy: dependency injection via vi.mock for GitHub, LLM, and Prisma.
- Coverage:
  - Happy path returns analysis and persists via upsert.
  - Invalid input returns 400 with code INVALID_INPUT.
  - Rate limiting returns 429 with code RATE_LIMITED after exceeding limit.

Environment
- Optional: GITHUB_TOKEN for increased GitHub API limits.
- Required (by LLM utilities when used without injected client): GROQ_API_KEY.
- Optional: RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS to tune rate limiting.

Next steps
- Hook this endpoint to the home page form submission.
- Implement stronger, shared rate limiter for production (e.g., Upstash Redis or Vercel KV).
- Add additional validation and sanitization ahead of Task 10 security hardening.
