import { describe, expect, it, vi } from "vitest";
import type { RepoMetadata } from "@/lib/github";
import {
	type AnalysisResult,
	analyzeRepositoryWithGroq,
	buildAnalysisMessages,
	parseGroqAnalysisText,
} from "@/lib/llm";

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

describe("parseGroqAnalysisText", () => {
	it("parses plain JSON content", () => {
		const content = JSON.stringify({
			verdict: "approved",
			details: "Looks good",
			strengths: ["docs"],
			concerns: ["none"],
		});
		const result = parseGroqAnalysisText(content);
		expect(result.verdict).toBe("approved");
		expect(result.details).toContain("Looks good");
	});

	it("parses fenced JSON blocks", () => {
		const content =
			'```json\n{\n  "verdict": "rejected",\n  "details": "Problematic"\n}\n```';
		const result = parseGroqAnalysisText(content);
		expect(result.verdict).toBe("rejected");
	});

	it("rejects invalid verdicts", () => {
		const content = JSON.stringify({ verdict: "maybe", details: "hmm" });
		expect(() => parseGroqAnalysisText(content)).toThrow();
	});
});

describe("analyzeRepositoryWithGroq", () => {
	it("returns parsed result from client", async () => {
		const fake = {
			chat: {
				completions: {
					create: vi.fn().mockResolvedValue({
						choices: [
							{
								message: {
									content: JSON.stringify({
										verdict: "approved",
										details: "ok",
									}),
								},
							},
						],
					}),
				},
			},
		};

		const res = await analyzeRepositoryWithGroq(fake as any, {
			metadata: makeMeta(),
			readme: "",
		});
		expect(res.verdict).toBe("approved");
		expect(fake.chat.completions.create).toHaveBeenCalledTimes(1);
	});

	it("retries on transient error then succeeds", async () => {
		const create = vi
			.fn()
			.mockRejectedValueOnce(
				Object.assign(new Error("server error"), { status: 500 }),
			)
			.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: JSON.stringify({ verdict: "rejected", details: "nope" }),
						},
					},
				],
			});

		const fake = { chat: { completions: { create } } };

		const res = await analyzeRepositoryWithGroq(
			fake as any,
			{ metadata: makeMeta(), readme: "" },
			{ attempts: 2, baseDelayMs: 1 },
		);
		expect(res.verdict).toBe("rejected");
		expect(create).toHaveBeenCalledTimes(2);
	});
});
