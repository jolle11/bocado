// Borra de UploadThing las fotos que no están en ninguna comida (p. ej. el
// usuario cerró la app a mitad de guardar). Solo toca ficheros con más de un
// día de antigüedad para no pisar subidas en curso.

export const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;

export function findOrphanKeys(files, referencedKeys, now = Date.now()) {
	return files
		.filter(
			(file) =>
				file.status === "Uploaded" &&
				now - file.uploadedAt > ORPHAN_MIN_AGE_MS &&
				!referencedKeys.has(file.key),
		)
		.map((file) => file.key);
}

export function referencedPhotoKeys(meals) {
	const keys = new Set();
	for (const meal of meals) {
		if (meal.photo_key) keys.add(meal.photo_key);
		for (const photo of Array.isArray(meal.photos) ? meal.photos : []) {
			if (photo?.key) keys.add(photo.key);
		}
	}
	return keys;
}

export async function cleanOrphanPhotos({ pb, utapi, now = Date.now() }) {
	const files = [];
	for (let offset = 0; ; offset += 500) {
		const page = await utapi.listFiles({ limit: 500, offset });
		files.push(...page.files);
		if (!page.hasMore) break;
	}
	if (files.length === 0) return 0;

	const meals = await pb.collection("meals").getFullList({
		filter: 'photo_key != "" || photos != null',
		fields: "photo_key,photos",
		batch: 1000,
	});
	const orphans = findOrphanKeys(files, referencedPhotoKeys(meals), now);
	for (let i = 0; i < orphans.length; i += 100) {
		await utapi.deleteFiles(orphans.slice(i, i + 100));
	}
	return orphans.length;
}
