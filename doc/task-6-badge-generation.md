# Task 6 — Dynamic Badge Generation

This document describes the implementation for Task 6 in .kiro/specs/humanity-passport/tasks.md: generating a dynamic SVG badge, an API endpoint to serve it, styling for each state, correct SVG headers, and basic caching. It aligns with Requirements 3.1, 3.2, 3.3, and 3.5.

Status summary
- SVG generation utility: src/lib/badge.ts
- API route: GET /api/badge/[owner]/[repo]
- States and styling:
  - approved → green (#22c55e), "Humanity+ Passport"
  - rejected → red (#ef4444), "Not Approved"
  - pending → gray (#6b7280), "Analysis Pending"
- Headers and caching: content-type image/svg+xml, ETag support, cache-control (public, max-age=300, s-maxage=600)
- Unit tests for badge generator: src/lib/__tests__/badge.test.ts

Design and behavior
- Badge SVG
  - Minimal badge with a rounded rect and centered text.
  - Includes an <a> element linking to /passport/[owner]/[repo] so it is clickable when viewed directly.
  - Owner/repo normalized to lowercase; XML-escaped when embedded in title and href to prevent injection.
- API endpoint
  - Route: src/app/api/badge/[owner]/[repo]/route.ts
  - Input: URL params (owner, repo)
  - Lookup: Prisma findUnique on (owner, repo) composite key (lowercased).
  - Verdict mapping to state: approved | rejected; missing → pending.
  - Caching: ETag via SHA-1 of the SVG payload; handles If-None-Match for 304; cache-control headers added.
  - Security: For invalid slugs or DB errors, returns a pending badge without leaking details.

Usage example (README snippet)

```md
[![Humanity+ Passport](/api/badge/OWNER/REPO)](/passport/OWNER/REPO)
```

Code references

- SVG generator
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/lib/badge.ts start=1
export type BadgeState = "approved" | "rejected" | "pending";
export function generateBadgeSVG(opts: { owner: string; repo: string; state: BadgeState }): string {
  // ... see file for full implementation
}
```

- API route
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/api/badge/[owner]/[repo]/route.ts start=1
export async function GET(req: Request, ctx: { params: { owner: string; repo: string } }) {
  // ... see file for full implementation
}
```

Testing
- Location: src/lib/__tests__/badge.test.ts
- Coverage:
  - Correct text/color per state
  - Link targets /passport/[owner]/[repo]
  - XML escaping for owner/repo and url-encoding in link

Notes and next steps
- For advanced badge visuals, we can adopt a Shields.io style and measure text more precisely.
- Consider adding integration tests for the route (304 handling and cache headers) in a future task.
