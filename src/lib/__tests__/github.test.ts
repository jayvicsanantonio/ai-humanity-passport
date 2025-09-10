import type { Octokit } from "@octokit/rest";
import { describe, expect, it } from "vitest";
import { fetchReadme, fetchRepoData, fetchRepoMetadata } from "@/lib/github";

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
					return {
						data: repoData ?? {
							description: "desc",
							stargazers_count: 5,
							default_branch: "main",
							html_url: "https://github.com/o/r",
						},
					};
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
				if (readmeBase64 == null)
					return { data: { encoding: "base64", content: undefined } } as any;
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
		await expect(fetchRepoMetadata(octokit, "o", "r")).rejects.toMatchObject({
			status: 404,
		});
	});

	it("fetchRepoData aggregates both calls", async () => {
		const content = Buffer.from("hello", "utf8").toString("base64");
		const octokit = makeFakeOctokit({
			topics: ["react"],
			readmeBase64: content,
		});
		const result = await fetchRepoData(octokit, "o", "r");
		expect(result.metadata.topics).toEqual(["react"]);
		expect(result.readme).toContain("hello");
	});
});
