import {
	Calendar,
	CheckCircle,
	Clock,
	ExternalLink,
	Github,
	Shield,
	Sparkles,
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

function getProTipMessage(verdict: string, details: string): string {
	const lowerDetails = details.toLowerCase();

	// For non-approved projects, always show the learning/personal message
	if (verdict !== "approved") {
		return "Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.";
	}

	// For approved projects, check for personal/portfolio/experimental projects first
	const isPersonalOrLearning =
		lowerDetails.includes("personal") ||
		lowerDetails.includes("portfolio") ||
		lowerDetails.includes("learning") ||
		lowerDetails.includes("experimental") ||
		lowerDetails.includes("tutorial") ||
		lowerDetails.includes("practice") ||
		lowerDetails.includes("knowledge sharing") ||
		lowerDetails.includes("educational resource") ||
		lowerDetails.includes("informational") ||
		lowerDetails.includes("demonstration") ||
		lowerDetails.includes("example") ||
		lowerDetails.includes("sample");

	// If it's personal/learning, show the appropriate message
	if (isPersonalOrLearning) {
		return "Add a badge to highlight that this project is for learning, personal growth, or knowledge sharing—helping others discover and learn from your work.";
	}

	// Check for positive social impact keywords
	const hasPositiveSocialImpact =
		lowerDetails.includes("accessibility") ||
		lowerDetails.includes("sustainability") ||
		lowerDetails.includes("education") ||
		lowerDetails.includes("health") ||
		lowerDetails.includes("open knowledge") ||
		lowerDetails.includes("social") ||
		lowerDetails.includes("community") ||
		lowerDetails.includes("humanitarian") ||
		lowerDetails.includes("environment") ||
		lowerDetails.includes("public good") ||
		lowerDetails.includes("societal benefit") ||
		lowerDetails.includes("open source") ||
		lowerDetails.includes("charity") ||
		lowerDetails.includes("nonprofit") ||
		lowerDetails.includes("welfare") ||
		lowerDetails.includes("inclusion") ||
		lowerDetails.includes("diversity") ||
		lowerDetails.includes("climate") ||
		lowerDetails.includes("medical") ||
		lowerDetails.includes("research") ||
		lowerDetails.includes("scientific");

	// If it has positive social impact, show the social impact message
	if (hasPositiveSocialImpact) {
		return "Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.";
	}

	// Default message for other approved projects
	return "Add this badge to the top of your README.md file to let visitors know about your repository's positive impact on humanity.";
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

				<div className="container mx-auto px-6 py-6 h-full flex flex-col relative">
					<div className="max-w-6xl mx-auto flex-1 flex flex-col justify-center">
						{/* Header */}
						<div className="text-center mb-8">
							<div className="flex items-center justify-center gap-4 mb-6">
								<div className="relative group">
									<div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500" />
									<div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full p-3 border border-white/20 dark:border-slate-700/50 shadow-xl">
										<Shield className="h-8 w-8 text-slate-600 dark:text-slate-300" />
										<div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-1 shadow-lg">
											<Github className="h-3 w-3 text-white" />
										</div>
										<Sparkles className="h-2.5 w-2.5 text-amber-500 absolute -top-0.5 -left-0.5 animate-pulse" />
									</div>
								</div>
								<div className="h-0.5 w-16 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full" />
							</div>

							<h1 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-medium leading-tight mb-4">
								<span className="bg-gradient-to-r from-slate-600 via-blue-500 to-emerald-500 dark:from-slate-200 dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent">
									Humanity
								</span>
								<span className="text-2xl lg:text-3xl xl:text-4xl mx-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
									+
								</span>
								<span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
									Passport
								</span>
							</h1>
							<p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 dark:border-slate-700/50 shadow-lg inline-block">
								{decodedOwner}/{decodedRepo}
							</p>
						</div>

						<div className="relative">
							<div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-yellow-600/20 rounded-xl blur-lg" />
							<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl text-center">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-center gap-3 mb-4">
										<div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-full p-2 shadow-lg">
											<Clock className="w-5 h-5 text-white" />
										</div>
										<CardTitle className="text-xl sm:text-2xl font-elegant font-medium bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
											Repository Awaiting Analysis
										</CardTitle>
									</div>
									<CardDescription className="text-base text-slate-500 dark:text-slate-400">
										This repository hasn't been evaluated yet
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="relative">
										<div className="absolute -inset-1 bg-gradient-to-r from-amber-600/10 to-orange-600/10 rounded-lg blur-sm" />
										<div className="relative bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 backdrop-blur-sm rounded-lg p-4 border border-amber-200/30 dark:border-amber-800/30">
											<p className="text-slate-700 dark:text-slate-300 mb-3 text-base">
												The repository{" "}
												<span className="font-mono font-semibold bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
													{decodedOwner}/{decodedRepo}
												</span>{" "}
												has not been analyzed yet.
											</p>
											<p className="text-sm text-slate-600 dark:text-slate-400">
												Submit this repository for analysis to receive a
												Humanity Passport and discover its positive impact.
											</p>
										</div>
									</div>

									<div className="flex flex-col sm:flex-row gap-3 justify-center">
										<Button
											asChild
											size="lg"
											className="h-10 text-sm font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 hover:from-blue-500 hover:via-purple-500 hover:to-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
										>
											<a href="/" className="flex items-center gap-2">
												<Shield className="w-4 h-4" />
												Analyze Repository
												<Sparkles className="w-3 h-3" />
											</a>
										</Button>
										<Button
											variant="outline"
											size="lg"
											asChild
											className="h-10 text-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300"
										>
											<a
												href={`https://github.com/${decodedOwner}/${decodedRepo}`}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2"
											>
												<ExternalLink className="w-3 h-3" />
												View on GitHub
											</a>
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
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
		<div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 relative overflow-hidden">
			{/* Luxury background elements */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.03),transparent_50%)]" />

			<div className="container mx-auto px-6 py-3 h-full flex flex-col relative">
				<div className="max-w-6xl mx-auto flex-1 flex flex-col justify-center space-y-3">
					{/* Header */}
					<div className="text-center">
						<div className="flex items-center justify-center gap-4 mb-4">
							<div className="relative group">
								<div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-500" />
								<div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full p-3 border border-white/20 dark:border-slate-700/50 shadow-xl">
									<Shield className="h-8 w-8 text-slate-600 dark:text-slate-300" />
									<div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-1 shadow-lg">
										<Github className="h-3 w-3 text-white" />
									</div>
									<Sparkles className="h-2.5 w-2.5 text-amber-500 absolute -top-0.5 -left-0.5 animate-pulse" />
								</div>
							</div>
							<div className="h-0.5 w-16 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full" />
						</div>

						<h1 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-medium leading-tight mb-4">
							<span className="bg-gradient-to-r from-slate-600 via-blue-500 to-emerald-500 dark:from-slate-200 dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent">
								Humanity
							</span>
							<span className="text-2xl lg:text-3xl xl:text-4xl mx-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
								+
							</span>
							<span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
								Passport
							</span>
						</h1>
						<div className="flex items-center justify-center gap-2 mb-4">
							<p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 dark:border-slate-700/50 shadow-lg">
								{decodedOwner}/{decodedRepo}
							</p>
							<Button
								variant="ghost"
								size="sm"
								asChild
								className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 h-7 w-7 p-0"
							>
								<a
									href={`https://github.com/${decodedOwner}/${decodedRepo}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center"
								>
									<ExternalLink className="w-3 h-3" />
								</a>
							</Button>
						</div>
					</div>

					{/* Verdict Summary */}
					<Card className={`${verdictBg} ${verdictBorder}`}>
						<CardHeader>
							<div className="flex items-center justify-center gap-3">
								<VerdictIcon className={`w-8 h-8 ${verdictColor}`} />
								<div className="text-center">
									<CardTitle className={`text-lg sm:text-xl ${verdictColor}`}>
										{isApproved
											? "Humanity Passport Approved"
											: "Not Approved for Humanity Passport"}
									</CardTitle>
									<CardDescription className="mt-1 text-sm">
										{isApproved
											? "This repository contributes positively to humanity"
											: "This repository does not meet the criteria for positive impact"}
									</CardDescription>
								</div>
							</div>
						</CardHeader>
					</Card>

					{/* Main Content Grid */}
					<div className="grid lg:grid-cols-2 gap-3 items-stretch">
						{/* Analysis Details */}
						<div className="relative h-full">
							<div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-xl blur-lg" />
							<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl flex flex-col h-full">
								<CardHeader className="pb-3 h-24">
									<CardTitle className="flex items-center gap-2 text-xl font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
										<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1.5">
											<span className="text-sm text-white">📋</span>
										</div>
										Detailed Analysis
									</CardTitle>
									<CardDescription className="text-sm text-slate-500 dark:text-slate-400">
										AI-powered evaluation of this repository's impact on
										humanity
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 flex-1 flex flex-col pt-0">
									<div className="prose dark:prose-invert max-w-none flex-1">
										<div className="relative h-full">
											<div className="absolute -inset-1 bg-gradient-to-r from-slate-600/10 to-blue-600/10 rounded-lg blur-sm" />
											<div className="relative bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-slate-950/30 dark:to-blue-950/30 backdrop-blur-sm rounded-lg p-4 border border-slate-200/30 dark:border-slate-700/30 h-full flex items-start">
												<p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed flex-1">
													{analysis.details}
												</p>
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 mt-auto">
										<div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-1">
											<Calendar className="w-2.5 h-2.5 text-white" />
										</div>
										<span className="font-medium">
											Analyzed on{" "}
											{new Date(analysis.createdAt).toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "long",
													day: "numeric",
												},
											)}
										</span>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Badge Embed Code */}
						<div className="relative h-full">
							<div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-purple-600/20 rounded-xl blur-lg" />
							<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl flex flex-col h-full">
								<CardHeader className="pb-3 h-24">
									<CardTitle className="flex items-center gap-2 text-xl font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
										<div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full p-1.5">
											<span className="text-sm text-white">🏷️</span>
										</div>
										Embed Your Badge
									</CardTitle>
									<CardDescription className="text-sm text-slate-500 dark:text-slate-400">
										Add this badge to your repository's README to showcase your
										Humanity Passport
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 flex-1 flex flex-col pt-0">
									{/* Humanity Passport Badge - aligned with detailed analysis container */}
									<div className="prose dark:prose-invert max-w-none flex-1">
										<div className="relative h-full">
											<div className="absolute -inset-1 bg-gradient-to-r from-slate-600/10 to-blue-600/10 rounded-lg blur-sm" />
											<div className="relative bg-gradient-to-br from-slate-50/80 to-blue-50/80 dark:from-slate-950/30 dark:to-blue-950/30 backdrop-blur-sm rounded-lg p-4 border border-slate-200/30 dark:border-slate-700/30 h-full flex justify-center items-center">
												<Badge
													owner={decodedOwner}
													repo={decodedRepo}
													size="xl"
													interactive={false}
												/>
											</div>
										</div>
									</div>
									<div className="space-y-3">
										<p className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
											Markdown code:
										</p>
										<div className="relative">
											<div className="absolute -inset-1 bg-gradient-to-r from-slate-600/10 to-emerald-600/10 rounded-lg blur-sm" />
											<div className="relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 font-mono text-xs border border-slate-200/50 dark:border-slate-700/50">
												<code className="text-slate-800 dark:text-slate-200 break-all block pr-20">
													{badgeMarkdown}
												</code>
												<CopyButton text={badgeMarkdown} />
											</div>
										</div>
									</div>

									<div className="relative flex-1 flex items-start">
										<div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-lg blur-sm" />
										<div className="relative bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-blue-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-lg p-4 border border-blue-200/30 dark:border-blue-800/30 w-full">
											<div className="flex items-start gap-3">
												<div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-1.5 flex-shrink-0">
													<Sparkles className="h-3 w-3 text-white" />
												</div>
												<div className="text-xs text-blue-800 dark:text-blue-200">
													<p className="font-semibold mb-1 text-sm">Pro tip:</p>
													<p className="leading-relaxed">
														{getProTipMessage(
															analysis.verdict,
															analysis.details,
														)}
													</p>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
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
