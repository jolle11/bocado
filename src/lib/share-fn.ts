import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { superuserClient } from "./pocketbase-admin.server";
import { clientIp, createRateLimiter } from "./rate-limit";
import { publicSharedMeal } from "./shared-meal";
import type { Meal, ShareLink } from "./types";

const isAllowed = createRateLimiter({ limit: 60, windowMs: 60_000 });

const PUBLIC_FIELDS = [
	"id",
	"description",
	"photo_url",
	"photos",
	"entry_type",
	"meal_type",
	"water_ml",
	"unfinished",
	"unfinished_note",
	"eaten_at",
].join(",");

export const getSharedMeals = createServerFn({ method: "GET" })
	.validator(z.object({ token: z.string().min(8).max(64) }))
	.handler(async ({ data }) => {
		if (!isAllowed(clientIp(getRequest()))) {
			return { found: false as const, rateLimited: true as const };
		}

		const pb = await superuserClient();

		let link: ShareLink & { expand?: { user?: { name?: string } } };
		try {
			link = await pb
				.collection("share_links")
				.getFirstListItem<
					ShareLink & { expand?: { user?: { name?: string } } }
				>(
					pb.filter("token = {:token} && active = true", { token: data.token }),
					{ expand: "user", fields: "*,expand.user.name" },
				);
		} catch {
			return { found: false as const };
		}

		if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
			return { found: false as const, expired: true as const };
		}

		const filters = ["user = {:user}"];
		const filterParams: Record<string, string> = { user: link.user };
		if (link.visible_from) {
			filters.push("eaten_at >= {:visibleFrom}");
			filterParams.visibleFrom = link.visible_from;
		}
		if (link.visible_until) {
			filters.push("eaten_at <= {:visibleUntil}");
			filterParams.visibleUntil = link.visible_until;
		}

		const meals = await pb.collection("meals").getFullList<Meal>({
			filter: pb.filter(filters.join(" && "), filterParams),
			sort: "-eaten_at",
			fields: PUBLIC_FIELDS,
			batch: 500,
		});

		return {
			found: true as const,
			ownerName: link.expand?.user?.name ?? "",
			meals: meals.map(publicSharedMeal),
			visibleFrom: link.visible_from || null,
			visibleUntil: link.visible_until || null,
		};
	});
