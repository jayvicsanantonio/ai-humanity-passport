import { openai } from "@ai-sdk/openai";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { generateObject, generateText } from "ai";
import pLimit from "p-limit";
import { z } from "zod";
import type { RepoMetadata } from "@/lib/github";

type AnalysisVerdict = "approved" | "rejected";

interface AnalysisResult {
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

function truncate(text: string, max = 6000): string {
	if (!text) return "";
	if (text.length <= max) return text;
	return `${text.slice(0, max)}\n...\n[truncated]`;
}

function buildSummaryMessage(doc: { pageContent: string }) {
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
	// 1. Load repo files with selective filtering
	console.log(`[processGithubRepository] Starting processing for: ${repoUrl}`);
	const loader = new GithubRepoLoader(repoUrl, {
		branch: "main",
		recursive: true,
		ignoreFiles: [
			"package-lock.json",
			"yarn.lock",
			"pnpm-lock.yaml",
			"bun.lockb",
			"*.svg",
			"*.png",
			"*.jpg",
			"*.jpeg",
			"*.gif",
			"*.ico",
			"*.json", // often data files, not logic
			"dist/**",
			"build/**",
			".next/**",
			"node_modules/**",
			"**/.*", // Ignore everything in a dot file or dot folder
		],
	});

	// Load docs and filter out extremely large files or irrelevant ones if needed
	const docs = await loader.load();
	console.log(`[processGithubRepository] Loaded ${docs.length} files.`);

	const relevantDocs = docs.filter((doc) => doc.pageContent.length < 50000); // Skip huge files
	console.log(
		`[processGithubRepository] Filtered to ${relevantDocs.length} relevant files (removed ${docs.length - relevantDocs.length} large files).`,
	);

	// 2. Split into chunks
	const splitter = new RecursiveCharacterTextSplitter({
		chunkSize: 4000, // Increased chunk size to reduce number of calls
		chunkOverlap: 200,
	});
	const splitDocs = await splitter.splitDocuments(relevantDocs);
	console.log(
		`[processGithubRepository] Split into ${splitDocs.length} chunks.`,
	);

	// Limit to a reasonable number of chunks to prevent timeouts
	const MAX_CHUNKS = 20;
	const chunksToProcess = splitDocs.slice(0, MAX_CHUNKS);
	if (splitDocs.length > MAX_CHUNKS) {
		console.log(
			`[processGithubRepository] Limiting to first ${MAX_CHUNKS} chunks (dropped ${splitDocs.length - MAX_CHUNKS}).`,
		);
	}

	// 3. Map step: summarize each chunk deeply in parallel
	console.log(
		`[processGithubRepository] Starting parallel summarization of ${chunksToProcess.length} chunks...`,
	);
	const limit = pLimit(5); // Concurrency limit
	let completed = 0;
	const summaryPromises = chunksToProcess.map((doc, index) =>
		limit(async () => {
			const start = Date.now();
			const res = await summarizeRepository(null, { doc });
			completed++;
			console.log(
				`[processGithubRepository] Chunk ${index + 1}/${chunksToProcess.length} summarized in ${Date.now() - start}ms. (${completed}/${chunksToProcess.length})`,
			);
			return res;
		}),
	);

	const summaries = await Promise.all(summaryPromises);
	console.log(`[processGithubRepository] All chunks summarized.`);

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
