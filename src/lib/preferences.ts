import { useEffect, useState } from "react";
import { pb } from "./pocketbase";

export const THEME_PALETTES = [
	{ id: "default", label: "Predeterminado", swatch: "#328f97" },
	{ id: "forest", label: "Bosque", swatch: "#478455" },
	{ id: "sunset", label: "Atardecer", swatch: "#d36b52" },
	{ id: "lavender", label: "Lavanda", swatch: "#7469a8" },
] as const;

export type ThemePalette = (typeof THEME_PALETTES)[number]["id"];
export type ThemeMode = "system" | "light" | "dark";
export type ResolvedThemeMode = Exclude<ThemeMode, "system">;

export type ReminderMealType = "desayuno" | "comida" | "cena";

export interface MealReminderPreference {
	enabled: boolean;
	time: string;
	windowStart: string;
	windowEnd: string;
}

export interface ReminderPreferences {
	enabled: boolean;
	timeZone: string;
	meals: Record<ReminderMealType, MealReminderPreference>;
}

export interface UserPreferences {
	version: 1;
	appearance: {
		palette: ThemePalette;
		mode: ThemeMode;
	};
	diary: {
		showImages: boolean;
	};
	waterGoal: WaterGoalPreference;
	reminders: ReminderPreferences;
	/** Prepared for the upcoming internationalisation work. */
	language: string;
}

export interface WaterGoalPreference {
	enabled: boolean;
	/** Objetivo diario en mililitros. */
	ml: number;
}

export const WATER_GOAL_MIN_ML = 250;
export const WATER_GOAL_MAX_ML = 6000;

interface PreferenceRecord {
	id: string;
	user: string;
	preferences: unknown;
}

export interface ThemePreference {
	palette: ThemePalette;
	mode: ThemeMode;
}

const DEFAULT_PREFERENCES: UserPreferences = {
	version: 1,
	appearance: { palette: "default", mode: "system" },
	diary: { showImages: true },
	waterGoal: { enabled: false, ml: 2000 },
	reminders: {
		enabled: false,
		timeZone: "Europe/Madrid",
		meals: {
			desayuno: {
				enabled: true,
				time: "09:30",
				windowStart: "07:00",
				windowEnd: "10:00",
			},
			comida: {
				enabled: true,
				time: "14:30",
				windowStart: "12:00",
				windowEnd: "15:00",
			},
			cena: {
				enabled: true,
				time: "22:00",
				windowStart: "20:00",
				windowEnd: "23:00",
			},
		},
	},
	language: "es",
};

const STORAGE_KEY = "bocado-preferences-v1";
const LEGACY_THEME_KEY = "bocado-theme";
const LEGACY_PALETTE_KEY = "bocado-theme-palette";
const LEGACY_MODE_KEY = "bocado-theme-mode";
const LEGACY_IMAGES_KEY = "bocado-show-images";
const PREFERENCE_EVENT = "bocado-preferences";
let localMutationGeneration = 0;

const THEME_COLORS: Record<ThemePalette, Record<ResolvedThemeMode, string>> = {
	default: { light: "#e7f3ec", dark: "#0a1418" },
	forest: { light: "#dcebdc", dark: "#0d1710" },
	sunset: { light: "#f5ded0", dark: "#1c100d" },
	lavender: { light: "#e6e0f2", dark: "#13101d" },
};

function isPalette(value: unknown): value is ThemePalette {
	return (
		typeof value === "string" &&
		THEME_PALETTES.some((palette) => palette.id === value)
	);
}

function isMode(value: unknown): value is ThemeMode {
	return value === "system" || value === "light" || value === "dark";
}

/** Normalises partial/old server documents and supplies defaults for new fields. */
type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
	return value && typeof value === "object" && !Array.isArray(value)
		? (value as UnknownRecord)
		: {};
}

const TIME_PATTERN = /^\d{2}:\d{2}$/;

function timeOr(value: unknown, fallback: string) {
	return typeof value === "string" && TIME_PATTERN.test(value)
		? value
		: fallback;
}

function boolOr(value: unknown, fallback: boolean) {
	return typeof value === "boolean" ? value : fallback;
}

