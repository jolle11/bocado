import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	applyTheme,
	normalizePreferences,
	readPreferences,
	readThemePreference,
	resolveThemeMode,
} from "./preferences";

describe("preferencias de tema", () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
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

	it("usa el tema del dispositivo por defecto", () => {
		expect(readThemePreference()).toEqual({
			palette: "default",
			mode: "system",
		});
	});

	it("resuelve el modo automático según el dispositivo", () => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn(() => ({ matches: true }) as MediaQueryList),
		);

		expect(resolveThemeMode("system")).toBe("dark");
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

	it("migra también la preferencia antigua de imágenes", () => {
		localStorage.setItem("bocado-show-images", "false");

		expect(readPreferences().diary.showImages).toBe(false);
		expect(readPreferences().language).toBe("es");
	});

	it("normaliza documentos parciales para poder añadir ajustes en el futuro", () => {
		expect(
			normalizePreferences({
				appearance: { palette: "forest" },
				language: "ca",
			}),
		).toEqual({
			version: 1,
			appearance: { palette: "forest", mode: "system" },
			diary: { showImages: true },
			language: "ca",
		});
	});
});
