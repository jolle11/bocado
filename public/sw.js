// Service worker mínimo: hace la app instalable y cachea estáticos.
// Estrategia: network-first para navegación, cache-first para assets.
const CACHE = "bocado-v1";

self.addEventListener("install", () => self.skipWaiting());

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
			fetch(request).catch(() => caches.match(request).then((c) => c || caches.match("/"))),
		);
	}
});
