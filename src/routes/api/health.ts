import { createFileRoute } from "@tanstack/react-router";

// Healthcheck ligero para Railway: no toca PocketBase ni dependencias externas.
export const Route = createFileRoute("/api/health")({
	server: {
		handlers: {
			GET: () => Response.json({ ok: true }),
		},
	},
});
