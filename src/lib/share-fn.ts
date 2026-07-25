import { createServerFn } from "@tanstack/react-start";
import PocketBase from "pocketbase";
import { z } from "zod";
import type { Meal, ShareLink } from "./types";

async function superuserClient() {
	const pb = new PocketBase(
		process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090",
	);
	await pb
		.collection("_superusers")
		.authWithPassword(
			process.env.PB_SUPERUSER_EMAIL ?? "",
			process.env.PB_SUPERUSER_PASSWORD ?? "",
		);
	return pb;
}

export const getSharedMeals = createServerFn({ method: "GET" })
	.validator(z.object({ token: z.string().min(8) }))
	.handler(async ({ data }) => {
		const pb = await superuserClient();

		let link: ShareLink & { expand?: { user?: { name?: string } } };
		try {
			link = await pb
				.collection("share_links")
				.getFirstListItem<
					ShareLink & { expand?: { user?: { name?: string } } }
				>(
					pb.filter("token = {:token} && active = true", { token: data.token }),
					{ expand: "user" },
				);
		} catch {
			return { found: false as const };
		}

		const meals = await pb.collection("meals").getFullList<Meal>({
			filter: pb.filter("user = {:user}", { user: link.user }),
			sort: "-eaten_at",
		});

		return {
			found: true as const,
			ownerName: link.expand?.user?.name ?? "",
			meals,
		};
	});
