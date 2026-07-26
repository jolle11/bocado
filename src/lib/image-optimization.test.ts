import { describe, expect, it } from "vitest";
import {
	IMAGE_TARGET_SIZE,
	needsServerOptimization,
} from "./image-optimization";

describe("umbral de optimización en servidor", () => {
	it("acepta una imagen que ya cumple el objetivo", () => {
		expect(needsServerOptimization(IMAGE_TARGET_SIZE)).toBe(false);
	});

	it("reprocesa cualquier imagen que supera el objetivo", () => {
		expect(needsServerOptimization(IMAGE_TARGET_SIZE + 1)).toBe(true);
	});
});
