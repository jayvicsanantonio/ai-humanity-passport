# Task 3 — GitHub API Integration Utilities

This document describes the implementation for Task 3 in .kiro/specs/humanity-passport/tasks.md: building GitHub API integration utilities with Octokit to fetch repository metadata and README content. It aligns with Requirements 1.2 and 1.3 in the requirements document and provides a testable, reusable surface for later tasks (notably Task 5: Analysis API).

Status summary
- Octokit dependency is present in package.json ("@octokit/rest").
- URL validation and parsing helpers exist in src/lib/validation.ts.
- No GitHub integration utilities exist yet under src/lib/.
- This document defines the API surface, error handling, environment setup, and testing approach to implement Task 3.

Requirements mapping
- 1.2: Fetch repository metadata (description, stars, topics, README content).
- 1.3: Prepare data for analysis workflow (this task focuses on data retrieval; queueing is handled in Task 5).

Design and scope
- Use Octokit (GitHub REST) with optional token auth via GITHUB_TOKEN.
- Provide small, cohesive functions that can be composed:
  - createGitHubClient: configure an Octokit client.
  - fetchRepoMetadata: description, stars, topics, default branch, html URL.
  - fetchReadme: decode Base64 README content; tolerant of missing README.
  - fetchRepoData: convenience that runs metadata + README in parallel.
- Emphasize testability by allowing callers to inject an Octokit instance.
- Handle common error cases consistently with a typed error class.

API surface and types
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/lib/github.ts start=1
import { Octokit } from "@octokit/rest";

export type RepoMetadata = {
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  topics: string[];
  defaultBranch: string;
  htmlUrl: string;
};

export class GitHubApiError extends Error {
  status?: number;
  code?: string;
  retryable: boolean;

  constructor(message: string, opts?: { status?: number; code?: string }) {
    super(message);
    this.name = "GitHubApiError";
    this.status = opts?.status;
    this.code = opts?.code;
    this.retryable = !!(this.status && [403, 429, 500, 502, 503].includes(this.status));
  }
}

export function createGitHubClient(options?: { token?: string; userAgent?: string }) {
  const token = options?.token ?? process.env.GITHUB_TOKEN;
  return new Octokit({
    auth: token,
    userAgent: options?.userAgent ?? "humanity-passport/0.1.0",
  });
}

