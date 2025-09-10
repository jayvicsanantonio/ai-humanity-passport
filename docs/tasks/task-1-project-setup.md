# Task 1 — Project Structure and Core Dependencies

This document describes the implementation for Task 1 in .kiro/specs/humanity-passport/tasks.md: initializing the Next.js application with TypeScript (App Router), adding foundational libraries (TailwindCSS v4, shadcn/ui, Prisma), setting up testing/linting, and establishing a clear project structure.

Status summary
- Next.js (App Router) + TypeScript initialized
- Core styling and UI libraries configured (Tailwind v4, shadcn/ui, lucide-react)
- Theme support via next-themes, global CSS tokens, and utility classes
- Database foundation present (Prisma + SQLite) — details in Task 2 doc
- Linting/formatting with Biome; pre-commit hook via Husky + lint-staged
- Unit testing with Vitest + Testing Library (jsdom)

Key technology and configuration

- Next.js configuration
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/next.config.ts start=1
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
};

export default nextConfig;
```

- TypeScript + path alias
```json path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/tsconfig.json start=1
{
	"compilerOptions": {
		"target": "ES2017",
		"lib": ["dom", "dom.iterable", "esnext"],
		"allowJs": true,
		"skipLibCheck": true,
		"strict": true,
		"noEmit": true,
		"esModuleInterop": true,
		"module": "esnext",
		"moduleResolution": "bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"jsx": "preserve",
		"incremental": true,
		"plugins": [
			{
				"name": "next"
			}
		],
		"paths": {
			"@/*": ["./src/*"]
		}
	},
	"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
	"exclude": ["node_modules"]
}
```

- Tailwind v4 via PostCSS plugin
```js path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/postcss.config.mjs start=1
const config = {
	plugins: ["@tailwindcss/postcss"],
};

export default config;
```

- Global styles and design tokens
```css path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/globals.css start=1
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--font-sans: var(--font-geist-sans);
	--font-mono: var(--font-geist-mono);
	--font-elegant: var(--font-elegant);
	--color-sidebar-ring: var(--sidebar-ring);
	--color-sidebar-border: var(--sidebar-border);
	--color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
	--color-sidebar-accent: var(--sidebar-accent);
	--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
	--color-sidebar-primary: var(--sidebar-primary);
	--color-sidebar-foreground: var(--sidebar-foreground);
	--color-sidebar: var(--sidebar);
	--color-chart-5: var(--chart-5);
	--color-chart-4: var(--chart-4);
	--color-chart-3: var(--chart-3);
	--color-chart-2: var(--chart-2);
	--color-chart-1: var(--chart-1);
	--color-ring: var(--ring);
	--color-input: var(--input);
	--color-border: var(--border);
	--color-destructive: var(--destructive);
	--color-accent-foreground: var(--accent-foreground);
	--color-accent: var(--accent);
	--color-muted-foreground: var(--muted-foreground);
	--color-muted: var(--muted);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-secondary: var(--secondary);
	--color-primary-foreground: var(--primary-foreground);
	--color-primary: var(--primary);
	--color-popover-foreground: var(--popover-foreground);
	--color-popover: var(--popover);
	--color-card-foreground: var(--card-foreground);
	--color-card: var(--card);
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);
}
```

- Theming and root layout
```tsx path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/app/layout.tsx start=1
import type { Metadata } from "next";
import { Crimson_Text, JetBrains_Mono, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
	weight: ["300", "400", "500", "600", "700"],
});

const crimsonText = Crimson_Text({
	variable: "--font-elegant",
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Humanity+ Passport",
	description:
		"Get your GitHub repository evaluated for its positive impact on humanity. Earn a badge that showcases your contribution to making the world better.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${poppins.variable} ${crimsonText.variable} ${jetbrainsMono.variable} antialiased font-sans`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
```

- UI building blocks (shadcn/ui style)
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/src/components/ui/button.tsx start=1
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
				destructive:
					"bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:shadow-xl focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:scale-[1.02] active:scale-[0.98]",
				outline:
					"border bg-background shadow-lg hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
				secondary:
					"bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base font-semibold",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
```

- Testing configuration
```ts path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/vitest.config.ts start=1
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		globals: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
```

- Lint-staged configuration (Husky pre-commit hooks run this)
```json path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/.lintstagedrc.json start=1
{
	"*.{js,jsx,ts,tsx,cts,mts,cjs,mjs,json,jsonc,md,css}": [
		"biome check --write --no-errors-on-unmatched"
	]
}
```

Directory structure (overview)
```text path=null start=null
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    __tests__/page.test.tsx
  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
      sonner.tsx
  lib/
    utils.ts
    db.ts
    __tests__/validation.test.ts
public/
prisma/
  schema.prisma
.husky/pre-commit -> runs lint-staged
.github/workflows/biome.yml -> Biome CI
```

Core scripts
```json path=/Users/jayvicsanantonio/Developer/ai-humanity-passport/package.json start=5
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "biome check .",
  "fix": "biome check --write .",
  "prepare": "husky",
  "postinstall": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:push": "prisma db push",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Notes
- Tailwind v4 is used via @tailwindcss/postcss; no tailwind.config file is required for basic usage.
- shadcn/ui patterns: components leverage cn() from src/lib/utils.ts, class-variance-authority (cva), and tailwind-merge.
- Theming relies on next-themes and CSS custom properties declared in globals.css.
- Database (Prisma + SQLite) is set up; see Task 2 doc for schema, env, and migration workflow.

