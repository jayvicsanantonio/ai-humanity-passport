import { z } from "zod";
import prisma from "@/lib/db";
import {
	createGitHubClient,
	fetchRepoData,
	GitHubApiError,
} from "@/lib/github";
import { analyzeRepository, processGithubRepository } from "@/lib/llm";
import { parseGitHubUrl, validateGitHubUrl } from "@/lib/validation";

export const runtime = "nodejs";

// Simple in-memory rate limiter (per-IP, sliding window)
const RL_MAX_ENV = process.env.RATE_LIMIT_MAX;
const parsedMax = RL_MAX_ENV ? Number.parseInt(RL_MAX_ENV, 10) : NaN;
const RATE_LIMIT_MAX =
	Number.isNaN(parsedMax) || parsedMax <= 0 ? 5 : parsedMax;

const RL_WIN_ENV = process.env.RATE_LIMIT_WINDOW_MS;
const parsedWin = RL_WIN_ENV ? Number.parseInt(RL_WIN_ENV, 10) : NaN;
const RATE_LIMIT_WINDOW_MS =
	Number.isNaN(parsedWin) || parsedWin <= 0 ? 60000 : parsedWin;

const requests = new Map<string, number[]>();

function getClientIp(req: Request): string {
	const xff = req.headers.get("x-forwarded-for");
	if (xff) return xff.split(",")[0]?.trim() || "unknown";
	const xri = req.headers.get("x-real-ip");
	if (xri) return xri.trim();
	return "unknown";
}

function allowRequest(ip: string): boolean {
	const now = Date.now();
	const windowStart = now - RATE_LIMIT_WINDOW_MS;
	const arr = requests.get(ip) ?? [];
	const recent = arr.filter((ts) => ts > windowStart);
	if (recent.length >= RATE_LIMIT_MAX) {
		requests.set(ip, recent);
		return false;
	}
	recent.push(now);
	requests.set(ip, recent);
	return true;
}

const AnalyzeRequestSchema = z.object({
	repoUrl: z
		.string()
		.min(1, "Please enter a GitHub repository URL")
		.refine((url) => validateGitHubUrl(url), {
			message:
				"Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)",
		}),
});

interface ErrorResponse {
	error: string;
	code: string;
	details?: string;
	retryable?: boolean;
}

function json(body: unknown, init?: ResponseInit) {
	const headers = new Headers(init?.headers);
	if (!headers.has("content-type"))
		headers.set("content-type", "application/json");
	headers.set("cache-control", "no-store");
	return new Response(JSON.stringify(body), { ...init, headers });
}

export async function POST(request: Request) {
	const ip = getClientIp(request);
	if (!allowRequest(ip)) {
		const err: ErrorResponse = {
			error: "Too many requests",
			code: "RATE_LIMITED",
			retryable: true,
		};
		return json(err, { status: 429 });
	}

	let data: unknown;
	try {
		data = await request.json();
	} catch {
		const err: ErrorResponse = {
			error: "Invalid JSON body",
			code: "INVALID_JSON",
		};
		return json(err, { status: 400 });
	}

	const parsed = AnalyzeRequestSchema.safeParse(data);
	if (!parsed.success) {
		const issue = parsed.error.issues[0];
		const err: ErrorResponse = {
			error: issue?.message ?? "Invalid input",
			code: "INVALID_INPUT",
		};
		return json(err, { status: 400 });
	}

	const { repoUrl } = parsed.data;
	const ownerRepo = parseGitHubUrl(repoUrl);
	if (!ownerRepo) {
		const err: ErrorResponse = {
			error: "Invalid GitHub repository URL",
			code: "INVALID_REPO_URL",
		};
		return json(err, { status: 400 });
	}

	const { owner, repo } = ownerRepo;
	// Normalize to lowercase for unique key stability (GitHub is case-insensitive)
	const ownerLc = owner.toLowerCase();
	const repoLc = repo.toLowerCase();

	try {
		const octokit = createGitHubClient();
		// Use original casing for GitHub API fetch (API is case-insensitive, but original is fine)
		const { metadata, readme } = await fetchRepoData(octokit, owner, repo);

		let summary: string | null = null;
		const skipSummary =
			(
				process.env.SAVE_GROK_TOKENS_AND_AVOID_GITHUBAPI_RATE_LIMIT ?? ""
			).toLowerCase() === "true";

		if (!skipSummary) {
			summary = await processGithubRepository(repoUrl);
		}

		const analysis = await analyzeRepository(null, {
			metadata,
			readme,
			summary,
		});

		await prisma.analysis.upsert({
			where: { owner_repo: { owner: ownerLc, repo: repoLc } },
			update: {
				verdict: analysis.verdict,
				details: analysis.details,
			},
			create: {
				owner: ownerLc,
				repo: repoLc,
				verdict: analysis.verdict,
				details: analysis.details,
			},
		});

		return json(
			{
				owner: ownerLc,
				repo: repoLc,
				verdict: analysis.verdict,
				details: analysis.details,
			},
			{ status: 200 },
		);
	} catch (err: unknown) {
		// Map known errors
		if (err instanceof GitHubApiError) {
			const status = err.status ?? 502;
			const payload: ErrorResponse = {
				error: err.message,
				code: err.code ?? "GITHUB_API_ERROR",
				retryable: err.retryable,
			};
			return json(payload, { status });
		}
		// Generic error handling since we removed GroqApiError
		// The AI SDK throws standard errors, and we can catch them here if needed
		// For now, treat them as internal server errors
		console.error("Analysis failed:", err);

		const payload: ErrorResponse = {
			// biome-ignore lint/suspicious/noExplicitAny: Accessing message on unknown error
			error: (err as any)?.message ?? "Internal Server Error",
			code: "INTERNAL_ERROR",
			retryable: false,
		};
		return json(payload, { status: 500 });
	}
}
