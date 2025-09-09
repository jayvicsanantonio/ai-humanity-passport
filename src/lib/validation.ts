/**
 * Validation utilities for the Humanity Passport application
 */

/**
 * Validates if a URL is a valid GitHub repository URL
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is valid
 */
export function validateGitHubUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const trimmedUrl = url.trim();
  
  // GitHub repository URL pattern: https://github.com/owner/repo
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
  
  return githubUrlPattern.test(trimmedUrl);
}

/**
 * Extracts owner and repository name from a GitHub URL
 * @param url - The GitHub repository URL
 * @returns Object with owner and repo, or null if invalid
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!validateGitHubUrl(url)) {
    return null;
  }

  const trimmedUrl = url.trim().replace(/\/$/, ''); // Remove trailing slash
  const match = trimmedUrl.match(/^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  
  if (!match) {
    return null;
  }

  return {
    owner: match[1],
    repo: match[2]
  };
}

/**
 * Validates repository submission input
 * @param repoUrl - The repository URL to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateRepositorySubmission(repoUrl: string): {
  isValid: boolean;
  error?: string;
} {
  if (!repoUrl || !repoUrl.trim()) {
    return {
      isValid: false,
      error: "Please enter a GitHub repository URL"
    };
  }

  if (!validateGitHubUrl(repoUrl)) {
    return {
      isValid: false,
      error: "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)"
    };
  }

  return { isValid: true };
}