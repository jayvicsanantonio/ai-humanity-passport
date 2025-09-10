import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "../copy-button";

// Mock clipboard API
Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn(),
	},
});

describe("CopyButton Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders copy button with default text", () => {
		render(<CopyButton text="test text" />);

		const button = screen.getByRole("button", { name: "Copy" });
		expect(button).toBeInTheDocument();
	});

	it("copies text to clipboard when clicked", async () => {
		const testText = "test markdown code";
		vi.mocked(navigator.clipboard.writeText).mockResolvedValue();

		render(<CopyButton text={testText} />);

		const button = screen.getByRole("button", { name: "Copy" });
		fireEvent.click(button);

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "Copied!" }),
			).toBeInTheDocument();
		});
	});

	it("shows copied state temporarily", async () => {
		vi.mocked(navigator.clipboard.writeText).mockResolvedValue();

		render(<CopyButton text="test text" />);

		const button = screen.getByRole("button", { name: "Copy" });
		fireEvent.click(button);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "Copied!" }),
			).toBeInTheDocument();
		});

		// Wait for the timeout to reset the state
		await waitFor(
			() => {
				expect(
					screen.getByRole("button", { name: "Copy" }),
				).toBeInTheDocument();
			},
			{ timeout: 3000 },
		);
	});

	it("handles clipboard API errors gracefully", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
			new Error("Clipboard error"),
		);

		render(<CopyButton text="test text" />);

		const button = screen.getByRole("button", { name: "Copy" });
		fireEvent.click(button);

		await waitFor(() => {
			expect(consoleSpy).toHaveBeenCalledWith(
				"Failed to copy text:",
				expect.any(Error),
			);
		});

		// Button should remain in "Copy" state
		expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();

		consoleSpy.mockRestore();
	});

	it("applies custom className", () => {
		render(<CopyButton text="test text" className="custom-class" />);

		const button = screen.getByRole("button", { name: "Copy" });
		expect(button).toHaveClass("custom-class");
	});
});
