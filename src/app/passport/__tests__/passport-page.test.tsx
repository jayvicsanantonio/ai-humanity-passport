import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PassportPage from "../[owner]/[repo]/page";

// Mock the database
vi.mock("@/lib/db", () => ({
	prisma: {
		analysis: {
			findFirst: vi.fn(),
		},
	},
}));

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
	notFound: vi.fn(),
}));

// Mock components
vi.mock("@/components/passport/badge", () => ({
	Badge: ({ owner, repo }: { owner: string; repo: string }) => (
		<div data-testid="badge">
			Badge for {owner}/{repo}
		</div>
	),
}));

vi.mock("@/components/passport/copy-button", () => ({
	CopyButton: () => (
		<button type="button" data-testid="copy-button">
			Copy
		</button>
	),
}));

const { prisma } = await import("@/lib/db");

describe("PassportPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Set up environment variable for tests
		process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it("renders analysis results for approved repository", async () => {
		const mockAnalysis = {
			id: 1,
			owner: "testowner",
			repo: "testrepo",
			verdict: "approved",
			details:
				"This repository contributes positively to humanity through its educational content.",
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		vi.mocked(prisma.analysis.findFirst).mockResolvedValue(mockAnalysis);

		const component = await PassportPage({
			params: Promise.resolve({ owner: "testowner", repo: "testrepo" }),
		});

		render(component);

		expect(screen.getByText("Humanity Passport")).toBeInTheDocument();
		expect(screen.getByText("testowner/testrepo")).toBeInTheDocument();
		expect(screen.getByText("Analysis Result: Approved")).toBeInTheDocument();
		expect(
			screen.getByText(
				"This repository contributes positively to humanity through its educational content.",
			),
		).toBeInTheDocument();
		expect(screen.getByTestId("badge")).toBeInTheDocument();
		expect(screen.getByText("Embed Badge")).toBeInTheDocument();
		expect(screen.getByTestId("copy-button")).toBeInTheDocument();
	});

	it("renders analysis results for rejected repository", async () => {
		const mockAnalysis = {
			id: 2,
			owner: "testowner",
			repo: "badrepo",
			verdict: "rejected",
			details:
				"This repository does not meet the criteria for positive impact.",
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		vi.mocked(prisma.analysis.findFirst).mockResolvedValue(mockAnalysis);

		const component = await PassportPage({
			params: Promise.resolve({ owner: "testowner", repo: "badrepo" }),
		});

		render(component);

		expect(
			screen.getByText("Analysis Result: Not Approved"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"This repository does not meet the criteria for positive impact.",
			),
		).toBeInTheDocument();
		expect(screen.getByTestId("badge")).toBeInTheDocument();
	});

	it("renders not analyzed message when repository is not found", async () => {
		vi.mocked(prisma.analysis.findFirst).mockResolvedValue(null);

		const component = await PassportPage({
			params: Promise.resolve({ owner: "unknown", repo: "repo" }),
		});

		render(component);

		expect(screen.getByText("Repository Not Analyzed")).toBeInTheDocument();
		expect(
			screen.getByText((_content, element) => {
				return (
					element?.textContent ===
					"The repository unknown/repo has not been analyzed yet."
				);
			}),
		).toBeInTheDocument();
		expect(screen.getByText("Analyze Repository")).toBeInTheDocument();
	});

	it("handles URL-encoded parameters correctly", async () => {
		const mockAnalysis = {
			id: 3,
			owner: "test-owner",
			repo: "test.repo",
			verdict: "approved",
			details: "Test analysis",
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		vi.mocked(prisma.analysis.findFirst).mockResolvedValue(mockAnalysis);

		const component = await PassportPage({
			params: Promise.resolve({ owner: "test%2Downer", repo: "test%2Erepo" }),
		});

		render(component);

		expect(screen.getByText("test-owner/test.repo")).toBeInTheDocument();
		expect(prisma.analysis.findFirst).toHaveBeenCalledWith({
			where: {
				owner: "test-owner",
				repo: "test.repo",
			},
		});
	});

	it("handles database errors gracefully", async () => {
		vi.mocked(prisma.analysis.findFirst).mockRejectedValue(
			new Error("Database connection failed"),
		);

		const component = await PassportPage({
			params: Promise.resolve({ owner: "testowner", repo: "testrepo" }),
		});

		render(component);

		expect(screen.getByText("Repository Not Analyzed")).toBeInTheDocument();
	});

	it("generates correct badge markdown", async () => {
		const mockAnalysis = {
			id: 1,
			owner: "testowner",
			repo: "testrepo",
			verdict: "approved",
			details: "Test analysis",
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		vi.mocked(prisma.analysis.findFirst).mockResolvedValue(mockAnalysis);

		const component = await PassportPage({
			params: Promise.resolve({ owner: "testowner", repo: "testrepo" }),
		});

		render(component);

		const expectedMarkdown =
			"[![Humanity Passport](http://localhost:3000/api/badge/testowner/testrepo)](http://localhost:3000/passport/testowner/testrepo)";
		expect(screen.getByText(expectedMarkdown)).toBeInTheDocument();
	});
});
