import assert from "node:assert/strict";
import test from "node:test";
import {
	findOrphanKeys,
	ORPHAN_MIN_AGE_MS,
	referencedPhotoKeys,
} from "./orphan-photos.js";

test("collects keys from legacy and multi-photo meals", () => {
	const keys = referencedPhotoKeys([
		{ photo_key: "a", photos: null },
		{ photo_key: "", photos: [{ key: "b" }, { key: "" }] },
	]);
	assert.deepEqual([...keys].sort(), ["a", "b"]);
});

test("only deletes old, uploaded, unreferenced files", () => {
	const now = 10 * ORPHAN_MIN_AGE_MS;
	const old = now - ORPHAN_MIN_AGE_MS - 1;
	const files = [
		{ key: "kept", status: "Uploaded", uploadedAt: old },
		{ key: "orphan", status: "Uploaded", uploadedAt: old },
		{ key: "recent", status: "Uploaded", uploadedAt: now - 1000 },
		{ key: "pending", status: "Uploading", uploadedAt: old },
	];
	assert.deepEqual(findOrphanKeys(files, new Set(["kept"]), now), ["orphan"]);
});
