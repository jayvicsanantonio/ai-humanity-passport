# Manual API Testing with Postman

This guide walks you through testing Humanity Passport APIs using Postman. It’s step-by-step and junior-friendly, covering setup, common test cases, rate limiting checks, ETag/304 validation, and helpful Postman scripting.

Prerequisites
- App running locally
  - Start the dev server in a terminal:
    ```bash path=null start=null
    npm run dev
    ```
  - By default, the app serves at http://localhost:3000.
- Environment variables
  - Copy the example and set values:
    ```bash path=null start=null
    cp .env.example .env
    ```
  - Required: GROQ_API_KEY
  - Optional (recommended): GITHUB_TOKEN
  - Optional: RATE_LIMIT_MAX (default 5), RATE_LIMIT_WINDOW_MS (default 60000)
- Postman installed
  - Download: https://www.postman.com/downloads/

Postman Setup
1) Create a Workspace (optional)
- Open Postman → Workspaces → Create Workspace → Name it “AI Humanity Passport”.

2) Create an Environment
- Environments let you store variables and switch between local/staging/prod.
- Click the gear icon (top right) → Environments → Add.
- Name: “Humanity Passport (Local)”.
- Add these variables:
  - baseUrl = http://localhost:3000
  - repoOwner = vercel (example)
  - repoName = next.js (example)
- Click Save.
- Make sure this environment is selected in the top-right dropdown.

3) Create a Collection
- Left sidebar → Collections → New Collection.
- Name it “Humanity Passport API”.
- Click the collection, then add requests inside it as described below.

Request 1: POST /api/analyze
- Purpose: Validate a GitHub URL, fetch metadata + README, call LLM, upsert to DB, and return the verdict/details.
- Method: POST
- URL: {{baseUrl}}/api/analyze
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):
  ```json path=null start=null
  {
    "repoUrl": "https://github.com/{{repoOwner}}/{{repoName}}"
  }
  ```
- Send the request.

Expected outcomes
- 200 OK: You should see a response like:
  ```json path=null start=null
  {
    "owner": "vercel",
    "repo": "next.js",
    "verdict": "approved",
    "details": "..."
  }
  ```
- 400 Bad Request: If the body is invalid (e.g., missing/invalid repoUrl), you’ll see:
  ```json path=null start=null
  {
    "error": "Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)",
    "code": "INVALID_INPUT"
  }
  ```
- 404 Not Found: If the repository doesn’t exist, you may see:
  ```json path=null start=null
  {
    "error": "Repository not found",
    "code": "GITHUB_REPO_NOT_FOUND",
    "retryable": false
  }
  ```
- 429 Too Many Requests: If you exceed rate limit (see below), you’ll see:
  ```json path=null start=null
  {
    "error": "Too many requests",
    "code": "RATE_LIMITED",
    "retryable": true
  }
  ```
- 503/500: On transient or parsing errors from the LLM, the API will respond with GROQ_API_ERROR.

Postman Tests (optional)
- Click the Tests tab in this request and paste:
  ```javascript path=null start=null
  pm.test("Status is 200 or expected error", function () {
    pm.expect([200, 400, 404, 429, 500, 503]).to.include(pm.response.code);
  });

  if (pm.response.code === 200) {
    const body = pm.response.json();
    pm.test("Response has expected fields", function () {
      pm.expect(body).to.have.property("owner");
      pm.expect(body).to.have.property("repo");
      pm.expect(["approved", "rejected"]).to.include(body.verdict);
      pm.expect(body.details).to.be.a("string");
    });
  }
  ```
- Save the request.

Request 2: GET /api/badge/{{owner}}/{{repo}}
- Purpose: Retrieve an SVG badge reflecting the stored analysis. If none exists, it shows a pending badge.
- Method: GET
- URL: {{baseUrl}}/api/badge/{{repoOwner}}/{{repoName}}
- Headers (optional):
  - Accept: image/svg+xml
- Send the request.

Viewing the SVG
- In Postman, switch the response body view to “Text” to see the raw SVG.
- Alternatively, click “Send and Download” to save as badge.svg and open it in a browser.

Expected outcomes
- 200 OK: SVG with colored background and appropriate label.
- Headers should include:
  - Content-Type: image/svg+xml; charset=utf-8
  - Cache-Control: public, max-age=300, s-maxage=600
  - ETag: value like W/"..."

Postman Tests (optional)
- Click the Tests tab and paste:
  ```javascript path=null start=null
  pm.test("Status is 200", function () {
    pm.expect(pm.response.code).to.eql(200);
  });
  pm.test("Content-Type is SVG", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("image/svg+xml");
  });
  // Store ETag to use in a conditional request
  const etag = pm.response.headers.get("ETag");
  if (etag) {
    pm.environment.set("badgeEtag", etag);
  }
  ```
- Save the request.


Rate Limiting Test
- The POST /api/analyze endpoint is rate-limited per IP (default: 5 requests per 60 seconds).
- To simulate:
  1) Open the Collection Runner.
  2) Select your collection and the POST /api/analyze request.
  3) Iterations: 6
  4) Run.
- Expected: First ~5 should return 200 (or other valid statuses), the last should return 429 RATE_LIMITED.
- Tip: If you want to see each response, toggle “Save responses” in the Runner settings.

Common Troubleshooting
- 401 from Groq (or errors): Ensure GROQ_API_KEY is set in your .env and the server restarted.
- GitHub rate-limiting: Add GITHUB_TOKEN in .env to increase GitHub API limits.
- Invalid URL errors: Make sure your repoUrl is a full URL (https://github.com/OWNER/REPO) — not just OWNER/REPO.
- 304 badge not working: Ensure you set the If-None-Match header with the exact ETag from a previous 200 response.
- Case sensitivity: The system normalizes owner/repo to lowercase for database uniqueness, but GitHub is case-insensitive.

Optional: Using Variables for Repo URL
- Instead of typing the full repo URL each time, create a variable in the environment:
  - repoUrl = https://github.com/{{repoOwner}}/{{repoName}}
- Then the POST body can be:
  ```json path=null start=null
  {
    "repoUrl": "{{repoUrl}}"
  }
  ```

Console & Logs in Postman
- You can log debug info in Tests using console.log.
- Open the Postman Console (View → Show Postman Console) to see logs and detailed request/response info.

Reference
- API specification: docs/api-spec.md
- Endpoints covered:
  - POST /api/analyze
  - GET /api/badge/{owner}/{repo}

That’s it! You now have a full workflow to validate the APIs end-to-end in Postman, including response bodies, headers, caching behavior, and rate limiting.
