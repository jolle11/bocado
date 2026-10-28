import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MealTemplate } from "#/lib/types";
import { TemplatePicker } from "./template-picker";

const templates: MealTemplate[] = [
	{
		id: "t1",
		user: "u",
		name: "Desayuno de diario",
		entry_type: "meal",
		meal_type: "desayuno",
		description: "Tostada con tomate",
		water_ml: 0,
		created: "",
		updated: "",
	},
];

const useMealTemplates = vi.fn();
vi.mock("#/lib/queries", () => ({
	useMealTemplates: () => useMealTemplates(),
}));

describe("TemplatePicker", () => {
	it("no muestra nada sin favoritos", () => {
		useMealTemplates.mockReturnValue({ data: [] });
		const { container } = render(<TemplatePicker onPick={() => {}} />);
		expect(container.innerHTML).toBe("");
	});

	it("aplica el favorito elegido", () => {
		useMealTemplates.mockReturnValue({ data: templates });
		const onPick = vi.fn();
		render(<TemplatePicker onPick={onPick} />);
		fireEvent.click(screen.getByText("Desayuno de diario"));
		expect(onPick).toHaveBeenCalledWith(templates[0]);
	});
});
