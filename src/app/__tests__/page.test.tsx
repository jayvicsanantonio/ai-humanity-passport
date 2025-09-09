import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Home from "../page";

// Mock the toast function
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

// Mock fetch
global.fetch = vi.fn();

describe("Home Page", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the main heading and form", () => {
		render(<Home />);

		expect(screen.getByText("Humanity")).toBeInTheDocument();
		expect(screen.getByText("Passport")).toBeInTheDocument();
		expect(screen.getByLabelText(/GitHub Repository URL/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Get My Humanity Passport/ }),
		).toBeInTheDocument();
	});

	it("allows user to type in the input field", () => {
		render(<Home />);

		const input = screen.getByLabelText(
			/GitHub Repository URL/,
		) as HTMLInputElement;
		fireEvent.change(input, {
			target: { value: "https://github.com/owner/repo" },
		});

		expect(input.value).toBe("https://github.com/owner/repo");
	});

	it("has proper form structure", () => {
		render(<Home />);

		const form = screen
			.getByRole("button", { name: /Get My Humanity Passport/ })
			.closest("form");
		expect(form).toBeInTheDocument();

		const input = screen.getByLabelText(/GitHub Repository URL/);
		expect(input).toHaveAttribute("type", "url");
		expect(input).toHaveAttribute(
			"placeholder",
			"https://github.com/owner/repository",
		);
	});
});
