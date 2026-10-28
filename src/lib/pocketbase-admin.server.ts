import PocketBase from "pocketbase";

let client: PocketBase | null = null;

/** Cliente superusuario cacheado; reautentica solo si el token ha caducado. */
export async function superuserClient() {
	if (!client) {
		client = new PocketBase(
			process.env.POCKETBASE_URL ?? "http://127.0.0.1:8090",
		);
		client.autoCancellation(false);
	}
	if (!client.authStore.isValid) {
		await client
			.collection("_superusers")
			.authWithPassword(
				process.env.PB_SUPERUSER_EMAIL ?? "",
				process.env.PB_SUPERUSER_PASSWORD ?? "",
			);
	}
	return client;
}
