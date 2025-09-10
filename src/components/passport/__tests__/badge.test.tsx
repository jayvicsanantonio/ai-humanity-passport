import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";

describe("Badge Component", () => {
	it("renders badge correctly", () => {
		render(<Badge owner="testowner" repo="testrepo" />);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/passport/testowner/testrepo");
		expect(link).toHaveAttribute(
			"title",
			"View Humanity Passport for testowner/testrepo",
		);

		const img = screen.getByRole("img");
		expect(img).toHaveAttribute("src", "/api/badge/testowner/testrepo");
		expect(img).toHaveAttribute(
			"alt",
			"Humanity Passport Badge for testowner/testrepo",
		);
	});

	it("renders badge with different repository", () => {
		render(<Badge owner="testowner" repo="testrepo" />);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/passport/testowner/testrepo");

		const img = screen.getByRole("img");
		expect(img).toHaveAttribute("src", "/api/badge/testowner/testrepo");
	});

	it("handles URL encoding for special characters", () => {
		render(<Badge owner="test-owner" repo="test.repo" />);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/passport/test-owner/test.repo");

		const img = screen.getByRole("img");
		expect(img).toHaveAttribute("src", "/api/badge/test-owner/test.repo");
	});

	it("applies custom className", () => {
		render(
			<Badge owner="testowner" repo="testrepo" className="custom-class" />,
		);

		const link = screen.getByRole("link");
		expect(link).toHaveClass("custom-class");
	});
});