export async function fetchRepoMetadata(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<RepoMetadata> {
  try {
    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

    // Topics are returned by a separate endpoint
    const { data: topicsData } = await octokit.request("GET /repos/{owner}/{repo}/topics", {
      owner,
      repo,
    });

    const topics = (topicsData?.names as string[]) ?? [];

    return {
      owner,
      repo,
      description: repoData.description ?? null,
      stars: repoData.stargazers_count ?? 0,
      topics,
      defaultBranch: repoData.default_branch,
      htmlUrl: repoData.html_url,
    };
  } catch (err: any) {
    const status = err?.status;
    if (status === 404) {
      throw new GitHubApiError("Repository not found", { status, code: "GITHUB_REPO_NOT_FOUND" });
    }
    if (status === 403) {
      throw new GitHubApiError("GitHub API rate limit exceeded or access forbidden", { status, code: "GITHUB_RATE_LIMIT" });
    }
    throw new GitHubApiError("Failed to fetch repository metadata", { status, code: err?.code });
  }
}

export async function fetchReadme(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref?: string,
): Promise<string | null> {
  try {
    const resp = await octokit.request("GET /repos/{owner}/{repo}/readme", {
      owner,
      repo,
      ...(ref ? { ref } : {}),
    });

    // The default response contains base64-encoded content
    const encoding = (resp.data as any).encoding ?? "base64";
    const contentBase64 = (resp.data as any).content as string | undefined;
    if (!contentBase64) return null;

    return Buffer.from(contentBase64, encoding as BufferEncoding).toString("utf8");
  } catch (err: any) {
    const status = err?.status;
    if (status === 404) {
      // README is optional in repos; return null so callers can proceed
      return null;
    }
    if (status === 403) {
      throw new GitHubApiError("GitHub API rate limit exceeded or access forbidden", { status, code: "GITHUB_RATE_LIMIT" });
    }
    throw new GitHubApiError("Failed to fetch README", { status, code: err?.code });
  }
}

export async function fetchRepoData(octokit: Octokit, owner: string, repo: string) {
  const [metadata, readme] = await Promise.all([
    fetchRepoMetadata(octokit, owner, repo),
    fetchReadme(octokit, owner, repo).catch(() => null),
  ]);

  return { metadata, readme };
}
```

Usage examples
```ts path=null start=null
import { createGitHubClient, fetchRepoData } from "@/lib/github";
import { parseGitHubUrl } from "@/lib/validation";

const octokit = createGitHubClient();

export async function getRepoDataFromUrl(repoUrl: string) {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const { owner, repo } = parsed;
  return fetchRepoData(octokit, owner, repo);
}
```

Environment configuration
- Add a personal access token in development (optional but recommended to avoid strict unauthenticated rate limits). Do not commit secrets.

```bash path=null start=null
# .env (local development)
GITHUB_TOKEN={{GITHUB_TOKEN}}
```

Notes
- If no token is provided, Octokit uses unauthenticated requests and you may hit rate limits quickly.
- For serverless deployments, configure GITHUB_TOKEN in your provider’s environment settings.
- These utilities are intended for server-side usage; ensure API routes that call them run on the Node.js runtime (not edge) if needed.

Testing plan (Vitest)
- Strategy: dependency injection — pass a fake Octokit to avoid network calls.
- Cover cases: success (metadata + topics + README), missing README (404 → null), repo not found (404), rate limit/forbidden (403), and generic failures.

```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/lib/__tests__/github.test.ts start=1
import { describe, it, expect } from "vitest";
import type { Octokit } from "@octokit/rest";
import { fetchRepoMetadata, fetchReadme, fetchRepoData } from "@/lib/github";

function makeFakeOctokit({
  repoData,
  topics = [],
  readmeBase64,
  errors = {},
}: {
  repoData?: any;
  topics?: string[];
  readmeBase64?: string | null;
  errors?: Partial<Record<"get" | "topics" | "readme", any>>;
}) {
  return {
    rest: {
      repos: {
        get: async () => {
          if (errors.get) throw errors.get;
          return { data: repoData ?? { description: "desc", stargazers_count: 5, default_branch: "main", html_url: "https://github.com/o/r" } };
        },
      },
    },
    request: async (route: string) => {
      if (route.includes("/topics")) {
        if (errors.topics) throw errors.topics;
        return { data: { names: topics } };
      }
      if (route.includes("/readme")) {
        if (errors.readme) throw errors.readme;
        if (readmeBase64 == null) return { data: { encoding: "base64", content: undefined } } as any;
        return { data: { encoding: "base64", content: readmeBase64 } } as any;
      }
      return { data: {} } as any;
    },
  } as unknown as Octokit;
}

describe("github utilities", () => {
  it("fetches metadata and topics", async () => {
    const octokit = makeFakeOctokit({ topics: ["react", "nextjs"] });
    const meta = await fetchRepoMetadata(octokit, "o", "r");
    expect(meta.stars).toBe(5);
    expect(meta.topics).toEqual(["react", "nextjs"]);
  });

  it("decodes README content", async () => {
    const content = Buffer.from("hello", "utf8").toString("base64");
    const octokit = makeFakeOctokit({ readmeBase64: content });
    const readme = await fetchReadme(octokit, "o", "r");
    expect(readme).toContain("hello");
  });

  it("returns null when README is missing (404)", async () => {
    const notFound = Object.assign(new Error("Not Found"), { status: 404 });
    const octokit = makeFakeOctokit({ errors: { readme: notFound } });
    const readme = await fetchReadme(octokit, "o", "r");
    expect(readme).toBeNull();
  });

  it("surfaces 404 for repository metadata", async () => {
    const notFound = Object.assign(new Error("Not Found"), { status: 404 });
    const octokit = makeFakeOctokit({ errors: { get: notFound } });
    await expect(fetchRepoMetadata(octokit, "o", "r")).rejects.toMatchObject({ status: 404 });
  });

  it("fetchRepoData aggregates both calls", async () => {
    const content = Buffer.from("hello", "utf8").toString("base64");
    const octokit = makeFakeOctokit({ topics: ["react"], readmeBase64: content });
    const result = await fetchRepoData(octokit, "o", "r");
    expect(result.metadata.topics).toEqual(["react"]);
    expect(result.readme).toContain("hello");
  });
});
```

Integration notes
- Task 5 (POST /api/analyze) will call fetchRepoData to gather inputs for the LLM prompt.
- Store analysis results via Prisma as defined in Task 2.
- When adding the API route, consider simple caching for metadata/readme to reduce GitHub API calls under load.

Next steps (implementation)
1) Create src/lib/github.ts with the API shown above.
2) Add unit tests under src/lib/__tests__/github.test.ts.
3) Wire into the future /api/analyze route.
4) Configure GITHUB_TOKEN locally and in deployment to avoid rate limits.

