import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MealCard } from "./meal-card";

describe("MealCard", () => {
	it("renders legacy records with an empty entry type as meals", () => {
		render(
			<MealCard
				meal={{
					id: "legacy-meal",
					user: "user-1",
					description: "Lentejas con verduras",
					photo_url: "https://example.com/lentejas.jpg",
					photo_key: "lentejas",
					photos: [],
					entry_type: "",
					meal_type: "comida",
					eaten_at: "2026-07-27T14:00:00.000Z",
					created: "2026-07-27T14:00:00.000Z",
					updated: "2026-07-27T14:00:00.000Z",
				}}
			/>,
		);

		expect(screen.getByText("Comida")).toBeTruthy();
		expect(
			screen.getByRole("img", { name: "Lentejas con verduras, foto 1" }),
		).toBeTruthy();
		expect(screen.queryByText("Extra")).toBeNull();
	});

	it("labels an unfinished meal", () => {
		render(
			<MealCard
				meal={{
					id: "unfinished-meal",
					user: "user-1",
					description: "Arroz con verduras",
					photo_url: "",
					photo_key: "",
					photos: [],
					entry_type: "meal",
					meal_type: "comida",
					unfinished: true,
					unfinished_note: "Demasiada cantidad",
					eaten_at: "2026-07-27T14:00:00.000Z",
					created: "2026-07-27T14:00:00.000Z",
					updated: "2026-07-27T14:00:00.000Z",
				}}
			/>,
		);

		expect(screen.getByText("No terminada")).toBeTruthy();
	});
});
