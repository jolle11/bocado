import { createFileRoute } from "@tanstack/react-router";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { keysOwnedByOthers } from "#/lib/photo-ownership";
import { authenticateRequest } from "#/lib/pocketbase.server";
import { superuserClient } from "#/lib/pocketbase-admin.server";
import { clientIp, createRateLimiter } from "#/lib/rate-limit";

const requestSchema = z.object({
	keys: z
		.array(z.string().regex(/^[\w.-]{1,200}$/))
		.min(1)
		.max(10),
});

const isAllowed = createRateLimiter({ limit: 30, windowMs: 60_000 });

export const Route = createFileRoute("/api/uploadthing-files")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (!isAllowed(clientIp(request))) {
					return Response.json({ error: "Too many requests" }, { status: 429 });
				}

				let user: Awaited<ReturnType<typeof authenticateRequest>>;
				try {
					user = await authenticateRequest(request);
				} catch {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}
				if (!user) {
					return Response.json({ error: "Unauthorized" }, { status: 401 });
				}

				const parsed = requestSchema.safeParse(
					await request.json().catch(() => null),
				);
				if (!parsed.success) {
					return Response.json({ error: "Invalid request" }, { status: 400 });
				}

				const keys = [...new Set(parsed.data.keys)];
				const foreign = await keysOwnedByOthers(
					await superuserClient(),
					user.id,
					keys,
				);
				if (foreign.length > 0) {
					return Response.json({ error: "Forbidden" }, { status: 403 });
				}

				await new UTApi().deleteFiles(keys);
				return Response.json({ deleted: keys.length });
			},
		},
	},
});
