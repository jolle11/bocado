import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { MEAL_TYPES, type MealType } from "#/lib/types";

export const DESKTOP_QUERY = "(min-width: 1024px)";

export interface ComposerSearch {
	compose?: "new";
	edit?: string;
	composeDate?: string;
	composeType?: MealType;
}

export function validateComposerSearch(
	search: Record<string, unknown>,
): ComposerSearch {
	return {
		compose: search.compose === "new" ? "new" : undefined,
		edit: typeof search.edit === "string" ? search.edit : undefined,
		composeDate:
			typeof search.composeDate === "string" &&
			/^\d{4}-\d{2}-\d{2}$/.test(search.composeDate)
				? search.composeDate
				: undefined,
		composeType:
			typeof search.composeType === "string" &&
			MEAL_TYPES.includes(search.composeType as MealType)
				? (search.composeType as MealType)
				: undefined,
	};
}

export const closedComposer: ComposerSearch = {
	compose: undefined,
	edit: undefined,
	composeDate: undefined,
	composeType: undefined,
};

function isDesktop() {
	return (
		typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
	);
}

/**
 * En escritorio abre el formulario en un panel lateral sobre la vista actual;
 * en móvil navega a la pantalla completa de siempre.
 */
export function useComposer() {
	const navigate = useNavigate();
	const updateSearch = (patch: ComposerSearch) =>
		navigate({
			to: ".",
			search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }),
		} as Parameters<typeof navigate>[0]);

	return {
		openNew({ date, mealType }: { date?: string; mealType?: MealType } = {}) {
			if (isDesktop()) {
				updateSearch({
					...closedComposer,
					compose: "new",
					composeDate: date,
					composeType: mealType,
				});
			} else {
				navigate({ to: "/new", search: { mealType, date } });
			}
		},
		openEdit(mealId: string) {
			if (isDesktop()) {
				updateSearch({ ...closedComposer, edit: mealId });
			} else {
				navigate({ to: "/edit/$mealId", params: { mealId } });
			}
		},
		close() {
			updateSearch(closedComposer);
		},
	};
}

function isTypingTarget(target: EventTarget | null) {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.isContentEditable ||
		["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
	);
}

/** Atajo de teclado de una sola tecla, ignorado al escribir o con un diálogo abierto. */
export function useHotkey(key: string, handler: () => void, enabled = true) {
	const handlerRef = useRef(handler);
	handlerRef.current = handler;

	useEffect(() => {
		if (!enabled) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== key) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (isTypingTarget(event.target)) return;
			if (document.querySelector('[role="dialog"]')) return;
			event.preventDefault();
			handlerRef.current();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [key, enabled]);
}
