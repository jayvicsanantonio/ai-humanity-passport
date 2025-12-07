import crypto from "node:crypto";
import { type BadgeState, generateBadgeSVG } from "@/lib/badge";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function isValidSlug(s: string): boolean {
	return /^[a-z0-9_.-]+$/i.test(s);
}

function svgResponse(content: string, req: Request): Response {
	const etag = `W/"${crypto.createHash("sha1").update(content).digest("hex")}"`;
	const inm = req.headers.get("if-none-match");
	if (inm && inm === etag) {
		return new Response(null, {
			status: 304,
			headers: {
				"cache-control": "public, max-age=300, s-maxage=600",
				etag,
				"x-content-type-options": "nosniff",
			},
		});
	}

	return new Response(content, {
		status: 200,
		headers: {
			"content-type": "image/svg+xml; charset=utf-8",
			"cache-control": "public, max-age=300, s-maxage=600",
			etag,
			"x-content-type-options": "nosniff",
		},
	});
}

export async function GET(
	req: Request,
	ctx: { params: Promise<{ owner: string; repo: string }> },
) {
	const { owner: ownerParamRaw, repo: repoParamRaw } = await ctx.params;
	const ownerParam = ownerParamRaw ?? "";
	const repoParam = repoParamRaw ?? "";

	if (!isValidSlug(ownerParam) || !isValidSlug(repoParam)) {
		// Return a small pending badge for invalid inputs (don't leak details)
		const content = generateBadgeSVG({
			owner: "unknown",
			repo: "unknown",
			state: "pending",
		});
		return svgResponse(content, req);
	}

	const ownerLc = ownerParam.toLowerCase();
	const repoLc = repoParam.toLowerCase();

	try {
		const analysis = await prisma.analysis.findUnique({
			where: { owner_repo: { owner: ownerLc, repo: repoLc } },
			select: { verdict: true },
		});

		let state: BadgeState = "pending";
		if (analysis?.verdict === "approved") state = "approved";
		else if (analysis?.verdict === "rejected") state = "rejected";

		const content = generateBadgeSVG({ owner: ownerLc, repo: repoLc, state });
		return svgResponse(content, req);
	} catch (_err) {
		// On DB errors, serve a pending badge to avoid leaking server details
		const content = generateBadgeSVG({
			owner: ownerLc,
			repo: repoLc,
			state: "pending",
		});
		return svgResponse(content, req);
	}
}
