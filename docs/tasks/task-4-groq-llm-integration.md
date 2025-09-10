# Task 4 — Groq LLM Integration

This document describes the implementation for Task 4 in .kiro/specs/humanity-passport/tasks.md: wiring Groq LLM into the analysis workflow with a prompt template, API client configuration, robust response parsing, retry logic, and unit tests.

Status summary
- Groq SDK is present in package.json ("groq-sdk").
- New server-side LLM utilities are implemented in src/lib/llm.ts.
- Prompt template produces a system instruction + user payload from repo metadata and README.
- Response parser extracts and validates strict JSON and normalizes fields.
- Retry logic added with exponential backoff for transient errors.
- Unit tests cover prompt building, parsing, and retry behavior.

Requirements mapping
- 2.1: Send repository data to Groq LLM (model: gpt-oss-20b).
- 2.2: Return structured verdict + details (and optional strengths/concerns arrays).
- 2.4: Retry up to 3 times on failure (configurable), surface errors consistently.

Implementation details
- Entry file: src/lib/llm.ts
  - createGroqClient(options?: { apiKey?: string }) → Groq
    - Reads GROQ_API_KEY from environment; throws helpful error if missing.
  - buildAnalysisMessages({ metadata, readme }) → Chat messages
    - System prompt: evaluator of positive societal impact. Requires JSON-only output schema { verdict, details, strengths, concerns }.
    - User prompt: includes owner/repo, description, stars, topics, URL, and a truncated README snippet.
  - parseGroqAnalysisText(text) → AnalysisResult
    - Extracts JSON from fenced blocks (```json ... ```), generic fences, or best-effort braces.
    - Parses, validates verdict ('approved' | 'rejected'), returns normalized details/arrays.
  - analyzeRepositoryWithGroq(client, { metadata, readme }, options)
    - Accepts injected client for testability; otherwise creates one with GROQ_API_KEY.
    - Calls chat.completions.create with model "gpt-oss-20b", temperature 0.2, max_tokens 1024.
    - Retries transient errors (408/429/5xx) up to attempts (default 3) with backoff.
    - Throws GroqApiError on failures with status, code, and retryable hints.

Types
- AnalysisResult: { verdict: 'approved' | 'rejected'; details: string; strengths?: string[]; concerns?: string[] }
- RepoMetadata: imported from src/lib/github.ts

Environment configuration
- Add GROQ_API_KEY to your environment (do not commit secrets):

```bash
# .env (local development)
GROQ_API_KEY={{GROQ_API_KEY}}
```

Testing (Vitest)
- Tests live at src/lib/__tests__/llm.test.ts and use dependency injection with a fake client.
- Coverage:
  - Prompt contains repo info (owner/repo, stars, topics).
  - JSON parsing works for plain and fenced variants.
  - Invalid verdicts throw.
  - Retry on transient error then success.

Usage example

```ts
import { createGroqClient, analyzeRepositoryWithGroq } from "@/lib/llm";
import { createGitHubClient, fetchRepoData } from "@/lib/github";

const octokit = createGitHubClient();
const groq = createGroqClient();

export async function analyzeRepoUrl(repoUrl: string) {
  // In Task 5, this will live inside POST /api/analyze
  const { owner, repo } = /* parse with validation.ts */ { owner: "o", repo: "r" };
  const { metadata, readme } = await fetchRepoData(octokit, owner, repo);
  const result = await analyzeRepositoryWithGroq(groq, { metadata, readme });
  return { owner, repo, ...result };
}
```

Notes and best practices
- Keep LLM calls server-side only; never expose GROQ_API_KEY to the client.
- Limit README size in prompts to control latency and token usage.
- The parser is defensive against non-JSON output and attempts common formats.
- Future Task 5 will persist AnalysisResult using Prisma and expose POST /api/analyze.
