import type PocketBase from "pocketbase";
import { describe, expect, it, vi } from "vitest";
import { keysOwnedByOthers } from "./photo-ownership";

function fakePb(meals: unknown[]) {
	const getFullList = vi.fn().mockResolvedValue(meals);
	const pb = {
		filter: (raw: string) => raw,
		collection: () => ({ getFullList }),
	} as unknown as PocketBase;
	return { pb, getFullList };
}

describe("keysOwnedByOthers", () => {
	it("devuelve solo las keys exactas usadas por otros usuarios", async () => {
		const { pb, getFullList } = fakePb([
			{ user: "other", photo_key: "k1", photos: [{ key: "k1" }] },
			// `photos ~ k2` también encuentra "k22": no debe contar como k2.
			{ user: "other", photo_key: "", photos: [{ key: "k22" }] },
		]);
		await expect(keysOwnedByOthers(pb, "me", ["k1", "k2"])).resolves.toEqual([
			"k1",
		]);
		expect(getFullList.mock.calls[0][0].filter).toContain("user != {:userId}");
	});

	it("permite borrar keys que no están en ninguna comida ajena", async () => {
		const { pb } = fakePb([]);
		await expect(keysOwnedByOthers(pb, "me", ["new"])).resolves.toEqual([]);
	});
});
