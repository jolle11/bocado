import { describe, expect, it } from "vitest";
import { mealFormSchema } from "./types";

const baseEntry = {
	entry_type: "meal" as const,
	description: "Lentejas",
	meal_type: "comida" as const,
	water_ml: 250,
	finished: true,
	unfinished_note: "",
	eaten_at: "2026-07-27T13:00",
	photo_url: "",
	photo_key: "",
	photos: [],
};

describe("mealFormSchema", () => {
	it("accepts water without a description", () => {
		const result = mealFormSchema.safeParse({
			...baseEntry,
			entry_type: "water",
			description: "",
			water_ml: 500,
		});

		expect(result.success).toBe(true);
	});

	it("requires text for an extra", () => {
		const result = mealFormSchema.safeParse({
			...baseEntry,
			entry_type: "extra",
			description: " ",
		});

		expect(result.success).toBe(false);
	});

	it("rejects water without an amount", () => {
		const result = mealFormSchema.safeParse({
			...baseEntry,
			entry_type: "water",
			description: "",
			water_ml: 0,
		});

		expect(result.success).toBe(false);
	});
});
