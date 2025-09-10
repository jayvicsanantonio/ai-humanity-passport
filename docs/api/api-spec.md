# Humanity Passport API Specification

Overview
- Base Path: /
- Authentication: None (public endpoints)
- Content Types: application/json (for JSON APIs), image/svg+xml (for badges)
- Rate Limiting: Per-IP sliding window on selected endpoints (details below)
- Environments: Variables described in the Environment section

Conventions
- All successful JSON responses use HTTP 200 OK
- Errors use a consistent JSON shape:

```json path=null start=null
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": "Optional additional info",
  "retryable": false
}
```

Endpoints
1) POST /api/analyze
- Description: Validate and parse a GitHub repository URL, fetch metadata and README from GitHub, request analysis from Groq LLM, upsert the result into the database, and return the analysis summary.
- Method: POST
- Request Headers:
  - Content-Type: application/json
- Request Body:

```json path=null start=null
{
  "repoUrl": "https://github.com/OWNER/REPO"
}
```

Validation
- repoUrl is required.
- Must match: https://github.com/{owner}/{repo}
  - Allowed characters in owner/repo: a-z, A-Z, 0-9, _, ., -

Behavior
- Parses owner/repo from repoUrl.
- Fetches repository metadata (description, stars, topics, default branch, HTML URL) and README (if present) from GitHub.
- Sends metadata and README to Groq using model gpt-oss-20b and expects a structured response.
- Upserts analysis result into the database under a unique (owner, repo) composite key. Owner and repo are normalized to lowercase for unique key stability.

Responses
- 200 OK

```json path=null start=null
{
  "owner": "owner-lowercase",
  "repo": "repo-lowercase",
  "verdict": "approved", // or "rejected"
  "details": "Short explanation provided by the LLM"
}
```

- 400 Bad Request
  - INVALID_JSON: Request body not valid JSON
  - INVALID_INPUT: Zod validation failed
  - INVALID_REPO_URL: URL did not match GitHub pattern

```json path=null start=null
{
  "error": "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)",
  "code": "INVALID_INPUT"
}
```

- 404 Not Found
  - GITHUB_REPO_NOT_FOUND when the repository does not exist

```json path=null start=null
{
  "error": "Repository not found",
  "code": "GITHUB_REPO_NOT_FOUND",
  "retryable": false
}
```

- 403 or 429 (GitHub rate limit/forbidden)

```json path=null start=null
{
  "error": "GitHub API rate limit exceeded or access forbidden",
  "code": "GITHUB_RATE_LIMIT",
  "retryable": true
}
```

- 503 or 500 (Groq errors)
  - 503 when transient/retryable
  - 500 when parsing or non-retryable errors

```json path=null start=null
{
  "error": "Groq API error",
  "code": "GROQ_API_ERROR",
  "retryable": true
}
```

Headers
- Response: Content-Type: application/json
- Cache-Control: no-store

Rate Limiting
- Per-IP rate limit on this endpoint (defaults):
  - RATE_LIMIT_MAX=5 requests
  - RATE_LIMIT_WINDOW_MS=60000 milliseconds (60 seconds)
- 429 Too Many Requests

```json path=null start=null
{
  "error": "Too many requests",
  "code": "RATE_LIMITED",
  "retryable": true
}
```

Examples
- Request

```bash path=null start=null
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/vercel/next.js"}' \
  http://localhost:3000/api/analyze
```

- Successful response

```json path=null start=null
{
  "owner": "vercel",
  "repo": "next.js",
  "verdict": "approved",
  "details": "This repo ..."
}
```

2) GET /api/badge/{owner}/{repo}
- Description: Returns a dynamic SVG badge reflecting the analysis verdict for the given repository.
- Method: GET
- Path Parameters:
  - owner: string (case-insensitive; normalized to lowercase)
  - repo: string (case-insensitive; normalized to lowercase)

Behavior
- Looks up analysis by composite key (owner, repo) in lowercase.
- Maps verdict to badge state:
  - approved → green badge, "Humanity+ Passport"
  - rejected → red badge, "Not Approved"
  - missing or any error → gray badge, "Analysis Pending"
- Always returns an SVG (even for invalid slugs) to avoid leaking details.

Responses
- 200 OK (image/svg+xml)
  - Headers:
    - Content-Type: image/svg+xml; charset=utf-8
    - Cache-Control: public, max-age=300, s-maxage=600
    - ETag: Weak ETag (W/"...") for 304 handling

- 304 Not Modified
  - When If-None-Match matches the current ETag

Caching
- ETag provided (SHA-1 of the SVG payload) enables client caches and CDNs to reuse the badge for its lifetime.
- Cache-Control is set for browser and CDN caching.

Examples
- Request

```bash path=null start=null
curl -sS -H "Accept: image/svg+xml" \
  http://localhost:3000/api/badge/vercel/next.js > badge.svg
```

- Subsequent request with conditional header

```bash path=null start=null
curl -sS -H "If-None-Match: W/\"<etag-from-previous-response>\"" \
  http://localhost:3000/api/badge/vercel/next.js -o /dev/null -w "%{http_code}\n"
# → 304
```

Environment
- GROQ_API_KEY (required): API key for Groq LLM calls
- GITHUB_TOKEN (optional): GitHub PAT for increased API limits
- RATE_LIMIT_MAX (optional): Max POST /api/analyze requests per IP per window (default 5)
- RATE_LIMIT_WINDOW_MS (optional): Window in ms for rate limiting (default 60000)

Notes
- owner/repo are normalized to lowercase at persistence and in responses to avoid duplicates for case-insensitive GitHub URLs.
- The badge returns a minimal SVG with a clickable link to /passport/{owner}/{repo} (relative URL).
- The POST /api/analyze endpoint uses no-store to avoid caching sensitive/ephemeral responses.

