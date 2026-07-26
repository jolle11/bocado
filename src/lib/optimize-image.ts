import { IMAGE_TARGET_SIZE } from "./image-optimization";

export { IMAGE_TARGET_SIZE };

const MAX_DIMENSION = 1920;

const QUALITIES = [0.82, 0.72, 0.62];
const SCALE_STEPS = [1, 0.85, 0.7, 0.55];

type DecodedImage = {
	source: CanvasImageSource;
	width: number;
	height: number;
	close: () => void;
};

export function fitWithin(
	width: number,
	height: number,
	maxDimension = MAX_DIMENSION,
) {
	const scale = Math.min(1, maxDimension / Math.max(width, height));
	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale),
	};
}

function canvasToBlob(
	canvas: HTMLCanvasElement,
	type: "image/webp" | "image/jpeg",
	quality: number,
) {
	return new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, type, quality);
	});
}

export async function encodeCanvasForUpload(canvas: HTMLCanvasElement) {
	let smallest: Blob | null = null;

	for (const type of ["image/webp", "image/jpeg"] as const) {
		for (const quality of QUALITIES) {
			const encoded = await canvasToBlob(canvas, type, quality);

			// WebKit can silently return PNG when WebP encoding is unsupported.
			if (!encoded || encoded.type !== type) break;
			if (!smallest || encoded.size < smallest.size) smallest = encoded;
			if (encoded.size <= IMAGE_TARGET_SIZE) return encoded;
		}
	}

	return smallest;
}

async function decodeWithImageElement(file: File): Promise<DecodedImage> {
	const objectUrl = URL.createObjectURL(file);
	const image = new Image();

	try {
		await new Promise<void>((resolve, reject) => {
			image.onload = () => resolve();
			image.onerror = () => reject(new Error("Image could not be decoded"));
			image.src = objectUrl;
		});

		return {
			source: image,
			width: image.naturalWidth,
			height: image.naturalHeight,
			close: () => URL.revokeObjectURL(objectUrl),
		};
	} catch (error) {
		URL.revokeObjectURL(objectUrl);
		throw error;
	}
}

async function decodeImage(file: File): Promise<DecodedImage> {
	if (typeof createImageBitmap === "function") {
		try {
			// Omitting imageOrientation works across old and new WebKit. Modern
			// browsers apply the image's EXIF orientation by default.
			const bitmap = await createImageBitmap(file);
			return {
				source: bitmap,
				width: bitmap.width,
				height: bitmap.height,
				close: () => bitmap.close(),
			};
		} catch {
			// Image elements decode more iOS camera formats than ImageBitmap.
		}
	}

	return decodeWithImageElement(file);
}

/**
 * Reduces photos before uploading them. If the browser cannot decode a camera
 * format, the original is returned and the server-side safeguard processes it.
 */
export async function optimizeImage(file: File): Promise<File> {
	if (
		!file.type.startsWith("image/") ||
		file.type === "image/gif" ||
		file.type === "image/svg+xml" ||
		file.size <= IMAGE_TARGET_SIZE
	) {
		return file;
	}

	let decoded: DecodedImage | undefined;
	try {
		decoded = await decodeImage(file);
		const fitted = fitWithin(decoded.width, decoded.height);
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		if (!context) return file;

		let optimized: Blob | null = null;
		for (const scale of SCALE_STEPS) {
			canvas.width = Math.max(1, Math.round(fitted.width * scale));
			canvas.height = Math.max(1, Math.round(fitted.height * scale));
			context.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);

			const candidate = await encodeCanvasForUpload(canvas);
			if (candidate && (!optimized || candidate.size < optimized.size)) {
				optimized = candidate;
			}
			if (optimized && optimized.size <= IMAGE_TARGET_SIZE) break;
		}

		if (!optimized || optimized.size >= file.size) return file;

		const baseName = file.name.replace(/\.[^.]+$/, "");
		const extension = optimized.type === "image/webp" ? "webp" : "jpg";
		return new File([optimized], `${baseName}.${extension}`, {
			type: optimized.type,
			lastModified: file.lastModified,
		});
	} catch {
		return file;
	} finally {
		decoded?.close();
	}
}
