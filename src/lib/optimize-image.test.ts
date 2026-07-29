import { describe, expect, it, vi } from "vitest";
import {
	encodeCanvasForUpload,
	fitWithin,
	IMAGE_TARGET_SIZE,
} from "./optimize-image";

describe("fitWithin", () => {
	it("reduce una foto horizontal conservando su proporción", () => {
		expect(fitWithin(4032, 3024)).toEqual({ width: 1600, height: 1200 });
	});

	it("reduce una foto vertical conservando su proporción", () => {
		expect(fitWithin(3024, 4032)).toEqual({ width: 1200, height: 1600 });
	});

	it("no amplía imágenes pequeñas", () => {
		expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
	});
});

describe("encodeCanvasForUpload", () => {
	it("usa JPEG cuando WebKit devuelve PNG al solicitar WebP", async () => {
		const webkitCanvas = {
			toBlob: vi.fn(
				(callback: BlobCallback, type?: string, _quality?: number) => {
					const result =
						type === "image/webp"
							? new Blob(["x".repeat(900_000)], { type: "image/png" })
							: new Blob(["x".repeat(300_000)], { type: "image/jpeg" });
					callback(result);
				},
			),
		} as unknown as HTMLCanvasElement;

		const encoded = await encodeCanvasForUpload(webkitCanvas);

		expect(encoded?.type).toBe("image/jpeg");
		expect(encoded?.size).toBeLessThanOrEqual(IMAGE_TARGET_SIZE);
	});

	it("conserva WebP cuando el navegador lo produce correctamente", async () => {
		const chromiumCanvas = {
			toBlob: vi.fn((callback: BlobCallback, type?: string) => {
				callback(new Blob(["x".repeat(300_000)], { type }));
			}),
		} as unknown as HTMLCanvasElement;

		const encoded = await encodeCanvasForUpload(chromiumCanvas);

		expect(encoded?.type).toBe("image/webp");
		expect(chromiumCanvas.toBlob).toHaveBeenCalledTimes(1);
	});
});
