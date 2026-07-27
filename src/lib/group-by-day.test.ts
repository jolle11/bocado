import { describe, expect, it } from "vitest";
import { groupByDay } from "#/routes/_app/history";
import type { Meal } from "./types";

function meal(id: string, eaten_at: string): Meal {
	return {
		id,
		user: "u1",
		description: "test",
		photo_url: "",
		photo_key: "",
		photos: [],
		meal_type: "comida",
		eaten_at,
		created: eaten_at,
		updated: eaten_at,
	};
}

describe("groupByDay", () => {
	it("agrupa las comidas por día", () => {
		const groups = groupByDay([
			meal("a", "2026-07-25T09:00:00"),
			meal("b", "2026-07-25T14:00:00"),
			meal("c", "2026-07-24T21:00:00"),
		]);
		expect(groups).toHaveLength(2);
		expect(groups[0][0]).toBe("2026-07-25");
		expect(groups[0][1].map((m) => m.id)).toEqual(["a", "b"]);
		expect(groups[1][0]).toBe("2026-07-24");
	});

	it("devuelve vacío sin comidas", () => {
		expect(groupByDay([])).toEqual([]);
	});
});
