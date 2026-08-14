import { test, expect } from '@playwright/test'
import { login } from './helpers'
import { PERSONEL_USER } from './fixtures'

// Regression test for a real bug: a Tailwind v4 change silently broke the
// translate-x-full / translate-x-0 toggle on the mobile sidebar, so the
// hamburger button appeared to do nothing. This pins the actual on-screen
// position of the sidebar (not just DOM visibility, which transform-based
// hiding doesn't affect) before and after opening it.
test.use({ viewport: { width: 390, height: 844 } })

test('mobile hamburger menu slides the sidebar into view and navigates', async ({ page }) => {
  await login(page, PERSONEL_USER)
  await page.goto('/dashboard')

  // The sidebar is the only element carrying this translate utility combo;
  // there's no stable data-testid on it, so match on the class instead of a
  // brittle DOM-position guess (both the sidebar and the bottom nav render a
  // "Randevular" link, so scoping matters for the click below too).
  const sidebar = page.locator('div[class*="md:translate-x-0"]')

  const closedBox = await sidebar.boundingBox()
  expect(closedBox).not.toBeNull()
  expect(closedBox!.x).toBeLessThan(-50)

  await page.getByRole('button', { name: 'Menü', exact: true }).click()

  // The slide is an animated CSS transition (duration-200), so poll rather
  // than reading boundingBox() once immediately after the click.
  await expect.poll(async () => (await sidebar.boundingBox())?.x).toBeGreaterThanOrEqual(-1)
  await expect.poll(async () => (await sidebar.boundingBox())?.x).toBeLessThanOrEqual(1)

  await sidebar.getByRole('link', { name: 'Randevular' }).click()
  await expect(page).toHaveURL(/\/appointments/)

  // Navigating closes the mobile nav (closeMobileNav fires on link click).
  await expect.poll(async () => (await sidebar.boundingBox())?.x).toBeLessThan(-50)
})
