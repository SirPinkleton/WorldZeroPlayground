import { test, expect } from '@playwright/test'

// Run logged OUT — drop the shared auth state from the setup project.
test.use({ storageState: { cookies: [], origins: [] } })

test('marketing home renders for a guest', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /sign up here/i })).toBeVisible()
})

test('the dev-login button logs a bot in', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /dev login/i }).click()
  // Once authed, `/` swaps from the marketing Home to the FieldDesk.
  await expect(page.getByRole('button', { name: /sign up here/i })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: /whose shoes today/i })).toBeVisible()
})
