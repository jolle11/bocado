/// <reference path="../pb_data/types.d.ts" />
// Solo se aceptan fotos alojadas en UploadThing (evita URLs arbitrarias que
// luego se pintan en la página pública de /share).

function assertUploadthingPhotos(e) {
	const allowed = /^https:\/\/([a-z0-9-]+\.)*(ufs\.sh|utfs\.io)\//i;
	let photos = [];
	try {
		photos = JSON.parse(e.record.getString("photos") || "[]") || [];
	} catch {
		throw new BadRequestError("Formato de fotos no válido");
	}
	if (!Array.isArray(photos)) {
		throw new BadRequestError("Formato de fotos no válido");
	}
	const urls = [e.record.getString("photo_url")].concat(
		photos.map((photo) => (photo && photo.url) || ""),
	);
	for (const url of urls) {
		if (url && !allowed.test(url)) {
			throw new BadRequestError("URL de foto no permitida");
		}
	}
	e.next();
}

onRecordCreateRequest(assertUploadthingPhotos, "meals");
onRecordUpdateRequest(assertUploadthingPhotos, "meals");
