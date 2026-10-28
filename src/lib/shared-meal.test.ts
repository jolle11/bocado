import { describe, expect, it } from "vitest";
import { isUploadthingUrl, publicSharedMeal } from "./shared-meal";
import type { Meal } from "./types";

const meal: Meal = {
	id: "m1",
	user: "user-secret",
	description: "Lentejas",
	photo_url: "https://abc.ufs.sh/f/key1",
	photo_key: "key1",
	photos: [
		{ url: "https://abc.ufs.sh/f/key1", key: "key1" },
		{ url: "https://evil.example/x.png", key: "key2" },
	],
	meal_type: "comida",
	eaten_at: "2026-10-28 13:00:00.000Z",
	created: "",
	updated: "",
};

describe("publicSharedMeal", () => {
	it("elimina ids de usuario y keys de UploadThing", () => {
		const shared = publicSharedMeal(meal);
		expect(shared.user).toBe("");
		expect(shared.photo_key).toBe("");
		expect(shared.photos?.every((photo) => photo.key === "")).toBe(true);
	});

	it("descarta fotos que no vienen de UploadThing", () => {
		expect(publicSharedMeal(meal).photos).toEqual([
			{ url: "https://abc.ufs.sh/f/key1", key: "" },
		]);
		expect(
			publicSharedMeal({ ...meal, photo_url: "javascript:alert(1)" }).photo_url,
		).toBe("");
	});

	it("reconoce los dominios de UploadThing", () => {
		expect(isUploadthingUrl("https://utfs.io/f/abc")).toBe(true);
		expect(isUploadthingUrl("https://x.ufs.sh/f/abc")).toBe(true);
		expect(isUploadthingUrl("https://ufs.sh.evil.com/f/abc")).toBe(false);
		expect(isUploadthingUrl("http://utfs.io/f/abc")).toBe(false);
	});
});
