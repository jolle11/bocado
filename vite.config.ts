import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "Bocado",
				short_name: "Bocado",
				description: "Diario de comidas para compartir con tu nutricionista",
				lang: "es",
				display: "standalone",
				orientation: "portrait",
				start_url: "/",
				background_color: "#0c0a09",
				theme_color: "#0c0a09",
				icons: [
					{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
				navigateFallback: null,
			},
		}),
	],
});

export default config;
