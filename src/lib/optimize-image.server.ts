import sharp from "sharp";
import {
	IMAGE_TARGET_SIZE,
	needsServerOptimization,
} from "./image-optimization";

export { IMAGE_TARGET_SIZE, needsServerOptimization };

const SERVER_ENCODINGS = [
	{ maxDimension: 1920, quality: 80 },
	{ maxDimension: 1920, quality: 70 },
	{ maxDimension: 1600, quality: 72 },
	{ maxDimension: 1280, quality: 68 },
	{ maxDimension: 1024, quality: 62 },
	{ maxDimension: 800, quality: 58 },
] as const;

export async function optimizeImageOnServer(input: Buffer) {
	let smallest: Buffer | undefined;

	for (const encoding of SERVER_ENCODINGS) {
		const output = await sharp(input, { failOn: "error" })
			.rotate()
			.resize({
				width: encoding.maxDimension,
				height: encoding.maxDimension,
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({
				quality: encoding.quality,
				effort: 4,
			})
			.toBuffer();

		if (!smallest || output.length < smallest.length) smallest = output;
		if (output.length <= IMAGE_TARGET_SIZE) return output;
	}

	if (!smallest || smallest.length > IMAGE_TARGET_SIZE) {
		throw new Error("Image could not be optimized below the storage limit");
	}
	return smallest;
}
