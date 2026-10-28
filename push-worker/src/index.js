import PocketBase from "pocketbase";
import { UTApi } from "uploadthing/server";
import webpush from "web-push";
import { cleanOrphanPhotos } from "./orphan-photos.js";
import {
	isDuplicateDeliveryError,
	isReminderDue,
	localDateTime,
	mealWasRegistered,
	notificationFor,
	REMINDER_TYPES,
} from "./reminders.js";

const required = [
	"POCKETBASE_URL",
	"PB_SUPERUSER_EMAIL",
	"PB_SUPERUSER_PASSWORD",
	"VAPID_PUBLIC_KEY",
	"VAPID_PRIVATE_KEY",
];
for (const name of required) {
	if (!process.env[name])
		throw new Error(`Missing required environment variable: ${name}`);
}

const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 300_000);
const pb = new PocketBase(process.env.POCKETBASE_URL);
pb.autoCancellation(false);
webpush.setVapidDetails(
	process.env.VAPID_SUBJECT ?? "mailto:admin@bocado.app",
	process.env.VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY,
);

async function authenticate() {
	if (pb.authStore.isValid) return;
	await pb
		.collection("_superusers")
		.authWithPassword(
			process.env.PB_SUPERUSER_EMAIL,
			process.env.PB_SUPERUSER_PASSWORD,
		);
}

async function claimDelivery(user, mealType, localDay) {
	try {
		return await pb.collection("reminder_deliveries").create({
			user,
			meal_type: mealType,
			local_day: localDay,
		});
	} catch (error) {
		if (isDuplicateDeliveryError(error)) return null;
		throw error;
	}
}

// Una sola consulta para todos los usuarios con recordatorios pendientes.
async function recentMealsByUser(users, now) {
	if (users.length === 0) return new Map();
	const from = new Date(now.getTime() - 36 * 60 * 60 * 1000)
		.toISOString()
		.replace("T", " ");
	const params = Object.fromEntries(users.map((user, i) => [`u${i}`, user]));
	const userFilter = users.map((_, i) => `user = {:u${i}}`).join(" || ");
	const meals = await pb.collection("meals").getFullList({
		filter: pb.filter(`eaten_at >= {:from} && (${userFilter})`, {
			...params,
			from,
		}),
		fields: "user,entry_type,meal_type,eaten_at",
		batch: 1000,
	});
	return Map.groupBy(meals, (meal) => meal.user);
}

const USERS_PER_MEAL_QUERY = 50;

async function sendToSubscriptions(subscriptions, payload) {
	let delivered = false;
	for (const subscription of subscriptions) {
		try {
			await webpush.sendNotification(
				{
					endpoint: subscription.endpoint,
					keys: { p256dh: subscription.p256dh, auth: subscription.auth },
				},
				JSON.stringify(payload),
			);
			delivered = true;
		} catch (error) {
			if (error?.statusCode === 404 || error?.statusCode === 410) {
				await pb.collection("push_subscriptions").delete(subscription.id);
				console.info(`Removed expired subscription ${subscription.id}`);
			} else {
				console.error(`Push failed for subscription ${subscription.id}`, error);
			}
		}
	}
	return delivered;
}

async function tick(now = new Date()) {
	await authenticate();
	const [preferenceRecords, subscriptions] = await Promise.all([
		pb
			.collection("user_preferences")
			.getFullList({ fields: "user,preferences" }),
		pb.collection("push_subscriptions").getFullList(),
	]);
	const subscriptionsByUser = Map.groupBy(
		subscriptions,
		(subscription) => subscription.user,
	);

	const pending = [];
	for (const record of preferenceRecords) {
		const reminders = record.preferences?.reminders;
		const userSubscriptions = subscriptionsByUser.get(record.user) ?? [];
		if (
			!reminders?.enabled ||
			!reminders.timeZone ||
			userSubscriptions.length === 0
		)
			continue;

		let local;
		try {
			local = localDateTime(now, reminders.timeZone);
		} catch {
			console.warn(`Skipping user ${record.user}: invalid time zone`);
			continue;
		}
		const dueTypes = REMINDER_TYPES.filter((mealType) =>
			isReminderDue(reminders.meals?.[mealType], local.time),
		);
		if (dueTypes.length > 0)
			pending.push({ record, reminders, userSubscriptions, local, dueTypes });
	}

	for (let i = 0; i < pending.length; i += USERS_PER_MEAL_QUERY) {
		const chunk = pending.slice(i, i + USERS_PER_MEAL_QUERY);
		const mealsByUser = await recentMealsByUser(
			chunk.map((item) => item.record.user),
			now,
		);
		for (const item of chunk) {
			try {
				await remindUser(item, mealsByUser.get(item.record.user) ?? []);
			} catch (error) {
				// Un usuario con datos raros no debe bloquear al resto.
				console.error(`Reminder failed for user ${item.record.user}`, error);
			}
		}
	}
}

async function remindUser(
	{ record, reminders, userSubscriptions, local, dueTypes },
	meals,
) {
	for (const mealType of dueTypes) {
		if (mealWasRegistered(meals, mealType, local.day, reminders.timeZone))
			continue;
		const delivery = await claimDelivery(record.user, mealType, local.day);
		if (!delivery) continue;
		const delivered = await sendToSubscriptions(
			userSubscriptions,
			notificationFor(mealType, local.day),
		);
		if (!delivered) {
			await pb.collection("reminder_deliveries").delete(delivery.id);
		} else {
			console.info(`Sent ${mealType} reminder to user ${record.user}`);
		}
	}
}

let running = false;
async function run() {
	if (running) return;
	running = true;
	try {
		await tick();
	} catch (error) {
		pb.authStore.clear();
		console.error("Reminder tick failed", error);
	} finally {
		running = false;
	}
}

// Limpieza diaria de fotos huérfanas (opcional: requiere UPLOADTHING_TOKEN).
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const utapi = process.env.UPLOADTHING_TOKEN ? new UTApi() : null;
let lastCleanup = 0;

async function maybeCleanOrphanPhotos() {
	if (!utapi || Date.now() - lastCleanup < CLEANUP_INTERVAL_MS) return;
	lastCleanup = Date.now();
	try {
		await authenticate();
		const deleted = await cleanOrphanPhotos({ pb, utapi });
		if (deleted > 0) console.info(`Deleted ${deleted} orphan photos`);
	} catch (error) {
		console.error("Orphan photo cleanup failed", error);
	}
}

await run();
await maybeCleanOrphanPhotos();
const timer = setInterval(async () => {
	await run();
	await maybeCleanOrphanPhotos();
}, intervalMs);
for (const signal of ["SIGTERM", "SIGINT"]) {
	process.on(signal, () => {
		clearInterval(timer);
		process.exit(0);
	});
}
