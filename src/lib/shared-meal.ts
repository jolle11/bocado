import type { Meal } from "./types";

const UPLOADTHING_URL = /^https:\/\/([a-z0-9-]+\.)*(ufs\.sh|utfs\.io)\//i;

export function isUploadthingUrl(url: string | undefined | null) {
	return Boolean(url && UPLOADTHING_URL.test(url));
}

/** Versión pública de una comida: sin ids de usuario ni keys de UploadThing. */
export function publicSharedMeal(meal: Meal): Meal {
	return {
		...meal,
		user: "",
		photo_key: "",
		photo_url: isUploadthingUrl(meal.photo_url) ? meal.photo_url : "",
		photos: (meal.photos ?? [])
			.filter((photo) => isUploadthingUrl(photo?.url))
			.map((photo) => ({ url: photo.url, key: "" })),
		created: meal.created ?? "",
		updated: meal.updated ?? "",
	};
}
