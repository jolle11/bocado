import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getWeeklyStats } from "#/lib/weekly-stats";
import { WeeklyStatsCard } from "./weekly-stats-card";

describe("WeeklyStatsCard", () => {
	it("resume días registrados y comidas sin registrar", () => {
		const stats = getWeeklyStats({
			meals: [],
			weekStart: new Date(2026, 9, 26),
			today: new Date(2026, 9, 28, 12),
		});
		render(<WeeklyStatsCard stats={stats} waterGoalMl={null} />);
		expect(screen.getByText("0 de 3 días registrados")).toBeTruthy();
		expect(screen.getByText(/Sin registrar: desayuno \(2\)/)).toBeTruthy();
		expect(screen.getAllByRole("listitem")).toHaveLength(7);
	});
});
