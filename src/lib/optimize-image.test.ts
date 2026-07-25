import { describe, expect, it } from "vitest";
import { fitWithin } from "./optimize-image";

describe("fitWithin", () => {
	it("reduce una foto horizontal conservando su proporción", () => {
		expect(fitWithin(4032, 3024)).toEqual({ width: 1920, height: 1440 });
	});

	it("reduce una foto vertical conservando su proporción", () => {
		expect(fitWithin(3024, 4032)).toEqual({ width: 1440, height: 1920 });
	});

	it("no amplía imágenes pequeñas", () => {
		expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
	});
});
