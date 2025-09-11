import { describe, expect, it } from "vitest";
import { generateBadgeSVG } from "@/lib/badge";

describe("generateBadgeSVG", () => {
	it("renders approved badge with correct text and color", () => {
		const svg = generateBadgeSVG({ owner: "o", repo: "r", state: "approved" });
		expect(svg).toContain("Humanity+ Passport");
		expect(svg).toContain("#22c55e");
		expect(svg).toContain("/passport/o/r");
	});

	it("renders rejected badge with correct text and color", () => {
		const svg = generateBadgeSVG({ owner: "o", repo: "r", state: "rejected" });
		expect(svg).toContain("NOT APPROVED");
		expect(svg).toContain("#ef4444");
	});

	it("renders pending badge with correct text and color", () => {
		const svg = generateBadgeSVG({ owner: "o", repo: "r", state: "pending" });
		expect(svg).toContain("ANALYSIS PENDING");
		expect(svg).toContain("#64748b");
	});

	it("escapes XML entities in owner/repo and keeps link relative", () => {
		const svg = generateBadgeSVG({
			owner: "o&<>",
			repo: "r'\"",
			state: "pending",
		});
		// Should include encoded entities, and not break the SVG
		expect(svg).toContain("&amp;");
		expect(svg).toContain("&lt;");
		expect(svg).toContain("&quot;");
		expect(svg).toContain("/passport/o%26%3C%3E/r%27%22");
	});
});
