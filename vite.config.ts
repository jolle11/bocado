/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { serviceWorkerPlugin } from "./scripts/service-worker-plugin";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		environment: "jsdom",
		include: ["src/**/*.test.{ts,tsx}"],
	},
	plugins: [
		devtools(),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
			routeRules: {
				"/sw.js": {
					headers: {
						"cache-control": "no-cache, no-store, must-revalidate",
					},
				},
				"/manifest.webmanifest": {
					headers: { "cache-control": "no-cache, must-revalidate" },
				},
			},
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		serviceWorkerPlugin(),
	],
});

export default config;
