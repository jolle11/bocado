const CACHE_PREFIX = "bocado";
const CACHE_NAME = `${CACHE_PREFIX}-__BUILD_ID__`;
const PRECACHE_URLS = __PRECACHE_URLS__;

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter(
							(key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME,
						)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (
		request.method !== "GET" ||
		!request.url.startsWith(self.location.origin)
	) {
		return;
	}

	const url = new URL(request.url);
	if (url.pathname.startsWith("/assets/")) {
		event.respondWith(cacheFirst(request));
		return;
	}

	if (request.mode === "navigate") {
		event.respondWith(staleWhileRevalidateNavigation(event));
	}
});

async function cacheFirst(request) {
	const cached = await caches.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(CACHE_NAME);
		await cache.put(request, response.clone());
	}
	return response;
}

async function staleWhileRevalidateNavigation(event) {
	const cache = await caches.open(CACHE_NAME);
	const cached = (await cache.match(event.request)) ?? (await cache.match("/"));
	const network = fetch(event.request).then(async (response) => {
		if (response.ok) {
			await cache.put(event.request, response.clone());
		}
		return response;
	});

	if (cached) {
		event.waitUntil(network.catch(() => undefined));
		return cached;
	}

	return network;
}
