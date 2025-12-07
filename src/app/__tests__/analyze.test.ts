import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/github", () => {
	return {
		createGitHubClient: vi.fn(() => ({})),
		// biome-ignore lint/suspicious/noExplicitAny: Mocking
		fetchRepoData: vi.fn(async (_octo: any, owner: string, repo: string) => ({
			metadata: {
				owner,
				repo,
				description: "desc",
				stars: 10,
				topics: ["react"],
				defaultBranch: "main",
				htmlUrl: "http://github.com",
			},
			readme: "readme content",
		})),
		GitHubApiError: class extends Error {
			status?: number;
			code?: string;
			retryable?: boolean;
			// biome-ignore lint/suspicious/noExplicitAny: Mocking error constructor
			constructor(message: string, opts?: any) {
				super(message);
				this.name = "GitHubApiError";
				this.status = opts?.status;
				this.code = opts?.code;
				this.retryable = opts?.retryable;
			}
		},
	};
});

vi.mock("@/lib/llm", () => {
	return {
		// biome-ignore lint/suspicious/noExplicitAny: Mocking LLM function
		analyzeRepository: vi.fn(async (_client: any, _input: any) => ({
			verdict: "approved",
			details: "Looks good",
			strengths: ["docs"],
			concerns: [],
		})),
		processGithubRepository: vi.fn(async () => "Mock summary"),
	};
});

vi.mock("@/lib/db", () => {
	// biome-ignore lint/suspicious/noExplicitAny: Mocking DB
	const upsert = vi.fn(async (_args: any) => ({ id: 1 }));
	// biome-ignore lint/suspicious/noExplicitAny: Mocking DB
	const prisma = { analysis: { upsert } } as any;
	return { default: prisma, prisma };
});

import { POST } from "@/app/api/analyze/route";

// biome-ignore lint/suspicious/noExplicitAny: Mocking arbitrary args
function makeRequest(body: any, ip = "2.2.2.2") {
	return new Request("http://localhost/api/analyze", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-forwarded-for": ip,
		},
		body: JSON.stringify(body),
	});
}

describe("POST /api/analyze", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns analysis result for a valid repo", async () => {
		const res = await POST(
			makeRequest({ repoUrl: "https://github.com/o/r" }, "3.3.3.3"),
		);
		expect(res.ok).toBe(true);
		const data = await res.json();
		expect(data.owner).toBe("o");
		expect(data.repo).toBe("r");
		expect(data.verdict).toBe("approved");
	});

	it("rejects invalid input", async () => {
		const res = await POST(makeRequest({ repoUrl: "invalid-url" }, "4.4.4.4"));
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.code).toBe("INVALID_INPUT");
	});

	it("applies rate limiting per IP", async () => {
		// Default limit is 5 in window; send 6
		const ip = "5.5.5.5";
		for (let i = 0; i < 5; i++) {
			const okRes = await POST(
				makeRequest({ repoUrl: "https://github.com/o/r" }, ip),
			);
			expect(okRes.status).toBeLessThan(429);
		}
		const blocked = await POST(
			makeRequest({ repoUrl: "https://github.com/o/r" }, ip),
		);
		expect(blocked.status).toBe(429);
		const data = await blocked.json();
		expect(data.code).toBe("RATE_LIMITED");
	});
});
