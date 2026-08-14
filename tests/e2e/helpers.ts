import type { Page } from '@playwright/test'

export async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/login')
  await page.getByLabel('E-posta').fill(user.email)
  await page.getByLabel('Şifre').fill(user.password)
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await page.waitForURL(/\/dashboard/)
}

// Every test run needs its own organization/appointment names — staging is a
// shared, persistent database (not reset between runs), so fixed names would
// collide across parallel workers and repeated runs.
export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 10000)}`
}
