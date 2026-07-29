export const IMAGE_TARGET_SIZE = 350_000;

export function needsServerOptimization(size: number) {
	return size > IMAGE_TARGET_SIZE;
}
