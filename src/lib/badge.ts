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

// Visual constants (LARGE badge)
const HEIGHT = 180; // larger, card-like presence for better visibility on regular devices
const CAP = 120; // left crest cap width
const _PAD = 24; // inner padding
const MIN_WIDTH = 100; // minimum overall width for layout balance
const FONT_STACK = "Inter,Segoe UI,DejaVu Sans,Verdana,Geneva,sans-serif";

// Typography sizes
const BRAND_SIZE = 26; // "Humanity+ Passport"
const OWNER_SIZE = 18; // owner/repo
const CHIP_SIZE = 18; // state chip text

// Chip metrics
const CHIP_H = 48;
const CHIP_RADIUS = 24;
const CHIP_ICON_W = 20; // width reserved for icon inside chip
const GAP = 20; // crest ↔ text gap
const GAP_TO_CHIP = 24; // text block ↔ chip gap
const LPAD = 40; // left outer padding
const RPAD = 40; // right outer padding

// Approximate text width given font size; tuned for these faces
function textWidth(text: string, size: number): number {
	const perChar = size * 0.62; // empirical factor for sans stacks
	return Math.ceil(text.length * perChar);
}

// Keep small helper for legacy use (not used in large layout, but harmless)
function _measure(_text: string): number {
	return MIN_WIDTH;
}

// Simple deterministic id suffix to avoid <defs> collisions when inlined
function uid(s: string): string {
	let h = 5381;
	for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
	return (h >>> 0).toString(36);
}

