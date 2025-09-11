/**
 * Tests for the pro tip message logic
 */

import { describe, expect, it } from "vitest";

// Extract the function for testing
function getProTipMessage(verdict: string, details: string): string {
	const lowerDetails = details.toLowerCase();

	// Check if it's a personal/learning project first (higher priority)
	const isPersonalOrLearning =
		lowerDetails.includes("personal") ||
		lowerDetails.includes("portfolio") ||
		lowerDetails.includes("learning") ||
		lowerDetails.includes("experimental") ||
		lowerDetails.includes("tutorial") ||
		lowerDetails.includes("practice") ||
		lowerDetails.includes("knowledge sharing") ||
		lowerDetails.includes("educational resource");

	// Check if the project has positive social impact based on verdict and details
	const hasPositiveSocialImpact =
		verdict === "approved" &&
		(lowerDetails.includes("accessibility") ||
			lowerDetails.includes("sustainability") ||
			(lowerDetails.includes("education") && !isPersonalOrLearning) ||
			lowerDetails.includes("health") ||
			(lowerDetails.includes("open knowledge") &&
				!lowerDetails.includes("knowledge sharing")) ||
			lowerDetails.includes("social") ||
			lowerDetails.includes("community") ||
			lowerDetails.includes("humanitarian") ||
			lowerDetails.includes("environment") ||
			lowerDetails.includes("public good") ||
			lowerDetails.includes("societal benefit"));

	if (isPersonalOrLearning || verdict !== "approved") {
		return "Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.";
	} else if (hasPositiveSocialImpact) {
		return "Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.";
	} else {
		// Default message for approved projects that don't clearly fall into other categories
		return "Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.";
	}
}

describe("getProTipMessage", () => {
	it("should return positive impact message for approved projects with social benefits", () => {
		const result = getProTipMessage(
			"approved",
			"This project improves accessibility for users with disabilities and promotes education.",
		);
		expect(result).toBe(
			"Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.",
		);
	});

	it("should return learning message for personal/portfolio projects", () => {
		const result = getProTipMessage(
			"approved",
			"This is a personal portfolio project showcasing my learning journey.",
		);
		expect(result).toBe(
			"Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.",
		);
	});

	it("should return learning message for experimental projects", () => {
		const result = getProTipMessage(
			"approved",
			"This is an experimental tutorial project for practice.",
		);
		expect(result).toBe(
			"Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.",
		);
	});

	it("should return learning message for rejected projects", () => {
		const result = getProTipMessage(
			"rejected",
			"This project doesn't have clear social benefits.",
		);
		expect(result).toBe(
			"Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.",
		);
	});

	it("should return positive impact message for sustainability projects", () => {
		const result = getProTipMessage(
			"approved",
			"This project focuses on environmental sustainability and reducing carbon footprint.",
		);
		expect(result).toBe(
			"Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.",
		);
	});

	it("should return positive impact message for health-related projects", () => {
		const result = getProTipMessage(
			"approved",
			"This application helps improve public health outcomes in underserved communities.",
		);
		expect(result).toBe(
			"Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.",
		);
	});

	it("should return learning message for knowledge sharing projects", () => {
		const result = getProTipMessage(
			"approved",
			"This repository contains educational resources and knowledge sharing materials.",
		);
		expect(result).toBe(
			"Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.",
		);
	});

	it("should default to positive impact message for approved projects without clear categorization", () => {
		const result = getProTipMessage(
			"approved",
			"This is a well-built application with good code quality.",
		);
		expect(result).toBe(
			"Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.",
		);
	});
});
