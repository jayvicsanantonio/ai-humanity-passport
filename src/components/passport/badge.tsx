"use client";

interface BadgeProps {
	owner: string;
	repo: string;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl" | "xxl";
	interactive?: boolean;
}

export function Badge({
	owner,
	repo,
	className = "",
	size = "md",
	interactive = true,
}: BadgeProps) {
	const badgeUrl = `/api/badge/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
	const passportUrl = `/passport/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

	const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
		sm: "h-5",
		md: "h-6 sm:h-7",
		lg: "h-8 sm:h-10",
		xl: "h-16 sm:h-20", // 64px → 80px
		xxl: "h-20 sm:h-24", // 80px → 96px
	};

	const badgeElement = (
		<img
			src={badgeUrl}
			alt={`Humanity Passport Badge for ${owner}/${repo}`}
			className={`${sizeClasses[size]} transition-all duration-300 ${
				interactive ? "hover:brightness-110" : ""
			}`}
		/>
	);

	if (!interactive) {
		return <div className={`inline-block ${className}`}>{badgeElement}</div>;
	}

	return (
		<a
			href={passportUrl}
			className={`inline-block transition-all duration-300 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded ${className}`}
			title={`View Humanity Passport for ${owner}/${repo}`}
		>
			{badgeElement}
		</a>
	);
}
