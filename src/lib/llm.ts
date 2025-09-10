import Groq from "groq-sdk";
import type { RepoMetadata } from "@/lib/github";

export type AnalysisVerdict = "approved" | "rejected";

export interface AnalysisResult {
	verdict: AnalysisVerdict;
	details: string;
	strengths?: string[];
	concerns?: string[];
}

export class GroqApiError extends Error {
	status?: number;
	code?: string;
	retryable: boolean;

	constructor(
		message: string,
		opts?: { status?: number; code?: string; retryable?: boolean },
	) {
		super(message);
		this.name = "GroqApiError";
		this.status = opts?.status;
		this.code = opts?.code;
		const s = this.status;
		const retryableByStatus = !!(
			s && [408, 429, 500, 502, 503, 504].includes(s)
		);
		this.retryable = opts?.retryable ?? retryableByStatus;
	}
}

export function createGroqClient(options?: { apiKey?: string }) {
	const apiKey = options?.apiKey ?? process.env.GROQ_API_KEY;
	if (!apiKey) {
		throw new GroqApiError(
			"Missing GROQ_API_KEY. Set it in your environment to call the Groq API.",
			{ code: "GROQ_API_KEY_MISSING", retryable: false },
		);
	}
	return new Groq({ apiKey });
}

export function truncate(text: string, max = 6000): string {
	if (!text) return "";
	if (text.length <= max) return text;
	return text.slice(0, max) + "\n...\n[truncated]";
}

export function buildAnalysisMessages(input: {
	metadata: RepoMetadata;
	readme?: string | null;
}): Array<{ role: "system" | "user"; content: string }> {
	const { metadata, readme } = input;
	const topics = metadata.topics?.length
		? metadata.topics.join(", ")
		: "(none)";

	const system = `You are an expert evaluator of open-source projects with a focus on positive societal impact.
Assess whether the project benefits humanity, avoiding harm or abuse. Be objective and conservative.

Return ONLY a strict JSON object with this schema:
{
  "verdict": "approved" | "rejected",
  "details": string,
  "strengths": string[],
  "concerns": string[]
}`;

	const user = `Repository: ${metadata.owner}/${metadata.repo}
Description: ${metadata.description ?? "(none)"}
Stars: ${metadata.stars}
Topics: ${topics}
URL: ${metadata.htmlUrl}

Top of README (truncated):\n${truncate(readme ?? "", 6000)}`;

	return [
		{ role: "system" as const, content: system },
		{ role: "user" as const, content: user },
	];
}

function extractJson(text: string): string | null {
	if (!text) return null;
	// 1) Try fenced ```json code block
	const fencedJson = text.match(/```json\s*([\s\S]*?)```/i);
	if (fencedJson && fencedJson[1]) {
		return fencedJson[1].trim();
	}
	// 2) Try any fenced block
	const fenced = text.match(/```\s*([\s\S]*?)```/);
	if (fenced && fenced[1]) {
		return fenced[1].trim();
	}
	// 3) Try naive brace extraction (first { ... last })
	const first = text.indexOf("{");
	const last = text.lastIndexOf("}");
	if (first !== -1 && last !== -1 && last > first) {
		return text.slice(first, last + 1).trim();
	}
	return null;
}

export function parseGroqAnalysisText(text: string): AnalysisResult {
	const jsonLike = extractJson(text) ?? text;
	let parsed: any;
	try {
		parsed = JSON.parse(jsonLike);
	} catch (e) {
		throw new GroqApiError("Failed to parse LLM response as JSON", {
			code: "GROQ_PARSE_ERROR",
			retryable: false,
		});
	}

	const verdictRaw = String(parsed.verdict ?? "").toLowerCase();
	if (verdictRaw !== "approved" && verdictRaw !== "rejected") {
		throw new GroqApiError("Invalid or missing verdict in LLM response", {
			code: "GROQ_INVALID_VERDICT",
			retryable: false,
		});
	}

	const details =
		typeof parsed.details === "string" ? parsed.details.trim() : "";
	const strengths = Array.isArray(parsed.strengths)
		? parsed.strengths.map((s: any) => String(s))
		: typeof parsed.strengths === "string" && parsed.strengths
			? [String(parsed.strengths)]
			: [];
	const concerns = Array.isArray(parsed.concerns)
		? parsed.concerns.map((s: any) => String(s))
		: typeof parsed.concerns === "string" && parsed.concerns
			? [String(parsed.concerns)]
			: [];

	return {
		verdict: verdictRaw as AnalysisVerdict,
		details,
		strengths,
		concerns,
	};
}

export async function analyzeRepositoryWithGroq(
	client:
		| ReturnType<typeof createGroqClient>
		| { chat: { completions: { create: Function } } }
		| null,
	input: { metadata: RepoMetadata; readme?: string | null },
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
		attempts?: number;
		baseDelayMs?: number;
	},
): Promise<AnalysisResult> {
	const groq = client ?? createGroqClient();

	const model = options?.model ?? "openai/gpt-oss-20b";
	const temperature = options?.temperature ?? 0.2;
	const max_tokens = options?.maxTokens ?? 1024;
	const attempts = Math.max(1, options?.attempts ?? 3);
	const baseDelayMs = options?.baseDelayMs ?? 400;

	const messages = buildAnalysisMessages(input);

	let lastErr: unknown;
	for (let i = 0; i < attempts; i++) {
		try {
			const resp: any = await (groq as any).chat.completions.create({
				model,
				messages,
				temperature,
				max_tokens,
			});
			const content: string | undefined = resp?.choices?.[0]?.message?.content;
			if (!content) {
				throw new GroqApiError("Groq response missing content", {
					code: "GROQ_EMPTY_CONTENT",
					retryable: true,
				});
			}
			return parseGroqAnalysisText(content);
		} catch (err: any) {
			lastErr = err;
			const status = err?.status ?? err?.statusCode ?? err?.response?.status;
			const retryable = !!(
				status && [408, 429, 500, 502, 503, 504].includes(status)
			);
			const shouldRetry = retryable && i < attempts - 1;
			if (!shouldRetry) {
				// Re-throw as GroqApiError for consistent handling
				if (err instanceof GroqApiError) throw err;
				throw new GroqApiError(err?.message ?? "Groq API error", {
					status,
					code: err?.code,
					retryable,
				});
			}
			const delay = baseDelayMs * 2 ** i; // simple backoff
			await new Promise((res) => setTimeout(res, delay));
		}
	}

	// Should not reach here due to early returns/throws
	throw lastErr;
}
