import type PocketBase from "pocketbase";

/**
 * Devuelve las keys que aparecen en comidas de otros usuarios. Las keys que no
 * están en ninguna comida son subidas recientes sin guardar y se pueden borrar.
 */
export async function keysOwnedByOthers(
	pb: PocketBase,
	userId: string,
	keys: string[],
) {
	// `photos ~ key` sobre-selecciona a propósito; la comprobación exacta va abajo.
	const filters = keys.map(
		(_, index) => `photo_key = {:k${index}} || photos ~ {:k${index}}`,
	);
	const params = Object.fromEntries(
		keys.map((key, index) => [`k${index}`, key]),
	);
	const meals = await pb.collection("meals").getFullList<{
		user: string;
		photo_key: string;
		photos?: { key: string }[] | null;
	}>({
		filter: pb.filter(`user != {:userId} && (${filters.join(" || ")})`, {
			...params,
			userId,
		}),
		fields: "user,photo_key,photos",
	});
	const foreign = new Set<string>();
	for (const meal of meals) {
		for (const key of [
			meal.photo_key,
			...(meal.photos ?? []).map((p) => p.key),
		]) {
			if (keys.includes(key)) foreign.add(key);
		}
	}
	return [...foreign];
}
