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
		setupFiles: ["src/test-setup.ts"],
		// En máquinas lentas el arranque de jsdom + imports superaba el timeout
		// por defecto del worker y Vitest acababa en error aunque los tests pasaran.
		pool: "threads",
		maxWorkers: 2,
		teardownTimeout: 60_000,
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
