import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppLoadingShell } from "./app-loading-shell";

describe("AppLoadingShell", () => {
	it("anuncia que la aplicación se está cargando", () => {
		render(<AppLoadingShell />);

		const status = screen.getByRole("status", {
			name: "Cargando aplicación",
		});
		expect(status.getAttribute("aria-busy")).toBe("true");
	});
});
