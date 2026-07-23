import { test, expect } from '@playwright/test'

test('unauthenticated visitor is redirected to the login page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Giriş yap' })).toBeVisible()
  await expect(page.getByLabel('E-posta')).toBeVisible()
  await expect(page.getByLabel('Şifre')).toBeVisible()
})

test('shows a validation error for wrong credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-posta').fill('nobody@example.com')
  await page.getByLabel('Şifre').fill('wrong-password')
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await expect(page.getByText('E-posta veya şifre hatalı.')).toBeVisible()
})
