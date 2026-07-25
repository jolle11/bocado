import { createFileRoute } from "@tanstack/react-router";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { authenticateRequest } from "#/lib/pocketbase.server";

const requestSchema = z.object({
	keys: z.array(z.string().min(1)).min(1).max(10),
});

export const Route = createFileRoute("/api/uploadthing-files")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					await authenticateRequest(request);
				} catch {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				const parsed = requestSchema.safeParse(await request.json());
				if (!parsed.success) {
					return Response.json({ error: "Invalid request" }, { status: 400 });
				}

				await new UTApi().deleteFiles(parsed.data.keys);
				return Response.json({ deleted: parsed.data.keys.length });
			},
		},
	},
});
