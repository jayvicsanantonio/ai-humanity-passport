export type BadgeState = "approved" | "rejected" | "pending";

export interface BadgeOptions {
	owner: string;
	repo: string;
	state: BadgeState;
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function getTheme(state: BadgeState): { color: string; text: string } {
	switch (state) {
		case "approved":
			return { color: "#22c55e", text: "Humanity+ Passport" };
		case "rejected":
			return { color: "#ef4444", text: "Not Approved" };
		default:
			return { color: "#6b7280", text: "Analysis Pending" };
	}
}

function measureWidth(text: string): number {
	// Rough width estimation per character; adequate for simple badges
	const perChar = 7; // px per char approximation
	const padding = 20; // horizontal padding
	const minWidth = 120;
	return Math.max(minWidth, padding + text.length * perChar);
}

/**
 * Generates a minimal SVG badge. The SVG contains an <a> link to the passport page
 * so it is clickable when viewed directly. In README usage, you should still wrap
 * the image in a Markdown link pointing to /passport/[owner]/[repo].
 */
export function generateBadgeSVG(opts: BadgeOptions): string {
	const ownerLc = opts.owner.toLowerCase();
	const repoLc = opts.repo.toLowerCase();
	const { color, text } = getTheme(opts.state);
	const width = measureWidth(text);
	const height = 20;
	const title = `${text} — ${ownerLc}/${repoLc}`;
	const enc = (s: string) => encodeURIComponent(s).replace(/'/g, "%27");
	const href = `/passport/${enc(ownerLc)}/${enc(repoLc)}`;

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" role="img" aria-label="${escapeXml(
		title,
	)}">
  <title>${escapeXml(title)}</title>
  <a xlink:href="${escapeXml(href)}" target="_self">
    <rect rx="4" width="${width}" height="${height}" fill="${color}"/>
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
      <text x="${width / 2}" y="14">${escapeXml(text)}</text>
    </g>
  </a>
</svg>`;
}
