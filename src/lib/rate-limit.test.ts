import { describe, expect, it } from "vitest";
import { clientIp, createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
	it("bloquea al superar el límite y se reinicia tras la ventana", () => {
		const isAllowed = createRateLimiter({ limit: 2, windowMs: 1000 });
		expect(isAllowed("ip", 0)).toBe(true);
		expect(isAllowed("ip", 10)).toBe(true);
		expect(isAllowed("ip", 20)).toBe(false);
		expect(isAllowed("otra", 20)).toBe(true);
		expect(isAllowed("ip", 1001)).toBe(true);
	});

	it("usa la primera IP de x-forwarded-for", () => {
		const request = new Request("https://bocado.test", {
			headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
		});
		expect(clientIp(request)).toBe("1.2.3.4");
	});
});
