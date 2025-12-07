import type { KnipConfig } from "knip";

const config: KnipConfig = {
	entry: ["src/app/**/*.tsx", "src/app/**/*.ts", "next.config.ts"],
	project: ["src/**/*.{ts,tsx,js,jsx}"],
	ignore: ["**/*.d.ts"],
	ignoreDependencies: ["tailwindcss", "postcss"],
	ignoreBinaries: [],
};

export default config;