/** Normalises partial/old server documents and supplies defaults for new fields. */
export function normalizePreferences(value: unknown): UserPreferences {
	const candidate = asRecord(value);
	const appearance = asRecord(candidate.appearance);
	const diary = asRecord(candidate.diary);
	const waterGoal = asRecord(candidate.waterGoal);
	const reminders = asRecord(candidate.reminders);
	const reminderMeals = asRecord(reminders.meals);
	const normalizeReminder = (meal: ReminderMealType) => {
		const value = asRecord(reminderMeals[meal]);
		const fallback = DEFAULT_PREFERENCES.reminders.meals[meal];
		return {
			enabled: boolOr(value.enabled, fallback.enabled),
			time: timeOr(value.time, fallback.time),
			windowStart: timeOr(value.windowStart, fallback.windowStart),
			windowEnd: timeOr(value.windowEnd, fallback.windowEnd),
		};
	};
	const waterMl =
		typeof waterGoal.ml === "number" && Number.isFinite(waterGoal.ml)
			? Math.round(
					Math.min(
						WATER_GOAL_MAX_ML,
						Math.max(WATER_GOAL_MIN_ML, waterGoal.ml),
					),
				)
			: DEFAULT_PREFERENCES.waterGoal.ml;

	return {
		version: 1,
		appearance: {
			palette: isPalette(appearance.palette)
				? appearance.palette
				: DEFAULT_PREFERENCES.appearance.palette,
			mode: isMode(appearance.mode)
				? appearance.mode
				: DEFAULT_PREFERENCES.appearance.mode,
		},
		diary: {
			showImages: boolOr(
				diary.showImages,
				DEFAULT_PREFERENCES.diary.showImages,
			),
		},
		waterGoal: {
			enabled: boolOr(waterGoal.enabled, DEFAULT_PREFERENCES.waterGoal.enabled),
			ml: waterMl,
		},
		reminders: {
			enabled: boolOr(reminders.enabled, false),
			timeZone:
				typeof reminders.timeZone === "string" && reminders.timeZone
					? reminders.timeZone
					: DEFAULT_PREFERENCES.reminders.timeZone,
			meals: {
				desayuno: normalizeReminder("desayuno"),
				comida: normalizeReminder("comida"),
				cena: normalizeReminder("cena"),
			},
		},
		language:
			typeof candidate.language === "string" && candidate.language
				? candidate.language
				: DEFAULT_PREFERENCES.language,
	};
}

function readLegacyPreferences(): UserPreferences {
	const savedPalette = localStorage.getItem(LEGACY_PALETTE_KEY);
	const savedMode = localStorage.getItem(LEGACY_MODE_KEY);
	const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);

	let appearance: ThemePreference;
	if (isPalette(savedPalette) && isMode(savedMode)) {
		appearance = { palette: savedPalette, mode: savedMode };
	} else if (legacyTheme === "dark") {
		appearance = { palette: "default", mode: "dark" };
	} else if (isPalette(legacyTheme) && legacyTheme !== "default") {
		appearance = { palette: legacyTheme, mode: "light" };
	} else {
		appearance = DEFAULT_PREFERENCES.appearance;
	}

	return {
		...DEFAULT_PREFERENCES,
		appearance,
		diary: {
			showImages: localStorage.getItem(LEGACY_IMAGES_KEY) !== "false",
		},
	};
}

export function readPreferences(): UserPreferences {
	const storageKey = preferenceStorageKey();
	const saved = localStorage.getItem(storageKey);
	if (saved) {
		try {
			return normalizePreferences(JSON.parse(saved));
		} catch {
			// Replace malformed local data with safe defaults below.
		}
	}

	const migrated = readLegacyPreferences();
	localStorage.setItem(storageKey, JSON.stringify(migrated));
	return migrated;
}

function preferenceStorageKey() {
	return `${STORAGE_KEY}:${pb.authStore.record?.id ?? "guest"}`;
}

function cachePreferences(preferences: UserPreferences) {
	localStorage.setItem(preferenceStorageKey(), JSON.stringify(preferences));
	applyTheme(preferences.appearance);
	window.dispatchEvent(new Event(PREFERENCE_EVENT));
}

async function findPreferenceRecord() {
	const userId = pb.authStore.record?.id;
	if (!userId) return null;
	const records = await pb
		.collection("user_preferences")
		.getFullList<PreferenceRecord>({
			filter: pb.filter("user = {:userId}", { userId }),
		});
	return records[0] ?? null;
}

async function persistPreferences(preferences: UserPreferences) {
	const userId = pb.authStore.record?.id;
	if (!userId) return;

	const record = await findPreferenceRecord();
	if (record) {
		await pb.collection("user_preferences").update(record.id, { preferences });
		return;
	}

	try {
		await pb
			.collection("user_preferences")
			.create({ user: userId, preferences });
	} catch {
		// Another tab may have created the unique user record meanwhile.
		const created = await findPreferenceRecord();
		if (!created) throw new Error("No se pudieron guardar las preferencias");
		await pb.collection("user_preferences").update(created.id, { preferences });
	}
}

