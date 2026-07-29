import { describe, expect, it } from "vitest";
import { getExtraStats } from "./extra-stats";
import type { Meal } from "./types";

function entry(
	id: string,
	entryType: Meal["entry_type"],
	eatenAt: string,
): Meal {
	return {
		id,
		user: "user",
		description: id,
		photo_url: "",
		photo_key: "",
		entry_type: entryType,
		meal_type: "comida",
		eaten_at: eatenAt,
		created: eatenAt,
		updated: eatenAt,
	};
}

describe("getExtraStats", () => {
	it("counts extras, distinct days without extras and the previous-period difference", () => {
		const stats = getExtraStats({
			meals: [
				entry("extra-1", "extra", "2026-07-27T10:00:00"),
				entry("extra-2", "extra", "2026-07-27T18:00:00"),
				entry("meal", "meal", "2026-07-28T14:00:00"),
				entry("extra-3", "extra", "2026-07-30T10:00:00"),
			],
			previousMeals: [entry("previous-extra", "extra", "2026-07-20T10:00:00")],
			start: new Date("2026-07-27T00:00:00"),
			end: new Date("2026-08-02T23:59:59"),
			previousStart: new Date("2026-07-20T00:00:00"),
			previousEnd: new Date("2026-07-26T23:59:59"),
		});

		expect(stats).toEqual({
			extras: 3,
			daysWithoutExtras: 5,
			totalDays: 7,
			difference: 2,
		});
	});
});
