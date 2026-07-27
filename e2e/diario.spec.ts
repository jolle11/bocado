import { expect, test } from "@playwright/test";

const password = "supersegura123";

test("registro, añadir comida y compartir", async ({ page }, testInfo) => {
	const email = `e2e-${testInfo.project.name}-${Date.now()}@test.local`;
	await page.goto("/register");
	await page.waitForLoadState("networkidle");
	await page.getByLabel("Nombre").fill("E2E");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Contraseña").fill(password);
	await page.getByRole("button", { name: "Crear cuenta" }).click();

	await expect(page.getByText("Hola, E2E")).toBeVisible();
	await page.reload();
	await expect(page).toHaveURL("/");
	await expect(page.getByText("Hola, E2E")).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Ocultar imágenes" }),
	).toBeVisible();
	await page.getByRole("button", { name: "Activar tema oscuro" }).click();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await page.getByRole("button", { name: "Activar tema claro" }).click();
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	const addMealLink = page
		.getByRole("link", { name: "Añadir comida" })
		.first();
	await expect
		.poll(async () => {
			const colors = await addMealLink.evaluate((element) => {
				const expected = document.createElement("span");
				expected.style.color = "var(--primary-foreground)";
				element.append(expected);
				const values = {
					actual: getComputedStyle(element).color,
					expected: getComputedStyle(expected).color,
				};
				expected.remove();
				return values;
			});
			return colors.actual === colors.expected;
		})
		.toBe(true);

	await addMealLink.click();
	await page.getByLabel("¿Qué has comido?").fill("Tostada con aguacate");
	await page.getByRole("button", { name: "Guardar comida" }).click();

	await expect(page.getByText("Tostada con aguacate")).toBeVisible();

	await page.getByRole("link", { name: "Editar comida" }).click();
	await page
		.getByLabel("¿Qué has comido?")
		.fill("Tostada con aguacate y tomate");
	await page.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(page.getByText("Tostada con aguacate y tomate")).toBeVisible();

	await page.getByRole("link", { name: "Diario" }).click();
	await page.getByRole("link", { name: "Semana" }).click();
	await expect(page.getByText("Tostada con aguacate y tomate")).toBeVisible();
	await page.getByRole("link", { name: "Calendario" }).click();
	await expect(page.getByText("Tostada con aguacate y tomate")).toBeVisible();

	await page.getByRole("link", { name: "Ajustes" }).click();
	const defaultThemeButton = page.getByRole("button", {
		name: "Predeterminado",
	});
	const themeButtons = page.getByRole("button", {
		name: /^(Predeterminado|Bosque|Atardecer|Lavanda)$/,
	});
	const themeButtonPositions = await themeButtons.evaluateAll((buttons) =>
		buttons.map((button) => {
			const { x, y } = button.getBoundingClientRect();
			return { x, y };
		}),
	);
	if ((page.viewportSize()?.width ?? 0) < 640) {
		expect(themeButtonPositions[0].y).toBe(themeButtonPositions[1].y);
		expect(themeButtonPositions[2].y).toBe(themeButtonPositions[3].y);
		expect(themeButtonPositions[2].y).toBeGreaterThan(
			themeButtonPositions[0].y,
		);
	} else {
		expect(new Set(themeButtonPositions.map(({ y }) => y)).size).toBe(1);
	}
	await expect
		.poll(() =>
			defaultThemeButton.evaluate(
				(button) => button.scrollWidth <= button.clientWidth,
			),
		)
		.toBe(true);
	await page.getByRole("button", { name: "Lavanda" }).click();
	await expect(page.locator("html")).toHaveClass(/theme-lavender/);
	await page.getByRole("button", { name: "Activar tema oscuro" }).click();
	await expect(page.locator("html")).toHaveClass(/theme-lavender/);
	await expect(page.locator("html")).toHaveClass(/dark/);
	await page.getByRole("button", { name: "Activar tema claro" }).click();
	await expect(page.locator("html")).toHaveClass(/theme-lavender/);
	await expect(page.locator("html")).not.toHaveClass(/dark/);
	await page
		.getByRole("button", { name: "Las fotos están visibles" })
		.click();
	await expect(
		page.getByRole("button", { name: "Las fotos están ocultas" }),
	).toBeVisible();
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
	await expect(page.getByText("Tostada con aguacate y tomate")).toBeVisible();
});

test("la navegación inferior queda por encima de los registros", async ({
	page,
}, testInfo) => {
	const email = `e2e-nav-${testInfo.project.name}-${Date.now()}@test.local`;
	await page.goto("/register");
	await page.getByLabel("Nombre").fill("E2E navegación");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Contraseña").fill(password);
	await page.getByRole("button", { name: "Crear cuenta" }).click();

	await page.getByRole("link", { name: "Añadir comida" }).first().click();
	await page.getByLabel("¿Qué has comido?").fill("Comida bajo la navegación");
	await page.getByRole("button", { name: "Guardar comida" }).click();
	await expect(page.getByText("Comida bajo la navegación")).toBeVisible();

	// The development-only TanStack launcher overlaps "Ajustes" on mobile.
	await page
		.getByRole("button", { name: "Open TanStack Devtools" })
		.evaluate((button) => button.remove());
	const bottomNavigationLinks = page.locator("nav").getByRole("link");
	await expect
		.poll(() =>
			bottomNavigationLinks.evaluateAll((links) =>
				links.every((link) => {
					const bounds = link.getBoundingClientRect();
					const hit = document.elementFromPoint(
						bounds.left + bounds.width / 2,
						bounds.top + bounds.height / 2,
					);
					return hit !== null && link.contains(hit);
				}),
			),
		)
		.toBe(true);
});
