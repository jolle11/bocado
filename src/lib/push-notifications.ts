import { pb } from "./pocketbase";

function urlBase64ToUint8Array(value: string) {
	const padding = "=".repeat((4 - (value.length % 4)) % 4);
	const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
	const raw = atob(base64);
	return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function supportsPushNotifications() {
	return (
		typeof window !== "undefined" &&
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		"Notification" in window
	);
}

export async function enablePushNotifications() {
	if (!supportsPushNotifications())
		throw new Error("Este dispositivo no admite notificaciones push");
	const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
	if (!publicKey) throw new Error("Falta configurar la clave pública VAPID");

	const permission = await Notification.requestPermission();
	if (permission !== "granted")
		throw new Error("No se ha concedido permiso para notificaciones");

	const registration = await navigator.serviceWorker.ready;
	const subscribe = () =>
		registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicKey),
		});
	const existing = await registration.pushManager.getSubscription();
	const subscription = existing ?? (await subscribe());

	try {
		await saveSubscription(subscription);
	} catch (error) {
		if (!existing) throw error;
		// El endpoint puede pertenecer a otra cuenta que usó este navegador (no lo
		// vemos por las reglas de acceso): pedimos un endpoint nuevo.
		await existing.unsubscribe();
		await saveSubscription(await subscribe());
	}
}

async function saveSubscription(subscription: PushSubscription) {
	const json = subscription.toJSON();
	if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
		throw new Error("La suscripción push está incompleta");
	}

	const records = await pb.collection("push_subscriptions").getFullList({
		filter: pb.filter("endpoint = {:endpoint}", { endpoint: json.endpoint }),
	});
	const data = {
		user: pb.authStore.record?.id,
		endpoint: json.endpoint,
		p256dh: json.keys.p256dh,
		auth: json.keys.auth,
	};
	if (records[0])
		await pb.collection("push_subscriptions").update(records[0].id, data);
	else await pb.collection("push_subscriptions").create(data);
}

export async function disablePushNotifications() {
	if (!supportsPushNotifications()) return;
	const registration = await navigator.serviceWorker.getRegistration();
	if (!registration) return;
	const subscription = await registration.pushManager.getSubscription();
	if (!subscription) return;
	const records = await pb.collection("push_subscriptions").getFullList({
		filter: pb.filter("endpoint = {:endpoint}", {
			endpoint: subscription.endpoint,
		}),
	});
	await Promise.all(
		records.map((record) =>
			pb.collection("push_subscriptions").delete(record.id),
		),
	);
	await subscription.unsubscribe();
}
