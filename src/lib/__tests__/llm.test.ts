import { describe, expect, it, vi } from "vitest";
import type { RepoMetadata } from "@/lib/github";
import {
	analyzeRepository,
	buildAnalysisMessages,
	summarizeRepository,
} from "@/lib/llm";

// Mock the 'ai' module
vi.mock("ai", () => ({
	generateText: vi.fn(async () => ({ text: "Mock summary" })),
	generateObject: vi.fn(async () => ({
		object: {
			verdict: "approved",
			details: "Mock details",
			strengths: ["strength1"],
			concerns: ["concern1"],
		},
	})),
}));

// Mock @ai-sdk/openai
vi.mock("@ai-sdk/openai", () => ({
	openai: vi.fn(() => ({})),
}));

function makeMeta(): RepoMetadata {
	return {
		owner: "o",
		repo: "r",
		description: "An example repo",
		stars: 42,
		topics: ["nextjs", "ai"],
		defaultBranch: "main",
		htmlUrl: "https://github.com/o/r",
	};
}

describe("llm prompt builder", () => {
	it("builds system and user messages including metadata", () => {
		const messages = buildAnalysisMessages({
			metadata: makeMeta(),
			readme: "Hello",
		});
		expect(messages[0].role).toBe("system");
		expect(messages[1].role).toBe("user");
		expect(messages[1].content).toContain("o/r");
		expect(messages[1].content).toContain("Stars: 42");
		expect(messages[1].content).toContain("nextjs");
	});
});

describe("summarizeRepository", () => {
	it("calls generateText and returns text", async () => {
		const result = await summarizeRepository(null, {
			doc: { pageContent: "code" },
		});
		expect(result).toBe("Mock summary");
	});
});

describe("analyzeRepository", () => {
	it("calls generateObject and returns object", async () => {
		const result = await analyzeRepository(null, {
			metadata: makeMeta(),
			readme: "README",
			summary: "Summary",
		});
		expect(result.verdict).toBe("approved");
		expect(result.details).toBe("Mock details");
	});
});
