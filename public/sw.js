// Service worker mínimo: hace la app instalable y cachea estáticos.
// Estrategia: network-first para navegación, cache-first para assets.
const CACHE = "bocado-v2";
const CORE_ASSETS = [
	"/",
	"/manifest.webmanifest",
	"/favicon.ico",
	"/favicon-32.png",
	"/apple-touch-icon.png",
	"/logo192.png",
	"/logo512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(CORE_ASSETS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) {
		return;
	}

	const isAsset = new URL(request.url).pathname.startsWith("/assets/");

	if (isAsset) {
		event.respondWith(
			caches.match(request).then(
				(cached) =>
					cached ||
					fetch(request).then((res) => {
						const copy = res.clone();
						caches.open(CACHE).then((c) => c.put(request, copy));
						return res;
					}),
			),
		);
		return;
	}

	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const copy = response.clone();
					caches.open(CACHE).then((cache) => cache.put(request, copy));
					return response;
				})
				.catch(() =>
					caches.match(request).then((cached) => cached || caches.match("/")),
				),
		);
	}
});
