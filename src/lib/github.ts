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
		this.retryable = !!(
			this.status && [403, 429, 500, 502, 503].includes(this.status)
		);
	}
}

export function createGitHubClient(options?: {
	token?: string;
	userAgent?: string;
}) {
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
		const { data: topicsData } = await octokit.request(
			"GET /repos/{owner}/{repo}/topics",
			{
				owner,
				repo,
			},
		);

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
	} catch (err: unknown) {
		// biome-ignore lint/suspicious/noExplicitAny: Accessing status on unknown error
		const status = (err as any)?.status;
		if (status === 404) {
			throw new GitHubApiError("Repository not found", {
				status,
				code: "GITHUB_REPO_NOT_FOUND",
			});
		}
		if (status === 403) {
			throw new GitHubApiError(
				"GitHub API rate limit exceeded or access forbidden",
				{ status, code: "GITHUB_RATE_LIMIT" },
			);
		}
		throw new GitHubApiError("Failed to fetch repository metadata", {
			status,
			// biome-ignore lint/suspicious/noExplicitAny: Accessing code on unknown error
			code: (err as any)?.code,
		});
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
		// biome-ignore lint/suspicious/noExplicitAny: Octokit types are complex, casting for access
		const encoding = (resp.data as any).encoding ?? "base64";
		// biome-ignore lint/suspicious/noExplicitAny: Octokit types represent union of responses
		const contentBase64 = (resp.data as any).content as string | undefined;
		if (!contentBase64) return null;

		return Buffer.from(contentBase64, encoding as BufferEncoding).toString(
			"utf8",
		);
	} catch (err: unknown) {
		// biome-ignore lint/suspicious/noExplicitAny: Accessing status on unknown error
		const status = (err as any)?.status;
		if (status === 404) {
			// README is optional in repos; return null so callers can proceed
			return null;
		}
		if (status === 403) {
			throw new GitHubApiError(
				"GitHub API rate limit exceeded or access forbidden",
				{ status, code: "GITHUB_RATE_LIMIT" },
			);
		}
		throw new GitHubApiError("Failed to fetch README", {
			status,
			// biome-ignore lint/suspicious/noExplicitAny: Accessing code on unknown error
			code: (err as any)?.code,
		});
	}
}

export async function fetchRepoData(
	octokit: Octokit,
	owner: string,
	repo: string,
) {
	const [metadata, readme] = await Promise.all([
		fetchRepoMetadata(octokit, owner, repo),
		fetchReadme(octokit, owner, repo).catch(() => null),
	]);

	return { metadata, readme };
}
