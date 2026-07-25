import { expect, test } from "@playwright/test";

const email = `e2e-${Date.now()}@test.local`;
const password = "supersegura123";

test("registro, añadir comida y compartir", async ({ page }) => {
	await page.goto("/register");
	await page.waitForLoadState("networkidle");
	await page.getByLabel("Nombre").fill("E2E");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Contraseña").fill(password);
	await page.getByRole("button", { name: "Crear cuenta" }).click();

	await expect(page.getByText("Hola, E2E")).toBeVisible();

	await page.getByRole("link", { name: "Añadir comida" }).first().click();
	await page.getByLabel("¿Qué has comido?").fill("Tostada con aguacate");
	await page.getByRole("button", { name: "Guardar comida" }).click();

	await expect(page.getByText("Tostada con aguacate")).toBeVisible();

	await page.getByRole("link", { name: "Ajustes" }).click();
	await page
		.getByRole("button", { name: "Crear enlace para compartir" })
		.click();
	const shareCode = page.locator("code", { hasText: "/share/" });
	await expect(shareCode).toBeVisible();
	const token = (await shareCode.innerText())
		.replace("/share/", "")
		.trim();

	await page.goto(`/share/${token}`);
	await expect(page.getByText("Diario de E2E")).toBeVisible();
	await expect(page.getByText("Tostada con aguacate")).toBeVisible();
});
