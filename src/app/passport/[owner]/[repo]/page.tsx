import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/passport/badge";
import { CopyButton } from "@/components/passport/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function PassportPage({ params }: PassportPageProps) {
	const { owner, repo } = await params;

	// Decode URL parameters in case they contain special characters
	const decodedOwner = decodeURIComponent(owner);
	const decodedRepo = decodeURIComponent(repo);

	const analysis = await getAnalysis(decodedOwner, decodedRepo);

	if (!analysis) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
				<div className="max-w-4xl mx-auto">
					<Card className="text-center">
						<CardHeader>
							<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
								Repository Not Analyzed
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 dark:text-gray-300 mb-6">
								The repository{" "}
								<strong>
									{decodedOwner}/{decodedRepo}
								</strong>{" "}
								has not been analyzed yet.
							</p>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
								Submit this repository for analysis on our home page to receive
								a Humanity Passport.
							</p>
							<Button asChild>
								<a href="/">Analyze Repository</a>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const badgeMarkdown = `[![Humanity Passport](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/badge/${decodedOwner}/${decodedRepo})](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/passport/${decodedOwner}/${decodedRepo})`;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
						Humanity Passport
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300">
						<a
							href={`https://github.com/${decodedOwner}/${decodedRepo}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors underline inline-flex items-center gap-1"
						>
							{decodedOwner}/{decodedRepo}
							<ExternalLink className="w-4 h-4" />
						</a>
					</p>
				</div>

				{/* Badge Display */}
				<div className="flex justify-center">
					<Badge owner={decodedOwner} repo={decodedRepo} />
				</div>

				{/* Analysis Results */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span
								className={`inline-block w-3 h-3 rounded-full ${
									analysis.verdict === "approved"
										? "bg-green-500"
										: "bg-red-500"
								}`}
							/>
							Analysis Result:{" "}
							{analysis.verdict === "approved" ? "Approved" : "Not Approved"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="prose dark:prose-invert max-w-none">
							<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
								{analysis.details}
							</p>
						</div>
						<div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
							Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
						</div>
					</CardContent>
				</Card>

				{/* Badge Embed Code */}
				<Card>
					<CardHeader>
						<CardTitle>Embed Badge</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-gray-600 dark:text-gray-300 mb-4">
							Copy this Markdown code to display the badge in your README:
						</p>
						<div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm relative">
							<code className="text-gray-800 dark:text-gray-200 break-all">
								{badgeMarkdown}
							</code>
							<CopyButton text={badgeMarkdown} />
						</div>

						{/* Contextual Pro Tip */}
						<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
							<div className="flex items-start gap-2">
								<div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
									<span className="text-white text-xs font-bold">💡</span>
								</div>
								<div className="text-sm">
									<p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
										Pro tip:
									</p>
									<p className="text-blue-800 dark:text-blue-200">
										{getProTipMessage(analysis.verdict, analysis.details)}
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
