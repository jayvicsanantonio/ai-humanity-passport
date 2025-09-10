import { z } from "zod";
import prisma from "@/lib/db";
import {
	createGitHubClient,
	fetchRepoData,
	GitHubApiError,
} from "@/lib/github";
import { analyzeRepositoryWithGroq, GroqApiError } from "@/lib/llm";
import { parseGitHubUrl, validateGitHubUrl } from "@/lib/validation";

export const runtime = "nodejs";

// Simple in-memory rate limiter (per-IP, sliding window)
const RATE_LIMIT_MAX = Number.parseInt(process.env.RATE_LIMIT_MAX ?? "5", 10);
const RATE_LIMIT_WINDOW_MS = Number.parseInt(
	process.env.RATE_LIMIT_WINDOW_MS ?? "60000",
	10,
);
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
		.string({ required_error: "Please enter a GitHub repository URL" })
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

	try {
		const octokit = createGitHubClient();
		const { metadata, readme } = await fetchRepoData(octokit, owner, repo);

		const analysis = await analyzeRepositoryWithGroq(null, {
			metadata,
			readme,
		});

		await prisma.analysis.upsert({
			where: { owner_repo: { owner, repo } },
			update: {
				verdict: analysis.verdict,
				details: analysis.details,
			},
			create: {
				owner,
				repo,
				verdict: analysis.verdict,
				details: analysis.details,
			},
		});

		return json(
			{ owner, repo, verdict: analysis.verdict, details: analysis.details },
			{ status: 200 },
		);
	} catch (err: any) {
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
		if (err instanceof GroqApiError) {
			const status = err.status ?? (err.retryable ? 503 : 500);
			const payload: ErrorResponse = {
				error: err.message,
				code: err.code ?? "GROQ_API_ERROR",
				retryable: err.retryable,
			};
			return json(payload, { status });
		}

		const payload: ErrorResponse = {
			error: err?.message ?? "Internal server error",
			code: "INTERNAL_SERVER_ERROR",
		};
		return json(payload, { status: 500 });
	}
}
