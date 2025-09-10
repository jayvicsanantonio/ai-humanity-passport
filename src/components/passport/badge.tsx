"use client";

interface BadgeProps {
	owner: string;
	repo: string;
	className?: string;
}

export function Badge({ owner, repo, className = "" }: BadgeProps) {
	const badgeUrl = `/api/badge/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
	const passportUrl = `/passport/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

	return (
		<a
			href={passportUrl}
			className={`inline-block transition-transform hover:scale-105 ${className}`}
			title={`View Humanity Passport for ${owner}/${repo}`}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={badgeUrl}
				alt={`Humanity Passport Badge for ${owner}/${repo}`}
				className="h-5"
			/>
		</a>
	);
}
