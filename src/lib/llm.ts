import { openai } from "@ai-sdk/openai";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import type { RepoMetadata } from "@/lib/github";

export type AnalysisVerdict = "approved" | "rejected";

export interface AnalysisResult {
	verdict: AnalysisVerdict;
	details: string;
	strengths?: string[];
	concerns?: string[];
}

// Zod schema for the analysis result
const AnalysisSchema = z.object({
	verdict: z.enum(["approved", "rejected"]),
	details: z.string(),
	strengths: z.array(z.string()).optional(),
	concerns: z.array(z.string()).optional(),
});

export function truncate(text: string, max = 6000): string {
	if (!text) return "";
	if (text.length <= max) return text;
	return `${text.slice(0, max)}\n...\n[truncated]`;
}

export function buildSummaryMessage(doc: { pageContent: string }) {
	const system =
		"You are an assistant that summarizes code into plain text. Focus on what the code does and any potential social or ethical impact.";
	return [
		{ role: "system" as const, content: system },
		{ role: "user" as const, content: doc.pageContent },
	];
}

export function buildAnalysisMessages(input: {
	metadata: RepoMetadata;
	readme?: string | null;
	summary?: string | null;
}): Array<{ role: "system" | "user"; content: string }> {
	const { metadata, readme, summary } = input;
	const topics = metadata.topics?.length
		? metadata.topics.join(", ")
		: "(none)";

	const system = `You are an expert evaluator of open-source projects with a focus on positive societal impact.
Assess whether the project benefits humanity, avoiding harm or abuse. Be objective and conservative.`;

	const user = `Repository: ${metadata.owner}/${metadata.repo}
Description: ${metadata.description ?? "(none)"}
Stars: ${metadata.stars}
Topics: ${topics}
URL: ${metadata.htmlUrl}

Top of README (truncated):
${truncate(readme ?? "", 6000)}

${summary ?? ""}`;

	return [
		{ role: "system" as const, content: system },
		{ role: "user" as const, content: user },
	];
}

export async function processGithubRepository(
	repoUrl: string,
): Promise<string> {
	// 1. Load repo files
	const loader = new GithubRepoLoader(repoUrl, {
		branch: "main",
		recursive: true,
	});
	const docs = await loader.load();

	// 2. Split into chunks
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 2000,
		chunkOverlap: 200,
	});
	const splitDocs = await splitter.splitDocuments(docs);

	// 3. Map step: summarize each chunk
	const summaries: string[] = [];
	for (const doc of splitDocs) {
		const summary = await summarizeRepository(null, { doc });
		summaries.push(summary);
	}
	// 4. Reduce step: combine into a single summary
	return summaries.join("\n\n");
}

export async function summarizeRepository(
	// keeping signature compatible with callers if any, though 'client' is unused
	_client: unknown | null,
	input: { doc: { pageContent: string } },
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
		attempts?: number; // SDK handles retries, but we keep param for compat
		baseDelayMs?: number; // unused
	},
): Promise<string> {
	const modelId = options?.model ?? "gpt-5-nano";
	const temperature = options?.temperature ?? 0.2;
	const _maxTokens = options?.maxTokens ?? 1024;
	const msg = buildSummaryMessage(input.doc);

	const { text } = await generateText({
		model: openai(modelId),
		messages: msg,
		temperature,
		maxRetries: options?.attempts ?? 3,
	});

	return text.trim();
}

export async function analyzeRepository(
	_client: unknown | null,
	input: {
		metadata: RepoMetadata;
		readme?: string | null;
		summary?: string | null;
	},
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
		attempts?: number; // SDK handles retries
		baseDelayMs?: number; // unused
	},
): Promise<AnalysisResult> {
	const modelId = options?.model ?? "gpt-5-nano";
	const temperature = options?.temperature ?? 0.2;
	const _maxTokens = options?.maxTokens ?? 1024;

	const messages = buildAnalysisMessages(input);

	const { object } = await generateObject({
		model: openai(modelId),
		schema: AnalysisSchema,
		messages,
		temperature,
		maxRetries: options?.attempts ?? 3,
	});

	return object as AnalysisResult;
}