export function generateBadgeSVG(opts: BadgeOptions): string {
	const ownerLc = opts.owner.toLowerCase();
	const repoLc = opts.repo.toLowerCase();
	const enc = (v: string) => encodeURIComponent(v).replace(/'/g, "%27");
	const href = `/passport/${enc(ownerLc)}/${enc(repoLc)}`;

	// Copy and layout metrics
	const brand = "Humanity+ Passport"; // must be present in all states
	const ownerRepo = `${ownerLc}/${repoLc}`;

	const chipText =
		opts.state === "approved"
			? "APPROVED"
			: opts.state === "rejected"
				? "NOT APPROVED"
				: "ANALYSIS PENDING";

	const brandW = textWidth(brand, BRAND_SIZE);
	const ownerW = textWidth(ownerRepo, OWNER_SIZE);
	const chipTextW = textWidth(chipText, CHIP_SIZE);
	const chipW = CHIP_PADW() + CHIP_ICON_W + 26 + chipTextW + CHIP_PADW();
	const textBlockW = Math.max(brandW, ownerW);
	const computedWidth =
		LPAD + CAP + GAP + textBlockW + GAP_TO_CHIP + chipW + RPAD;
	const width = Math.max(MIN_WIDTH, computedWidth);

	const id = uid(`${ownerLc}/${repoLc}/${opts.state}`);
	const title = `${brand} — ${ownerRepo} — ${chipText}`;

	// Colors per state
	let bgStops: [string, string];
	let chipFill = "#64748b";
	const capOverlay = "#000000";
	let borderStroke = "#ffffff";
	const accent = "#22d3ee"; // cyan

	if (opts.state === "approved") {
		bgStops = ["#065f46", "#22c55e"]; // deep green → green
		chipFill = "#16a34a";
		borderStroke = "#86efac";
	} else if (opts.state === "rejected") {
		bgStops = ["#3f3f46", "#6b7280"]; // zinc → gray
		chipFill = "#ef4444";
		borderStroke = "#fecaca";
	} else {
		bgStops = ["#334155", "#64748b"]; // slate gradient
		chipFill = "#0ea5e9"; // calming blue accent
		borderStroke = "#bae6fd";
	}

	const head =
		`<?xml version="1.0" encoding="UTF-8"?>` +
		`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${HEIGHT}" role="img" aria-label="${escapeXml(
			title,
		)}">` +
		`<title>${escapeXml(title)}</title>` +
		`<defs>` +
		`<linearGradient id="gBg-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgStops[0]}"/><stop offset="1" stop-color="${bgStops[1]}"/></linearGradient>` +
		`<linearGradient id="gSh-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.18"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>` +
		`</defs>` +
		`<a xlink:href="${escapeXml(href)}" target="_self">` +
		`<g shape-rendering="geometricPrecision">`;

	const tail = `</g></a></svg>`;

	// Background panel
	const base =
		`<rect rx="12" width="${width}" height="${HEIGHT}" fill="url(#gBg-${id})"/>` +
		`<rect rx="12" width="${width}" height="${HEIGHT}" fill="url(#gSh-${id})"/>` +
		`<rect rx="12" width="${width}" height="${HEIGHT}" fill="none" stroke="${borderStroke}" stroke-opacity="0.25"/>` +
		// corner brackets (stroke based)
		`<path d="M12 12h16 M12 12v16" stroke="${accent}" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round"/>` +
		`<path d="M${width - 12} 12h-16 M${width - 12} 12v16" stroke="${accent}" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round"/>` +
		`<path d="M12 ${HEIGHT - 12}h16 M12 ${HEIGHT - 12}v-16" stroke="${accent}" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>` +
		`<path d="M${width - 12} ${HEIGHT - 12}h-16 M${width - 12} ${HEIGHT - 12}v-16" stroke="${accent}" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>`;

	// Crest cap (left)
	const cap =
		`<rect x="${LPAD}" y="18" width="${CAP}" height="${HEIGHT - 36}" rx="20" fill="${capOverlay}" opacity="0.25"/>` +
		`<circle cx="${LPAD + CAP / 2}" cy="${HEIGHT / 2}" r="40" fill="#0f172a" opacity="0.55"/>` +
		`<circle cx="${LPAD + CAP / 2}" cy="${HEIGHT / 2}" r="40" fill="none" stroke="${accent}" stroke-opacity="0.5"/>` +
		`<text x="${LPAD + CAP / 2}" y="${HEIGHT / 2 + 11}" text-anchor="middle" font-family="${FONT_STACK}" font-size="32" fill="#ffffff" font-weight="700">H+</text>`;

	// Text block positions
	const textX = LPAD + CAP + GAP;
	const brandY = 55; // visually centered upper line
	const ownerY = 85; // lower line

	const texts =
		`<text x="${textX}" y="${brandY}" font-family="${FONT_STACK}" font-weight="700" font-size="${BRAND_SIZE}" fill="#ffffff">${escapeXml(
			brand,
		)} </text>` +
		`<text x="${textX}" y="${ownerY}" font-family="${FONT_STACK}" font-size="${OWNER_SIZE}" fill="#d1fae5">${escapeXml(
			ownerRepo,
		)} </text>`;

	// Chip placement
	const chipX = width - RPAD - chipW;
	const chipY = (HEIGHT - CHIP_H) / 2;

	// Small icons per state
	const icon =
		opts.state === "approved"
			? `<path d="M3 9l3 3 7-7" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
			: opts.state === "rejected"
				? `<g><rect x="7" y="4" width="2" height="7" rx="1" fill="#ffffff"/><rect x="7" y="12" width="2" height="2" rx="1" fill="#ffffff"/></g>`
				: `<g><circle cx="8" cy="8" r="6" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="2"/><path d="M8 2a6 6 0 0 1 4.5 2" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></g>`;

	const chip =
		`<g transform="translate(${chipX},${chipY})">` +
		`<rect width="${chipW}" height="${CHIP_H}" rx="${CHIP_RADIUS}" fill="${chipFill}" opacity="0.95"/>` +
		`<g transform="translate(${CHIP_PADW()},${(CHIP_H - 18) / 2})">${icon}</g>` +
		`<text x="${CHIP_PADW() + CHIP_ICON_W + 6}" y="${Math.round(CHIP_H / 2 + CHIP_SIZE / 2 - 2)}" font-family="${FONT_STACK}" font-size="${CHIP_SIZE}" fill="#ffffff" font-weight="700">${escapeXml(
			chipText,
		)} </text>` +
		`</g>`;

	return head + base + cap + texts + chip + tail;
}

// Helper to keep chip horizontal padding together (allows inlining above without string duplication)
function CHIP_PADW(): number {
	return 16;
}
