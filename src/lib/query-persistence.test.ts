import type { Query } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
	mealCacheStorageKey,
	shouldPersistMealQuery,
} from "./query-persistence";

function query(queryKey: unknown[], status: "success" | "error") {
	return {
		queryKey,
		state: { status },
	} as unknown as Query;
}

describe("persistencia de consultas", () => {
	it("solo conserva consultas de comidas completadas correctamente", () => {
		expect(shouldPersistMealQuery(query(["meals", "history"], "success"))).toBe(
			true,
		);
		expect(shouldPersistMealQuery(query(["share_links"], "success"))).toBe(
			false,
		);
		expect(shouldPersistMealQuery(query(["meals"], "error"))).toBe(false);
	});

	it("separa el almacenamiento por usuario", () => {
		expect(mealCacheStorageKey("user-a")).not.toBe(
			mealCacheStorageKey("user-b"),
		);
	});
});
