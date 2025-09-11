# Task 8 — Home Page and Repository Submission Form

This document describes the implementation for Task 8 in .kiro/specs/humanity-passport/tasks.md: building the home page with a GitHub repository submission form, client-side validation, loading states, and user feedback. It aligns with Requirements 6.1, 6.2, 1.1, and 1.4.

Status summary
- Page: src/app/page.tsx (client component)
- Validation: validateRepositorySubmission() and validateGitHubUrl() utilities
- Submission: POST /api/analyze, then redirect to /passport/[owner]/[repo]
- UX: loading spinner, inline error text, toasts for success/failure

Goals and scope
- Provide a simple, polished entry point where users paste a GitHub repository URL and trigger the analysis workflow.
- Validate input early in the browser to prevent unnecessary requests and clarify the required format.
- Provide clear feedback: in-button loading state, inline validation errors, and global toast notifications.

Implementation details
- Client component. The home page is a client-side React component that manages local state for the input (repoUrl), submission (isSubmitting), and validation errors.
- Validation. validateRepositorySubmission() ensures the URL is present and matches the GitHub pattern (https://github.com/owner/repo). This wraps validateGitHubUrl() for better error messaging.
- Submission flow.
  1) Prevent default form submission.
  2) Validate the URL; if invalid, display an error.
  3) Call POST /api/analyze with { repoUrl }.
  4) On success, show a toast, then redirect the browser to /passport/owner/repo.
  5) On failure, show a toast and set an inline error.
- Loading and errors.
  - The submit button shows a spinner and disables during the request.
  - Invalid input or server errors render a small red error message under the input.
  - Toasts use sonner for user-friendly, non-blocking feedback.
- UI polish. The page includes a hero section and a right-side form card that matches the brand styling.

Why this approach
- Client-side validation: catches simple mistakes instantly and reduces backend load.
- Toast-driven feedback: communicates success/failure without jarring navigations; preserves form context for quick correction.
- Simple redirect after success: lands users on the passport page where they can copy the badge and review analysis details.
- Separation of concerns: input validation utilities are reusable elsewhere (e.g., server-side schemas).

Key code references

- Home page with form and submission logic
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/page.tsx start=17
export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze repository");

      toast.success("Repository analysis complete!", { description: `Analysis for ${data.owner}/${data.repo} is ready.` });
      window.location.href = `/passport/${data.owner}/${data.repo}`;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Analysis failed", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

- Validation utilities
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/lib/validation.ts start=10
export function validateGitHubUrl(url: string): boolean {
  const trimmedUrl = url.trim();
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
  return githubUrlPattern.test(trimmedUrl);
}
```

```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/lib/validation.ts start=56
export function validateRepositorySubmission(repoUrl: string) {
  if (!repoUrl || !repoUrl.trim()) {
    return { isValid: false, error: "Please enter a GitHub repository URL" };
  }
  if (!validateGitHubUrl(repoUrl)) {
    return { isValid: false, error: "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)" };
  }
  return { isValid: true };
}
```

Testing considerations
- Form behavior is covered indirectly via the API integration tests and the passport page tests. For full coverage, we could add component tests that mock fetch and verify validation and redirect behavior.

Future improvements
- Debounce and pre-validate as the user types with instant hinting.
- Parse and show owner/repo preview below the input.
- Persist last submitted repo in localStorage for convenience.

