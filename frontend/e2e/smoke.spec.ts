import { test, expect } from '@playwright/test'

// These run authenticated via the saved bot-login state (see playwright.config.ts).

test('authed root shows the FieldDesk, not the marketing Home', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /whose shoes today/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /sign up here/i })).toHaveCount(0)
})

test('leaderboard loads', async ({ page }) => {
  await page.goto('/leaderboard')
  await expect(page.getByRole('heading', { name: /players/i })).toBeVisible()
})

test('tasks list loads', async ({ page }) => {
  await page.goto('/tasks')
  await expect(page.getByRole('heading', { name: /^tasks$/i })).toBeVisible()
})

test('factions page loads', async ({ page }) => {
  await page.goto('/factions')
  await expect(page.getByRole('heading', { name: /^factions$/i })).toBeVisible()
})

test('no uncaught console errors on the leaderboard', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto('/leaderboard')
  await expect(page.getByRole('heading', { name: /players/i })).toBeVisible()
  expect(errors, errors.join('\n')).toHaveLength(0)
})
