import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WaterGoalProgress } from "./water-goal-progress";

describe("WaterGoalProgress", () => {
	it("muestra lo que falta para el objetivo", () => {
		render(<WaterGoalProgress waterMl={500} goalMl={2000} />);
		expect(screen.getByText("Te faltan 1.50 l")).toBeTruthy();
		expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
			"500",
		);
	});

	it("celebra el objetivo cumplido", () => {
		render(<WaterGoalProgress waterMl={2500} goalMl={2000} />);
		expect(screen.getByText(/Objetivo de agua cumplido/)).toBeTruthy();
	});

	it("sin objetivo solo muestra el total", () => {
		render(<WaterGoalProgress waterMl={750} goalMl={null} />);
		expect(screen.getByText("Agua hoy")).toBeTruthy();
		expect(screen.queryByRole("progressbar")).toBeNull();
	});
});
