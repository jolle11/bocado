const MAX_DIMENSION = 1920;
const TARGET_SIZE = 1_500_000;
const WEBP_QUALITIES = [0.82, 0.72, 0.62];

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

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
	return new Promise<Blob | null>((resolve) => {
		canvas.toBlob(resolve, "image/webp", quality);
	});
}

/**
 * Reduces photos before uploading them. Unsupported formats are returned
 * unchanged, so selecting a photo never fails just because it cannot be decoded.
 */
export async function optimizeImage(file: File): Promise<File> {
	if (
		!file.type.startsWith("image/") ||
		file.type === "image/gif" ||
		file.type === "image/svg+xml"
	) {
		return file;
	}

	let bitmap: ImageBitmap | undefined;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
		const size = fitWithin(bitmap.width, bitmap.height);
		const canvas = document.createElement("canvas");
		canvas.width = size.width;
		canvas.height = size.height;

		const context = canvas.getContext("2d");
		if (!context) return file;
		context.drawImage(bitmap, 0, 0, size.width, size.height);

		let optimized: Blob | null = null;
		for (const quality of WEBP_QUALITIES) {
			optimized = await canvasToBlob(canvas, quality);
			if (!optimized || optimized.size <= TARGET_SIZE) break;
		}

		if (!optimized || optimized.size >= file.size) return file;

		const baseName = file.name.replace(/\.[^.]+$/, "");
		return new File([optimized], `${baseName}.webp`, {
			type: optimized.type,
			lastModified: file.lastModified,
		});
	} catch {
		return file;
	} finally {
		bitmap?.close();
	}
}
