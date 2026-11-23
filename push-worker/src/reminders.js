export const REMINDER_TYPES = ["desayuno", "comida", "cena"];

const COPY = {
	desayuno: {
		title: "¿Ya has desayunado?",
		body: "Añádelo a tu diario de Bocado.",
	},
	comida: { title: "¿Ya has comido?", body: "Registra tu comida en Bocado." },
	cena: { title: "¿Ya has cenado?", body: "Añade tu cena al diario." },
};

export function localDateTime(date, timeZone) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date);
	const part = (type) => parts.find((value) => value.type === type)?.value;
	return {
		day: `${part("year")}-${part("month")}-${part("day")}`,
		time: `${part("hour")}:${part("minute")}`,
	};
}

/** Margen mínimo tras la hora elegida para que un tick (cada 5 min) lo pille. */
export const MIN_WINDOW_MINUTES = 60;

function toMinutes(time) {
	const [h, m] = String(time).split(":").map(Number);
	return Number.isInteger(h) && Number.isInteger(m) ? h * 60 + m : null;
}

/**
 * El usuario solo edita `time`; `windowEnd` es un valor por defecto. Si la hora
 * elegida queda pegada o por detrás de `windowEnd`, ampliamos la ventana para
 * no perder el recordatorio en silencio. Nunca cruza la medianoche.
 */
export function isReminderDue(preference, localTime) {
	if (preference?.enabled !== true) return false;
	const start = toMinutes(preference.time);
	const now = toMinutes(localTime);
	if (start === null || now === null) return false;
	const end = Math.min(
		23 * 60 + 59,
		Math.max(toMinutes(preference.windowEnd) ?? 0, start + MIN_WINDOW_MINUTES),
	);
	return now >= start && now <= end;
}

export function mealWasRegistered(meals, mealType, localDay, timeZone) {
	return meals.some(
		(meal) =>
			meal.entry_type !== "water" &&
			meal.entry_type !== "extra" &&
			meal.meal_type === mealType &&
			localDateTime(parsePocketBaseDate(meal.eaten_at), timeZone).day ===
				localDay,
	);
}

function parsePocketBaseDate(value) {
	const iso = value.replace(" ", "T");
	return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
}

export function notificationFor(mealType, localDay) {
	return {
		...COPY[mealType],
		url: `/new?mealType=${mealType}`,
		tag: `meal-reminder-${mealType}-${localDay}`,
	};
}

/** PocketBase responde 400 con `validation_not_unique` si ya se envió hoy. */
export function isDuplicateDeliveryError(error) {
	if (error?.status !== 400) return false;
	const fields = error?.response?.data ?? error?.data?.data ?? {};
	return Object.values(fields).some(
		(field) => field?.code === "validation_not_unique",
	);
}
