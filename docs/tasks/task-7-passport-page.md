# Task 7 — Passport Page Functionality

This document describes the implementation for Task 7 in .kiro/specs/humanity-passport/tasks.md: building the passport page at /passport/[owner]/[repo] with server-side data fetching, public access, graceful handling of missing analyses, and integration tests. It aligns with Requirements 4.1, 4.2, 4.4, and 4.5.

Status summary
- Route: src/app/passport/[owner]/[repo]/page.tsx
- Data fetching: Prisma query against Analysis table
- Public access: no authentication required
- SEO: dynamic metadata via generateMetadata
- Tests: src/app/passport/__tests__/passport-page.test.tsx

Goals and scope
- Create a publicly accessible page that shows a repository’s Humanity Passport analysis by owner/repo slug.
- Render a clear “not analyzed yet” state when no record exists, guiding users to submit analysis.
- Support special characters in owner/repo by decoding URL parameters.
- Provide an embeddable badge snippet and a copy-to-clipboard control.

Implementation details
- Dynamic route. We use the App Router dynamic segments [owner]/[repo] to map to a server component page.
- Server-side fetching with Prisma. The page calls prisma.analysis.findFirst({ where: { owner, repo } }) to retrieve the record. Any error results in a safe “not analyzed yet” UI instead of crashing the page.
- URL decoding. We decode owner and repo via decodeURIComponent to support characters like - and . that may appear URL-encoded in the path.
- Public access. No session check or auth middleware is used; the page is available to anyone with the URL.
- Badge embed. We build a Markdown snippet pointing to the badge API and the passport page. We prefer absolute URLs using NEXT_PUBLIC_BASE_URL so that users copying the snippet from any environment (local, preview, production) get a link that works outside of their current origin.
- UX states.
  - Approved vs rejected: prominent verdict card with icon and colors.
  - Not analyzed: a friendly card explains what to do next and provides a CTA back to the home page to submit analysis.
  - Embed section: shows the live badge and a Markdown snippet with one-click copy.
- SEO. generateMetadata sets per-page title and description using the decoded owner/repo for better sharing and discoverability.

Why this approach
- Server component + Prisma: keeps data fetching on the server, avoiding client-side secrets and ensuring consistent render for crawlers and link unfurlers.
- URL decoding: prevents subtle mismatches (e.g., test%2Erepo) and ensures the DB lookup uses the human-readable value users expect.
- Graceful fallback: showing an informative “not analyzed yet” state reduces confusion compared to a 404 and encourages completing the workflow.
- Absolute URLs in the embed: avoids broken images/links when Markdown is rendered on GitHub or other sites that aren’t on our origin.
- Tests: integration tests validate the primary states (approved, rejected, not analyzed), URL encoding handling, and the generated badge Markdown.

Key code references

- Page route and data fetching
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/passport/[owner]/[repo]/page.tsx start=40
async function getAnalysis(owner: string, repo: string) {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { owner, repo },
    });
    return analysis;
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return null;
  }
}
```

- Page component and badge Markdown generation
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/passport/[owner]/[repo]/page.tsx start=119
export default async function PassportPage({ params }: PassportPageProps) {
  const { owner, repo } = await params;
  const decodedOwner = decodeURIComponent(owner);
  const decodedRepo = decodeURIComponent(repo);

  const analysis = await getAnalysis(decodedOwner, decodedRepo);

  // ... render approved/rejected or a not-analyzed-yet state

  const badgeMarkdown = `[![Humanity Passport](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/badge/${decodedOwner}/${decodedRepo})](${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/passport/${decodedOwner}/${decodedRepo})`;
  // ... UI continues
}
```

- Metadata for SEO
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/passport/[owner]/[repo]/page.tsx start=468
export async function generateMetadata({ params }: PassportPageProps) {
  const { owner, repo } = await params;
  const decodedOwner = decodeURIComponent(owner);
  const decodedRepo = decodeURIComponent(repo);

  return {
    title: `${decodedOwner}/${decodedRepo} - Humanity Passport`,
    description: `View the Humanity Passport analysis for ${decodedOwner}/${decodedRepo}`,
  };
}
```

Testing
- Location: src/app/passport/__tests__/passport-page.test.tsx
- Coverage:
  - Renders approved and rejected verdict states with details
  - Renders a not-analyzed message and CTA when analysis is missing
  - Handles URL-encoded parameters (e.g., test%2Erepo)
  - Generates correct badge Markdown including absolute URLs

Future improvements
- Consider normalizing owner/repo casing at write/read boundaries to avoid case-sensitivity surprises.
- Add analytics (non-PII) to understand how often users copy the badge.
- Add structured data tags to improve link previews.

