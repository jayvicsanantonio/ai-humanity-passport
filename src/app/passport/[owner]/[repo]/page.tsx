import {
	Calendar,
	CheckCircle,
	Clock,
	ExternalLink,
	Github,
	XCircle,
} from "lucide-react";
import { Badge } from "@/components/passport/badge";
import { CopyButton } from "@/components/passport/copy-button";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";

interface PassportPageProps {
	params: Promise<{
		owner: string;
		repo: string;
	}>;
}

interface Analysis {
	id: number;
	owner: string;
	repo: string;
	verdict: string;
	details: string;
	createdAt: Date;
	updatedAt: Date;
}

async function getAnalysis(
	owner: string,
	repo: string,
): Promise<Analysis | null> {
	try {
		const analysis = await prisma.analysis.findFirst({
			where: {
				owner,
				repo,
			},
		});
		return analysis;
	} catch (error) {
		console.error("Error fetching analysis:", error);
		return null;
	}
}

export default async function PassportPage({ params }: PassportPageProps) {
	const { owner, repo } = await params;

	// Decode URL parameters in case they contain special characters
	const decodedOwner = decodeURIComponent(owner);
	const decodedRepo = decodeURIComponent(repo);

	const analysis = await getAnalysis(decodedOwner, decodedRepo);

	if (!analysis) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12 px-4">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="flex items-center justify-center gap-3 mb-4">
							<Github className="w-8 h-8 text-gray-600 dark:text-gray-400" />
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
								Humanity Passport
							</h1>
						</div>
						<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-mono">
							{decodedOwner}/{decodedRepo}
						</p>
					</div>

					<Card className="text-center">
						<CardHeader>
							<div className="flex items-center justify-center gap-2 mb-2">
								<Clock className="w-6 h-6 text-amber-500" />
								<CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
									Repository Not Analyzed
								</CardTitle>
							</div>
							<CardDescription className="text-base">
								This repository hasn't been evaluated yet
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
								<p className="text-gray-700 dark:text-gray-300 mb-2">
									The repository{" "}
									<span className="font-mono font-semibold text-gray-900 dark:text-white">
										{decodedOwner}/{decodedRepo}
									</span>{" "}
									has not been analyzed yet.
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Submit this repository for analysis to receive a Humanity
									Passport and discover its positive impact.
								</p>
							</div>

							<div className="flex flex-col sm:flex-row gap-3 justify-center">
								<Button asChild size="lg">
									<a href="/" className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4" />
										Analyze Repository
									</a>
								</Button>
								<Button variant="outline" size="lg" asChild>
									<a
										href={`https://github.com/${decodedOwner}/${decodedRepo}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2"
									>
										<ExternalLink className="w-4 h-4" />
										View on GitHub
									</a>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const badgeMarkdown = `[![Humanity Passport](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/badge/${decodedOwner}/${decodedRepo})](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/passport/${decodedOwner}/${decodedRepo})`;

	const isApproved = analysis.verdict === "approved";
	const VerdictIcon = isApproved ? CheckCircle : XCircle;
	const verdictColor = isApproved
		? "text-green-600 dark:text-green-400"
		: "text-red-600 dark:text-red-400";
	const verdictBg = isApproved
		? "bg-green-50 dark:bg-green-900/20"
		: "bg-red-50 dark:bg-red-900/20";
	const verdictBorder = isApproved
		? "border-green-200 dark:border-green-800"
		: "border-red-200 dark:border-red-800";

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12 px-4">
			<div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
				{/* Header */}
				<div className="text-center">
					<div className="flex items-center justify-center gap-3 mb-4">
						<Github className="w-8 h-8 text-gray-600 dark:text-gray-400" />
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
							Humanity Passport
						</h1>
					</div>
					<div className="flex items-center justify-center gap-2 mb-4">
						<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-mono">
							{decodedOwner}/{decodedRepo}
						</p>
						<Button variant="ghost" size="sm" asChild>
							<a
								href={`https://github.com/${decodedOwner}/${decodedRepo}`}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1"
							>
								<ExternalLink className="w-4 h-4" />
							</a>
						</Button>
					</div>
				</div>

				{/* Badge Display */}
				<div className="flex justify-center">
					<div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
						<Badge
							owner={decodedOwner}
							repo={decodedRepo}
							size="xxl"
							interactive={false}
						/>
					</div>
				</div>

				{/* Verdict Summary */}
				<Card className={`${verdictBg} ${verdictBorder}`}>
					<CardHeader>
						<div className="flex items-center justify-center gap-3">
							<VerdictIcon className={`w-8 h-8 ${verdictColor}`} />
							<div className="text-center">
								<CardTitle className={`text-xl sm:text-2xl ${verdictColor}`}>
									{isApproved
										? "Humanity Passport Approved"
										: "Not Approved for Humanity Passport"}
								</CardTitle>
								<CardDescription className="mt-1">
									{isApproved
										? "This repository contributes positively to humanity"
										: "This repository does not meet the criteria for positive impact"}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
				</Card>

				{/* Analysis Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span className="text-lg">📋</span>
							Detailed Analysis
						</CardTitle>
						<CardDescription>
							AI-powered evaluation of this repository's impact on humanity
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="prose dark:prose-invert max-w-none">
							<div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
								<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
									{analysis.details}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
							<Calendar className="w-4 h-4" />
							<span>
								Analyzed on{" "}
								{new Date(analysis.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Badge Embed Code */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span className="text-lg">🏷️</span>
							Embed Your Badge
						</CardTitle>
						<CardDescription>
							Add this badge to your repository's README to showcase your
							Humanity Passport
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Markdown code:
							</p>
							<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm relative border border-gray-200 dark:border-gray-700">
								<code className="text-gray-800 dark:text-gray-200 break-all block pr-20">
									{badgeMarkdown}
								</code>
								<CopyButton text={badgeMarkdown} />
							</div>
						</div>

						<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<div className="text-blue-600 dark:text-blue-400 mt-0.5">
									💡
								</div>
								<div className="text-sm text-blue-800 dark:text-blue-200">
									<p className="font-medium mb-1">Pro tip:</p>
									<p>
										Add this badge to the top of your README.md file to let
										visitors know about your repository's positive impact on
										humanity.
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export async function generateMetadata({ params }: PassportPageProps) {
	const { owner, repo } = await params;
	const decodedOwner = decodeURIComponent(owner);
	const decodedRepo = decodeURIComponent(repo);

	return {
		title: `${decodedOwner}/${decodedRepo} - Humanity Passport`,
		description: `View the Humanity Passport analysis for ${decodedOwner}/${decodedRepo}`,
	};
}
