import { beforeEach, describe, expect, it } from "vitest";
import { applyTheme, readThemePreference } from "./preferences";

describe("preferencias de tema", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.className = "";
	});

	it("migra el antiguo tema oscuro al predeterminado oscuro", () => {
		localStorage.setItem("bocado-theme", "dark");
		expect(readThemePreference()).toEqual({
			palette: "default",
			mode: "dark",
		});
	});

	it("migra una antigua paleta de color a su modo claro", () => {
		localStorage.setItem("bocado-theme", "sunset");
		expect(readThemePreference()).toEqual({
			palette: "sunset",
			mode: "light",
		});
	});

	it("combina de forma independiente paleta y modo", () => {
		applyTheme({ palette: "lavender", mode: "dark" });
		expect(document.documentElement.classList.contains("theme-lavender")).toBe(
			true,
		);
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		applyTheme({ palette: "lavender", mode: "light" });
		expect(document.documentElement.classList.contains("theme-lavender")).toBe(
			true,
		);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});
});