function updatePreferences(
	update: (current: UserPreferences) => UserPreferences,
) {
	const next = normalizePreferences(update(readPreferences()));
	localMutationGeneration += 1;
	cachePreferences(next);
	void persistPreferences(next).catch((error) => {
		console.error("Could not persist user preferences", error);
	});
}

/**
 * Loads cloud preferences once per authenticated layout. On a user's first load,
 * their existing local settings become the initial cloud document.
 */
export function usePreferencesSync() {
	useEffect(() => {
		let cancelled = false;

		async function sync() {
			const generationAtStart = localMutationGeneration;
			try {
				const record = await findPreferenceRecord();
				if (cancelled) return;
				if (record) {
					if (localMutationGeneration === generationAtStart) {
						cachePreferences(normalizePreferences(record.preferences));
					} else {
						await persistPreferences(readPreferences());
					}
				} else {
					await persistPreferences(readPreferences());
				}
			} catch (error) {
				console.error("Could not sync user preferences", error);
			}
		}

		void sync();
		return () => {
			cancelled = true;
		};
	}, []);
}

export function resolveThemeMode(mode: ThemeMode): ResolvedThemeMode {
	if (mode !== "system") return mode;
	if (typeof window === "undefined") return "light";
	return window.matchMedia?.("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function readThemePreference(): ThemePreference {
	return readPreferences().appearance;
}

export function applyTheme({ palette, mode }: ThemePreference) {
	const resolvedMode = resolveThemeMode(mode);
	document.documentElement.classList.remove(
		"dark",
		"theme-forest",
		"theme-sunset",
		"theme-lavender",
	);
	if (palette !== "default") {
		document.documentElement.classList.add(`theme-${palette}`);
	}
	if (resolvedMode === "dark") document.documentElement.classList.add("dark");
	document.documentElement.style.colorScheme = resolvedMode;
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", THEME_COLORS[palette][resolvedMode]);
}

export function useTheme() {
	const [preference, setPreference] = useState<ThemePreference>({
		palette: "default",
		mode: "system",
	});

	useEffect(() => {
		const sync = () => {
			const saved = readThemePreference();
			setPreference(saved);
			applyTheme(saved);
		};
		sync();
		window.addEventListener(PREFERENCE_EVENT, sync);
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
		systemTheme.addEventListener("change", sync);
		return () => {
			window.removeEventListener(PREFERENCE_EVENT, sync);
			systemTheme.removeEventListener("change", sync);
		};
	}, []);

	function setAppearance(appearance: ThemePreference) {
		updatePreferences((current) => ({ ...current, appearance }));
	}

	return {
		...preference,
		resolvedMode: resolveThemeMode(preference.mode),
		setPalette: (palette: ThemePalette) =>
			setAppearance({ ...preference, palette }),
		setMode: (mode: ThemeMode) => setAppearance({ ...preference, mode }),
	};
}

export function useImagePreference() {
	const [showImages, setShowImagesState] = useState(true);

	useEffect(() => {
		const sync = () => setShowImagesState(readPreferences().diary.showImages);
		sync();
		window.addEventListener(PREFERENCE_EVENT, sync);
		return () => window.removeEventListener(PREFERENCE_EVENT, sync);
	}, []);

	function setShowImages(showImages: boolean) {
		updatePreferences((current) => ({
			...current,
			diary: { ...current.diary, showImages },
		}));
	}

	return { showImages, setShowImages };
}

export function useWaterGoalPreference() {
	const [waterGoal, setWaterGoalState] = useState<WaterGoalPreference>(
		DEFAULT_PREFERENCES.waterGoal,
	);

	useEffect(() => {
		const sync = () => setWaterGoalState(readPreferences().waterGoal);
		sync();
		window.addEventListener(PREFERENCE_EVENT, sync);
		return () => window.removeEventListener(PREFERENCE_EVENT, sync);
	}, []);

	function setWaterGoal(next: WaterGoalPreference) {
		updatePreferences((current) => ({ ...current, waterGoal: next }));
	}

	return { waterGoal, setWaterGoal };
}

export function useReminderPreferences() {
	const [reminders, setRemindersState] = useState<ReminderPreferences>(
		DEFAULT_PREFERENCES.reminders,
	);

	useEffect(() => {
		const sync = () => setRemindersState(readPreferences().reminders);
		sync();
		window.addEventListener(PREFERENCE_EVENT, sync);
		return () => window.removeEventListener(PREFERENCE_EVENT, sync);
	}, []);

	function setReminders(next: ReminderPreferences) {
		updatePreferences((current) => ({ ...current, reminders: next }));
	}

	return { reminders, setReminders };
}
