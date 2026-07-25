import { createFileRoute } from "@tanstack/react-router";
import { uploadthingHandler } from "#/lib/uploadthing.server";

export const Route = createFileRoute("/api/uploadthing")({
	server: {
		handlers: {
			GET: ({ request }) => uploadthingHandler(request),
			POST: ({ request }) => uploadthingHandler(request),
		},
	},
});
