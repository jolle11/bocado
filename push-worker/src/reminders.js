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

export function isReminderDue(preference, localTime) {
	return (
		preference?.enabled === true &&
		localTime >= preference.time &&
		localTime <= preference.windowEnd
	);
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
