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
		event.respondWith(networkFirstNavigation(request));
	}
});

self.addEventListener("push", (event) => {
	const data = event.data?.json() ?? {};
	event.waitUntil(
		self.registration.showNotification(data.title ?? "Bocado", {
			body: data.body ?? "¿Quieres registrar lo que has comido?",
			icon: "/logo192.png",
			badge: "/favicon-32.png",
			data: { url: data.url ?? "/new" },
			tag: data.tag ?? "meal-reminder",
		}),
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const target = new URL(
		event.notification.data?.url ?? "/new",
		self.location.origin,
	).href;
	event.waitUntil(
		self.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clients) => {
				const existing = clients.find((client) =>
					client.url.startsWith(self.location.origin),
				);
				if (existing) {
					// navigate() falla si la pestaña no está controlada por este SW.
					return existing
						.navigate(target)
						.then((client) => (client ?? existing).focus())
						.catch(() => self.clients.openWindow(target));
				}
				return self.clients.openWindow(target);
			}),
	);
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

// Red primero: tras un deploy nunca servimos HTML viejo que apunte a assets
// que ya no existen. Sin conexión usamos la copia de esa ruta o, en su defecto,
// la de la app.
async function networkFirstNavigation(request) {
	const cache = await caches.open(CACHE_NAME);
	try {
		const response = await fetch(request);
		if (response.ok) await cache.put(request, response.clone());
		return response;
	} catch (error) {
		const cached =
			(await cache.match(request)) ??
			(await cache.match("/app")) ??
			(await cache.match("/"));
		if (cached) return cached;
		throw error;
	}
}
