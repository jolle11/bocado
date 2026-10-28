interface Bucket {
	count: number;
	resetAt: number;
}

/** Limitador en memoria por clave (IP, usuario...). Suficiente para una única instancia. */
export function createRateLimiter({
	limit,
	windowMs,
}: {
	limit: number;
	windowMs: number;
}) {
	const buckets = new Map<string, Bucket>();

	return function isAllowed(key: string, now = Date.now()) {
		const bucket = buckets.get(key);
		if (!bucket || bucket.resetAt <= now) {
			if (buckets.size > 10_000) {
				for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
			}
			buckets.set(key, { count: 1, resetAt: now + windowMs });
			return true;
		}
		bucket.count += 1;
		return bucket.count <= limit;
	};
}

export function clientIp(request: Request) {
	return (
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip") ||
		"unknown"
	);
}
