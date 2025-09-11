import {
	Award,
	CheckCircle,
	ExternalLink,
	Github,
	Shield,
	Sparkles,
	XCircle,
} from "lucide-react";
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
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 relative overflow-hidden">
				{/* Luxury background elements */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.03),transparent_50%)]" />

				<div className="container mx-auto px-8 py-12 h-full flex items-center justify-center relative">
					<div className="max-w-2xl mx-auto">
						<div className="relative">
							<div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-xl" />
							<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl text-center">
								<CardHeader className="space-y-6 pb-8">
									<div className="flex justify-center">
										<div className="relative group">
											<div className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
											<div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full p-4 border border-white/20 dark:border-slate-700/50 shadow-xl">
												<Shield className="h-12 w-12 text-slate-600 dark:text-slate-300" />
												<div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-1.5 shadow-lg">
													<XCircle className="h-4 w-4 text-white" />
												</div>
											</div>
										</div>
									</div>
									<CardTitle className="text-2xl lg:text-3xl font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
										Repository Not Analyzed
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-8">
									<div className="space-y-4">
										<p className="text-lg text-slate-600 dark:text-slate-300 font-light">
											The repository{" "}
											<span className="font-medium bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
												{decodedOwner}/{decodedRepo}
											</span>{" "}
											has not been analyzed yet.
										</p>
										<p className="text-slate-500 dark:text-slate-400 font-light">
											Submit this repository for analysis on our home page to
											receive a Humanity Passport.
										</p>
									</div>
									<Button
										asChild
										className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 hover:from-blue-500 hover:via-purple-500 hover:to-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-base font-medium px-8 py-3"
									>
										<a href="/" className="inline-flex items-center gap-2">
											<Shield className="h-5 w-5" />
											Analyze Repository
											<Sparkles className="h-4 w-4" />
										</a>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const badgeMarkdown = `[![Humanity Passport](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/badge/${decodedOwner}/${decodedRepo})](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/passport/${decodedOwner}/${decodedRepo})`;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 relative overflow-hidden">
			{/* Luxury background elements */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.03),transparent_50%)]" />

			<div className="container mx-auto px-8 py-12 relative">
				<div className="max-w-5xl mx-auto space-y-12">
					{/* Header */}
					<div className="text-center space-y-8">
						<div className="flex items-center justify-center gap-6">
							<div className="relative group">
								<div className="absolute -inset-3 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
								<div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full p-4 border border-white/20 dark:border-slate-700/50 shadow-xl">
									<Shield className="h-12 w-12 text-slate-600 dark:text-slate-300" />
									<div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-1.5 shadow-lg">
										{analysis.verdict === "approved" ? (
											<CheckCircle className="h-4 w-4 text-white" />
										) : (
											<XCircle className="h-4 w-4 text-white" />
										)}
									</div>
									<Sparkles className="h-3 w-3 text-amber-500 absolute -top-0.5 -left-0.5 animate-pulse" />
								</div>
							</div>
							<div className="h-0.5 w-20 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full" />
						</div>

						<div className="space-y-6">
							<h1 className="text-4xl lg:text-5xl xl:text-6xl font-elegant font-medium bg-gradient-to-r from-slate-600 via-blue-500 to-emerald-500 dark:from-slate-200 dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent leading-tight">
								Humanity
								<span className="text-3xl lg:text-4xl xl:text-5xl mx-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
									+
								</span>
								<span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
									Passport
								</span>
							</h1>

							<div className="flex items-center justify-center gap-3">
								<Github className="h-5 w-5 text-slate-500 dark:text-slate-400" />
								<a
									href={`https://github.com/${decodedOwner}/${decodedRepo}`}
									target="_blank"
									rel="noopener noreferrer"
									className="text-xl lg:text-2xl font-light text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-400 hover:to-emerald-400 hover:bg-clip-text hover:text-transparent transition-all duration-300 inline-flex items-center gap-2"
								>
									{decodedOwner}/{decodedRepo}
									<ExternalLink className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					{/* Badge Display */}
					<div className="flex justify-center">
						<div className="relative">
							<div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-xl" />
							<div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-slate-700/50 shadow-2xl">
								<Badge owner={decodedOwner} repo={decodedRepo} />
							</div>
						</div>
					</div>

					{/* Analysis Results */}
					<div className="relative">
						<div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-xl" />
						<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl">
							<CardHeader className="pb-6">
								<CardTitle className="flex items-center gap-4 text-xl">
									<div
										className={`flex items-center justify-center w-10 h-10 rounded-full ${
											analysis.verdict === "approved"
												? "bg-gradient-to-r from-emerald-500 to-green-600"
												: "bg-gradient-to-r from-red-500 to-pink-600"
										} shadow-lg`}
									>
										{analysis.verdict === "approved" ? (
											<CheckCircle className="h-5 w-5 text-white" />
										) : (
											<XCircle className="h-5 w-5 text-white" />
										)}
									</div>
									<span className="font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
										Analysis Result:{" "}
										{analysis.verdict === "approved"
											? "Approved"
											: "Not Approved"}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-xl blur-sm" />
									<div className="relative bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-blue-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30 dark:border-blue-800/30">
										<div className="prose dark:prose-invert max-w-none">
											<p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-light">
												{analysis.details}
											</p>
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
									<Award className="h-4 w-4" />
									<span>
										Analyzed on{" "}
										{new Date(analysis.createdAt).toLocaleDateString()}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Badge Embed Code */}
					<div className="relative">
						<div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-xl" />
						<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl">
							<CardHeader className="pb-6">
								<CardTitle className="flex items-center gap-3 text-xl">
									<div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-2.5 shadow-lg">
										<Github className="h-5 w-5 text-white" />
									</div>
									<span className="font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
										Embed Badge
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<p className="text-slate-600 dark:text-slate-300 font-light">
									Copy this Markdown code to display the badge in your README:
								</p>

								<div className="relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-slate-600/10 to-blue-600/10 rounded-xl blur-sm" />
									<div className="relative bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 font-mono text-sm border border-slate-200/50 dark:border-slate-700/50">
										<code className="text-slate-800 dark:text-slate-200 break-all leading-relaxed">
											{badgeMarkdown}
										</code>
										<CopyButton text={badgeMarkdown} />
									</div>
								</div>

								{/* Contextual Pro Tip */}
								<div className="relative">
									<div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-xl blur-sm" />
									<div className="relative bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-blue-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30 dark:border-blue-800/30">
										<div className="flex items-start gap-4">
											<div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-2 shadow-lg">
												<Sparkles className="h-4 w-4 text-white" />
											</div>
											<div className="space-y-2">
												<h3 className="font-semibold text-slate-600 dark:text-slate-200 text-base">
													Pro tip:
												</h3>
												<p className="text-slate-600 dark:text-slate-300 font-light leading-relaxed">
													{getProTipMessage(analysis.verdict, analysis.details)}
												</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Footer */}
				<footer className="mt-20 text-center">
					<div className="flex justify-center mb-6">
						<div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
					</div>
					<p className="text-sm text-slate-500 dark:text-slate-400 font-light">
						Crafted with <span className="text-red-500 animate-pulse">❤️</span>{" "}
						to inspire socially responsible software development
					</p>
				</footer>
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
