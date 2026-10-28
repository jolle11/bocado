import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useToday } from "./use-today";

describe("useToday", () => {
	afterEach(() => vi.useRealTimers());

	it("cambia de día al pasar la medianoche", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 9, 28, 23, 59, 30));
		const { result } = renderHook(() => useToday());
		expect(result.current.getDate()).toBe(28);

		act(() => {
			vi.advanceTimersByTime(60_000);
		});
		expect(result.current.getDate()).toBe(29);
	});

	it("se actualiza al volver a la app", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 9, 28, 12));
		const { result } = renderHook(() => useToday());
		vi.setSystemTime(new Date(2026, 9, 30, 9));
		act(() => {
			document.dispatchEvent(new Event("visibilitychange"));
		});
		expect(result.current.getDate()).toBe(30);
	});
});
