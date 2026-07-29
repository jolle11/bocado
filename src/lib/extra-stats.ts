import { differenceInCalendarDays, format, isWithinInterval } from "date-fns";
import type { Meal } from "./types";
import { normalizeEntryType } from "./types";

export interface ExtraStats {
	extras: number;
	daysWithoutExtras: number;
	totalDays: number;
	difference: number;
}

function extrasInRange(meals: Meal[], start: Date, end: Date) {
	return meals.filter(
		(meal) =>
			normalizeEntryType(meal.entry_type) === "extra" &&
			isWithinInterval(new Date(meal.eaten_at), { start, end }),
	);
}

export function getExtraStats({
	meals,
	previousMeals,
	start,
	end,
	previousStart,
	previousEnd,
}: {
	meals: Meal[];
	previousMeals: Meal[];
	start: Date;
	end: Date;
	previousStart: Date;
	previousEnd: Date;
}): ExtraStats {
	const extras = extrasInRange(meals, start, end);
	const previousExtras = extrasInRange(
		previousMeals,
		previousStart,
		previousEnd,
	);
	const daysWithExtras = new Set(
		extras.map((meal) => format(new Date(meal.eaten_at), "yyyy-MM-dd")),
	).size;
	const totalDays = differenceInCalendarDays(end, start) + 1;

	return {
		extras: extras.length,
		daysWithoutExtras: totalDays - daysWithExtras,
		totalDays,
		difference: extras.length - previousExtras.length,
	};
}
