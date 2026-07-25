import { useEffect, useState } from "react";

export const THEME_PALETTES = [
	{ id: "default", label: "Predeterminado", swatch: "#328f97" },
	{ id: "forest", label: "Bosque", swatch: "#478455" },
	{ id: "sunset", label: "Atardecer", swatch: "#d36b52" },
	{ id: "lavender", label: "Lavanda", swatch: "#7469a8" },
] as const;

export type ThemePalette = (typeof THEME_PALETTES)[number]["id"];
export type ThemeMode = "light" | "dark";

export interface ThemePreference {
	palette: ThemePalette;
	mode: ThemeMode;
}

const LEGACY_THEME_KEY = "bocado-theme";
const PALETTE_KEY = "bocado-theme-palette";
const MODE_KEY = "bocado-theme-mode";
const IMAGES_KEY = "bocado-show-images";
const PREFERENCE_EVENT = "bocado-preferences";

const THEME_COLORS: Record<ThemePalette, Record<ThemeMode, string>> = {
	default: { light: "#e7f3ec", dark: "#0a1418" },
	forest: { light: "#dcebdc", dark: "#0d1710" },
	sunset: { light: "#f5ded0", dark: "#1c100d" },
	lavender: { light: "#e6e0f2", dark: "#13101d" },
};

function isPalette(value: string | null): value is ThemePalette {
	return THEME_PALETTES.some((palette) => palette.id === value);
}

function isMode(value: string | null): value is ThemeMode {
	return value === "light" || value === "dark";
}

export function readThemePreference(): ThemePreference {
	const savedPalette = localStorage.getItem(PALETTE_KEY);
	const savedMode = localStorage.getItem(MODE_KEY);
	if (isPalette(savedPalette) && isMode(savedMode)) {
		return { palette: savedPalette, mode: savedMode };
	}

	const legacy = localStorage.getItem(LEGACY_THEME_KEY);
	const preference: ThemePreference =
		legacy === "dark"
			? { palette: "default", mode: "dark" }
			: isPalette(legacy) && legacy !== "default"
				? { palette: legacy, mode: "light" }
				: { palette: "default", mode: "light" };

	localStorage.setItem(PALETTE_KEY, preference.palette);
	localStorage.setItem(MODE_KEY, preference.mode);
	return preference;
}

export function applyTheme({ palette, mode }: ThemePreference) {
	document.documentElement.classList.remove(
		"dark",
		"theme-forest",
		"theme-sunset",
		"theme-lavender",
	);
	if (palette !== "default") {
		document.documentElement.classList.add(`theme-${palette}`);
	}
	if (mode === "dark") document.documentElement.classList.add("dark");
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", THEME_COLORS[palette][mode]);
}

function saveTheme(preference: ThemePreference) {
	localStorage.setItem(PALETTE_KEY, preference.palette);
	localStorage.setItem(MODE_KEY, preference.mode);
	applyTheme(preference);
	window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

export function useTheme() {
	const [preference, setPreference] = useState<ThemePreference>({
		palette: "default",
		mode: "light",
	});

	useEffect(() => {
		const sync = () => {
			const saved = readThemePreference();
			setPreference(saved);
			applyTheme(saved);
		};
		sync();
		window.addEventListener(PREFERENCE_EVENT, sync);
		return () => window.removeEventListener(PREFERENCE_EVENT, sync);
	}, []);

	function setPalette(palette: ThemePalette) {
		saveTheme({ ...preference, palette });
	}

	function setMode(mode: ThemeMode) {
		saveTheme({ ...preference, mode });
	}

	return { ...preference, setPalette, setMode };
}

export function useImagePreference() {
	const [showImages, setShowImagesState] = useState(true);

	useEffect(() => {
		setShowImagesState(localStorage.getItem(IMAGES_KEY) !== "false");
	}, []);

	function setShowImages(value: boolean) {
		setShowImagesState(value);
		localStorage.setItem(IMAGES_KEY, String(value));
		window.dispatchEvent(new Event(PREFERENCE_EVENT));
	}

	useEffect(() => {
		const sync = () =>
			setShowImagesState(localStorage.getItem(IMAGES_KEY) !== "false");
		window.addEventListener(PREFERENCE_EVENT, sync);
		return () => window.removeEventListener(PREFERENCE_EVENT, sync);
	}, []);

	return { showImages, setShowImages };
}
