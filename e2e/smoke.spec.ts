import { expect, test } from '@playwright/test'

test('la home carga', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})
