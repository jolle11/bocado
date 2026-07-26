import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { applyTheme, readThemePreference } from "#/lib/preferences";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{
				title: "Bocado",
			},
			{
				name: "description",
				content: "Diario de comidas para compartir con tu nutricionista",
			},
			{
				name: "theme-color",
				content: "#e7f3ec",
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes",
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default",
			},
			{
				name: "application-name",
				content: "Bocado",
			},
			{
				name: "mobile-web-app-capable",
				content: "yes",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "Bocado",
			},
			{
				property: "og:description",
				content: "Diario de comidas para compartir con tu nutricionista",
			},
			{
				property: "og:image",
				content: "/logo512.png",
			},
			{
				name: "twitter:card",
				content: "summary",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest",
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16.png",
			},
			{
				rel: "icon",
				type: "image/x-icon",
				href: "/favicon.ico",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		const syncTheme = () => applyTheme(readThemePreference());
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
		syncTheme();
		systemTheme.addEventListener("change", syncTheme);
		if ("serviceWorker" in navigator && import.meta.env.PROD) {
			navigator.serviceWorker.register("/sw.js");
		}
		return () => systemTheme.removeEventListener("change", syncTheme);
	}, []);

	return (
		<html lang="es">
			<head>
				<HeadContent />
				<script
					defer
					src="https://umamis.up.railway.app/script.js"
					data-website-id="2f8b3cc5-bc96-4c3f-b736-199008aca20b"
				/>
			</head>
			<body>
				{children}
				{!import.meta.env.VITE_E2E && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
