"use client";

import { Award, Github, Loader2, Shield, Sparkles, Star } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validateRepositorySubmission } from "@/lib/validation";

export default function Home() {
	const [repoUrl, setRepoUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const validation = validateRepositorySubmission(repoUrl);

		if (!validation.isValid) {
			setError(validation.error ?? "Invalid repository URL");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ repoUrl: repoUrl.trim() }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to analyze repository");
			}

			toast.success("Repository analysis complete!", {
				description: `Analysis for ${data.owner}/${data.repo} is ready.`,
			});

			// Redirect to passport page
			window.location.href = `/passport/${data.owner}/${data.repo}`;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An unexpected error occurred";
			setError(errorMessage);
			toast.error("Analysis failed", {
				description: errorMessage,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 relative overflow-hidden">
			{/* Luxury background elements */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.03),transparent_50%)]" />

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 min-h-screen flex flex-col justify-center relative">
				<div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
					{/* Left Side - Hero Content */}
					<div className="space-y-6 sm:space-y-8 lg:space-y-10">
						<div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
							<div className="relative group">
								<div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-full blur-lg sm:blur-xl group-hover:blur-xl sm:group-hover:blur-2xl transition-all duration-500" />
								<div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full p-3 sm:p-4 border border-white/20 dark:border-slate-700/50 shadow-xl">
									<Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-slate-600 dark:text-slate-300" />
									<div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-1 sm:p-1.5 shadow-lg">
										<Github className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
									</div>
									<Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500 absolute -top-0.5 -left-0.5 animate-pulse" />
								</div>
							</div>
							<div className="h-0.5 w-12 sm:w-16 lg:w-20 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full" />
						</div>

						<div className="space-y-6 sm:space-y-8">
							<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-elegant font-medium bg-gradient-to-r from-slate-600 via-blue-500 to-emerald-500 dark:from-slate-200 dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent leading-tight">
								Humanity
								<span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mx-2 sm:mx-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
									+
								</span>
								<span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
									Passport
								</span>
							</h1>

							<p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-xl">
								Elevate your GitHub repository with an exclusive evaluation of
								its positive impact on humanity.{" "}
								<span className="font-medium bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
									Earn a prestigious badge
								</span>{" "}
								that showcases your contribution to making the world better.
							</p>

							<div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
								<div className="flex items-center gap-2 sm:gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
									<div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-1 sm:p-1.5">
										<Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
									</div>
									<span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
										AI-Powered
									</span>
								</div>
								<div className="flex items-center gap-2 sm:gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
									<div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-1 sm:p-1.5">
										<Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
									</div>
									<span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
										Premium Badges
									</span>
								</div>
								<div className="flex items-center gap-2 sm:gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
									<div className="bg-gradient-to-r from-blue-500 to-emerald-600 rounded-full p-1 sm:p-1.5">
										<Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
									</div>
									<span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
										Exclusive
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Right Side - Form */}
					<div className="relative mt-8 lg:mt-0">
						<div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl" />
						<Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl">
							<CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8">
								<div className="flex justify-center">
									<div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-2.5 sm:p-3 shadow-lg">
										<Github className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
									</div>
								</div>
								<CardTitle className="text-xl sm:text-2xl font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
									Submit Your Repository
								</CardTitle>
								<CardDescription className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
									Enter your GitHub repository URL to begin your exclusive
									analysis
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6 sm:space-y-8">
								<form
									onSubmit={handleSubmit}
									className="space-y-4 sm:space-y-6"
								>
									<div className="space-y-2 sm:space-y-3">
										<label
											htmlFor={inputId}
											className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide"
										>
											GitHub Repository URL
										</label>
										<div className="relative">
											<Input
												id={inputId}
												type="url"
												placeholder="https://github.com/owner/repository"
												value={repoUrl}
												onChange={(e) => setRepoUrl(e.target.value)}
												disabled={isSubmitting}
												className={`h-11 sm:h-12 text-sm sm:text-base bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 transition-all duration-300 pr-12 ${error ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : ""}`}
												aria-invalid={!!error}
											/>
											<div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
												<Github className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
											</div>
										</div>
										{error && (
											<p
												className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium"
												role="alert"
											>
												{error}
											</p>
										)}
									</div>

									<Button
										type="submit"
										className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 hover:from-blue-500 hover:via-purple-500 hover:to-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
												<span className="ml-2">Analyzing Repository...</span>
											</>
										) : (
											<>
												<Shield className="h-4 w-4 sm:h-5 sm:w-5" />
												<span className="mx-2">Get My Humanity Passport</span>
												<Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
											</>
										)}
									</Button>
								</form>

								<div className="relative">
									<div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-lg sm:rounded-xl blur-sm" />
									<div className="relative bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-blue-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200/30 dark:border-blue-800/30">
										<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
											<div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-1.5 sm:p-2">
												<Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
											</div>
											<h3 className="font-semibold text-slate-600 dark:text-slate-200 text-sm sm:text-base">
												How It Works
											</h3>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
											<div className="flex items-start gap-2 sm:gap-3">
												<div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
													1
												</div>
												<span>AI analyzes impact</span>
											</div>
											<div className="flex items-start gap-2 sm:gap-3">
												<div className="bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
													2
												</div>
												<span>Evaluate contribution</span>
											</div>
											<div className="flex items-start gap-2 sm:gap-3">
												<div className="bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
													3
												</div>
												<span>Receive badge</span>
											</div>
											<div className="flex items-start gap-2 sm:gap-3">
												<div className="bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
													4
												</div>
												<span>Share impact</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Footer */}
				<footer className="mt-12 sm:mt-16 lg:mt-20 text-center">
					<div className="flex justify-center mb-4 sm:mb-6">
						<div className="h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
					</div>
					<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light px-4">
						Crafted with <span className="text-red-500 animate-pulse">❤️</span>{" "}
						to inspire socially responsible software development
					</p>
				</footer>
			</div>
		</div>
	);
}
