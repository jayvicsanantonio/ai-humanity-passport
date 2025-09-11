# Task 9 — Passport Page UI Components

This document describes the implementation for Task 9 in .kiro/specs/humanity-passport/tasks.md: creating reusable UI components used by the passport page, including the badge renderer and copy-to-clipboard control, responsive layout, and styling with TailwindCSS and shadcn/ui. It aligns with Requirements 4.2, 4.3, 6.4, and 6.5.

Status summary
- Components: src/components/passport/badge.tsx, src/components/passport/copy-button.tsx
- Tests: src/components/passport/__tests__/badge.test.tsx, src/components/passport/__tests__/copy-button.test.tsx
- Responsiveness: layout and components adapt to small screens
- Styling: TailwindCSS utilities and shadcn/ui primitives

Goals and scope
- Provide a reusable badge component that links to the passport page and loads the live badge SVG from the API.
- Provide a copy button component with “Copied!” affordance and accessible labeling.
- Ensure the passport page layout is responsive and polished across devices.

Implementation details
- Badge component.
  - Accepts owner, repo, size, interactive options.
  - Constructs URLs using encodeURIComponent to handle special characters.
  - When interactive, wraps the <img> in an <a> linking to the passport page; otherwise renders just the image (used inside the embed preview card).
  - Exposes size presets (sm → xxl) by mapping to height classes.
- CopyButton component.
  - Uses navigator.clipboard.writeText to copy the provided text.
  - Shows inline feedback by toggling icon/text to “Copied!” for 2 seconds.
  - Uses sonner toasts for additional feedback (success/error), and logs errors to console without crashing the UI.
- Responsive design and styling.
  - Utility classes ensure appropriate spacing, font sizes, and layout changes at small breakpoints.
  - shadcn/ui components (Button, Card, etc.) provide consistent interaction states and accessibility.

Why this approach
- Encapsulation: by isolating the badge and copy behavior into components, the passport page remains focused on composition and data, improving readability and testability.
- Robustness: URL-encoding protects against special character issues; a non-interactive mode prevents nested links in preview contexts.
- UX clarity: instant visual confirmation (“Copied!”) backed by toasts ensures users know the action succeeded.
- Test coverage: unit tests validate DOM attributes, encoding, and behavior without requiring full page rendering.

Key code references

- Badge component
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/components/passport/badge.tsx start=1
export function Badge({ owner, repo, className = "", size = "md", interactive = true }: BadgeProps) {
  const badgeUrl = `/api/badge/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const passportUrl = `/passport/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  // ... render <img> and optional <a>
}
```

- CopyButton component
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/components/passport/copy-button.tsx start=13
export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Badge markdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  // ... Button rendering toggling Copy/Copied!
}
```

- Badge tests
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/components/passport/__tests__/badge.test.tsx start=6
render(<Badge owner="testowner" repo="testrepo" />);
const link = screen.getByRole("link");
expect(link).toHaveAttribute("href", "/passport/testowner/testrepo");
const img = screen.getByRole("img");
expect(img).toHaveAttribute("src", "/api/badge/testowner/testrepo");
```

- CopyButton tests
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/components/passport/__tests__/copy-button.test.tsx start=24
vi.mocked(navigator.clipboard.writeText).mockResolvedValue();
render(<CopyButton text="test markdown code" />);
fireEvent.click(screen.getByRole("button", { name: "Copy" }));
expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test markdown code");
await waitFor(() => screen.getByRole("button", { name: "Copied!" }));
```

Testing
- Badge tests verify link targets, alt text, image src, className application, and URL encoding for special characters.
- CopyButton tests verify clipboard calls, copied state transitions, error handling, and custom className.

Future improvements
- Provide a “copy HTML” option next to Markdown for non-GitHub contexts.
- Add size auto-detection based on container width for the badge when used in flexible layouts.
- Extract a shared “CopyableCode” component that includes a monospaced block with a copy button.

