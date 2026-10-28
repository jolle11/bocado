import { describe, expect, it } from "vitest";
import type { Meal } from "./types";
import { getWeeklyStats } from "./weekly-stats";

function entry(overrides: Partial<Meal>): Meal {
	return {
		id: Math.random().toString(36),
		user: "u",
		description: "x",
		photo_url: "",
		photo_key: "",
		entry_type: "meal",
		meal_type: "comida",
		eaten_at: new Date(2026, 9, 26, 14, 0).toISOString(),
		created: "",
		updated: "",
		...overrides,
	};
}

// Semana del lunes 26 al domingo 1; "hoy" es el miércoles 28.
const weekStart = new Date(2026, 9, 26);
const today = new Date(2026, 9, 28, 12);

describe("getWeeklyStats", () => {
	it("only counts elapsed days", () => {
		const stats = getWeeklyStats({ meals: [], weekStart, today });
		expect(stats.elapsedDays).toBe(3);
		expect(stats.days.filter((day) => day.future)).toHaveLength(4);
	});

	it("counts skipped main meals without penalising today", () => {
		const stats = getWeeklyStats({
			meals: [
				entry({
					meal_type: "desayuno",
					eaten_at: new Date(2026, 9, 26, 8).toISOString(),
				}),
				entry({
					meal_type: "desayuno",
					eaten_at: new Date(2026, 9, 27, 8).toISOString(),
				}),
				entry({
					meal_type: "comida",
					eaten_at: new Date(2026, 9, 26, 14).toISOString(),
				}),
			],
			weekStart,
			today,
		});
		expect(stats.skippedMainMeals).toEqual({ desayuno: 0, comida: 1, cena: 2 });
		expect(stats.daysLogged).toBe(2);
	});

	it("computes water average and goal days", () => {
		const stats = getWeeklyStats({
			meals: [
				entry({
					entry_type: "water",
					water_ml: 2000,
					eaten_at: new Date(2026, 9, 26, 10).toISOString(),
				}),
				entry({
					entry_type: "water",
					water_ml: 1000,
					eaten_at: new Date(2026, 9, 27, 10).toISOString(),
				}),
			],
			weekStart,
			today,
			waterGoalMl: 1500,
		});
		expect(stats.averageWaterMl).toBe(1000);
		expect(stats.daysMeetingWaterGoal).toBe(1);
		expect(stats.meals).toBe(0);
	});

	it("returns null goal days when the goal is disabled", () => {
		expect(
			getWeeklyStats({ meals: [], weekStart, today }).daysMeetingWaterGoal,
		).toBeNull();
	});

	it("uses the median time and counts unfinished meals", () => {
		const stats = getWeeklyStats({
			meals: [
				entry({
					meal_type: "cena",
					eaten_at: new Date(2026, 9, 26, 21, 0).toISOString(),
				}),
				entry({
					meal_type: "cena",
					eaten_at: new Date(2026, 9, 27, 22, 0).toISOString(),
					unfinished: true,
				}),
			],
			weekStart,
			today,
		});
		expect(stats.typicalTimes.cena).toBe("21:30");
		expect(stats.typicalTimes.desayuno).toBeNull();
		expect(stats.unfinished).toBe(1);
	});
});
