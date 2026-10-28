import { addDays, format, isAfter, isSameDay, startOfDay } from "date-fns";
import { type Meal, type MealType, normalizeEntryType } from "./types";

export const MAIN_MEALS = ["desayuno", "comida", "cena"] as const;
type MainMeal = (typeof MAIN_MEALS)[number];

export interface DayStats {
	date: Date;
	meals: number;
	waterMl: number;
	/** El día aún no ha llegado: no cuenta para medias ni comidas saltadas. */
	future: boolean;
}

export interface WeeklyStats {
	days: DayStats[];
	elapsedDays: number;
	daysLogged: number;
	meals: number;
	unfinished: number;
	averageWaterMl: number;
	/** null si el objetivo de agua está desactivado. */
	daysMeetingWaterGoal: number | null;
	skippedMainMeals: Record<MainMeal, number>;
	/** Hora habitual (mediana, "HH:mm") de cada comida principal. */
	typicalTimes: Record<MainMeal, string | null>;
}

function median(values: number[]) {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2
		? sorted[middle]
		: Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function formatMinutes(minutes: number | null) {
	if (minutes === null) return null;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getWeeklyStats({
	meals,
	weekStart,
	today,
	waterGoalMl = null,
}: {
	meals: Meal[];
	weekStart: Date;
	today: Date;
	waterGoalMl?: number | null;
}): WeeklyStats {
	const start = startOfDay(weekStart);
	const todayStart = startOfDay(today);
	const entries = meals.map((meal) => ({
		meal,
		type: normalizeEntryType(meal.entry_type),
		date: new Date(meal.eaten_at),
	}));

	const days: DayStats[] = Array.from({ length: 7 }, (_, index) => {
		const date = addDays(start, index);
		const ofDay = entries.filter((entry) => isSameDay(entry.date, date));
		return {
			date,
			meals: ofDay.filter((entry) => entry.type === "meal").length,
			waterMl: ofDay
				.filter((entry) => entry.type === "water")
				.reduce((total, entry) => total + (entry.meal.water_ml ?? 0), 0),
			future: isAfter(date, todayStart),
		};
	});
	const elapsed = days.filter((day) => !day.future);
	const mealEntries = entries.filter((entry) => entry.type === "meal");

	const skippedMainMeals = {} as Record<MainMeal, number>;
	const typicalTimes = {} as Record<MainMeal, string | null>;
	for (const type of MAIN_MEALS) {
		const ofType = mealEntries.filter(
			(entry) => entry.meal.meal_type === (type as MealType),
		);
		const loggedDays = new Set(
			ofType.map((entry) => format(entry.date, "yyyy-MM-dd")),
		);
		// Hoy solo cuenta como saltada si ya ha pasado el día; se evalúa al final.
		skippedMainMeals[type] = elapsed.filter(
			(day) =>
				!isSameDay(day.date, todayStart) &&
				!loggedDays.has(format(day.date, "yyyy-MM-dd")),
		).length;
		typicalTimes[type] = formatMinutes(
			median(
				ofType.map(
					(entry) => entry.date.getHours() * 60 + entry.date.getMinutes(),
				),
			),
		);
	}

	const totalWater = elapsed.reduce((total, day) => total + day.waterMl, 0);

	return {
		days,
		elapsedDays: elapsed.length,
		daysLogged: elapsed.filter((day) => day.meals > 0).length,
		meals: mealEntries.length,
		unfinished: mealEntries.filter((entry) => entry.meal.unfinished).length,
		averageWaterMl: elapsed.length
			? Math.round(totalWater / elapsed.length)
			: 0,
		daysMeetingWaterGoal:
			waterGoalMl && waterGoalMl > 0
				? elapsed.filter((day) => day.waterMl >= waterGoalMl).length
				: null,
		skippedMainMeals,
		typicalTimes,
	};
}
