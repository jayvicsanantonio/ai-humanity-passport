"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Github, Shield, CheckCircle } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              <Github className="h-8 w-8 text-green-600 dark:text-green-400 absolute -bottom-1 -right-1" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Humanity
            <span className="text-blue-600 dark:text-blue-400">+</span>
            <span className="text-green-600 dark:text-green-400"> Passport</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Get your GitHub repository evaluated for its positive impact on humanity. 
            Earn a badge that showcases your contribution to making the world better.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Dynamic Badges</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Public Passport</span>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Submit Your Repository</CardTitle>
              <CardDescription className="text-center">
                Enter your GitHub repository URL to get started with your Humanity Passport analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="repo-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    GitHub Repository URL
                  </label>
                  <Input
                    id="repo-url"
                    type="url"
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isSubmitting}
                    className={error ? "border-red-500 focus-visible:border-red-500" : ""}
                    aria-invalid={!!error}
                  />
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing Repository...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Get My Humanity Passport
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How it works:
                </h3>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>1. We analyze your repository&apos;s purpose and impact</li>
                  <li>2. AI evaluates how it contributes to humanity</li>
                  <li>3. You receive a badge and detailed passport page</li>
                  <li>4. Share your positive impact with the world!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Built with ❤️ to encourage socially responsible software development
          </p>
        </footer>
      </div>
    </div>
  );
}
