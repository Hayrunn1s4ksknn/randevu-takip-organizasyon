import { test, expect } from '@playwright/test'
import { login } from './helpers'
import { PERSONEL_USER } from './fixtures'

// Regression coverage for a real bug found while building this feature:
// reading localStorage synchronously at zustand store creation caused a
// server/client hydration mismatch that Next.js explicitly does not patch
// up, so the saved "collapsed" preference silently never applied visually
// after a reload even though the correct value was in localStorage. The
// fix hydrates the real value from a useEffect (after mount) instead.
test('desktop sidebar collapses, expands, and remembers the choice across reload', async ({ page }) => {
  await login(page, PERSONEL_USER)
  await page.goto('/dashboard')

  const sidebar = page.locator('div[class*="md:translate-x-0"]')
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(248)

  await page.getByRole('button', { name: 'Kenar çubuğunu gizle' }).click()
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(0)

  // Persists collapsed across a full reload.
  await page.reload()
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(0)

  await page.getByRole('button', { name: 'Kenar çubuğunu göster' }).click()
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(248)

  // Persists open across a full reload too.
  await page.reload()
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(248)
})
