"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Github, Shield, CheckCircle, Sparkles, Award, Star } from "lucide-react";
import { validateRepositorySubmission } from "@/lib/validation";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateRepositorySubmission(repoUrl);
    
    if (!validation.isValid) {
      setError(validation.error!);
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
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
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
      
      <div className="container mx-auto px-4 py-20 relative">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full p-6 border border-white/20 dark:border-slate-700/50 shadow-2xl">
                <Shield className="h-16 w-16 text-slate-600 dark:text-slate-300" />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-2 shadow-lg">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -left-1 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="space-y-6 mb-12">
            <h1 className="text-3xl md:text-5xl font-elegant font-medium bg-gradient-to-r from-slate-600 via-blue-500 to-emerald-500 dark:from-slate-200 dark:via-blue-300 dark:to-emerald-300 bg-clip-text text-transparent leading-tight">
              Humanity
              <span className="text-2xl md:text-4xl mx-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">+</span>
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Passport</span>
            </h1>
            
            <div className="flex justify-center">
              <div className="h-1 w-24 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-full" />
            </div>
          </div>
          
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Elevate your GitHub repository with an exclusive evaluation of its positive impact on humanity. 
            <span className="font-medium bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Earn a prestigious badge
            </span> that showcases your contribution to making the world better.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-16">
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full p-1">
                <Star className="h-4 w-4 text-white" />
              </div>
              <span className="text-slate-600 dark:text-slate-300 font-medium">AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-full p-1">
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Premium Badges</span>
            </div>
            <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-500 to-emerald-600 rounded-full p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-slate-600 dark:text-slate-300 font-medium">Exclusive Passport</span>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl blur-xl" />
            <Card className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-3 shadow-lg">
                    <Github className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-elegant font-medium bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Submit Your Repository
                </CardTitle>
                <CardDescription className="text-base text-slate-500 dark:text-slate-400">
                  Enter your GitHub repository URL to begin your exclusive Humanity Passport analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="repo-url" className="text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      GitHub Repository URL
                    </label>
                    <div className="relative">
                      <Input
                        id="repo-url"
                        type="url"
                        placeholder="https://github.com/owner/repository"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        disabled={isSubmitting}
                        className={`h-11 text-base bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 transition-all duration-300 ${error ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20" : ""}`}
                        aria-invalid={!!error}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Github className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium" role="alert">
                        {error}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 hover:from-blue-500 hover:via-purple-500 hover:to-emerald-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing Repository...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        Get My Humanity Passport
                        <Sparkles className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 rounded-xl blur-sm" />
                  <div className="relative bg-gradient-to-br from-blue-50/80 to-emerald-50/80 dark:from-blue-950/30 dark:to-emerald-950/30 backdrop-blur-sm rounded-xl p-6 border border-blue-200/30 dark:border-blue-800/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full p-2">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-600 dark:text-slate-200 text-base">
                        The Premium Experience
                      </h3>
                    </div>
                    <ol className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-medium mt-0.5">1</div>
                        <span>Advanced AI analyzes your repository&apos;s purpose and societal impact</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-medium mt-0.5">2</div>
                        <span>Comprehensive evaluation of your contribution to humanity</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-medium mt-0.5">3</div>
                        <span>Receive an exclusive badge and detailed passport showcase</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-medium mt-0.5">4</div>
                        <span>Share your prestigious impact recognition with the world</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-light">
            Crafted with <span className="text-red-500 animate-pulse">❤️</span> to inspire socially responsible software development
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </footer>
      </div>
    </div>
  );
}
