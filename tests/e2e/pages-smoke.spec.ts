import { test, expect, type Page } from '@playwright/test'
import { login } from './helpers'
import { PERSONEL_USER } from './fixtures'

function collectPageErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

test.describe('page smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, PERSONEL_USER)
  })

  test('dashboard loads without runtime errors', async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.goto('/dashboard')
    await expect(page.getByText('Hoş geldin,')).toBeVisible()
    await expect(page.getByText('Aylık Randevu Grafiği')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('calendar loads without runtime errors', async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.goto('/calendar')
    await expect(page.getByRole('link', { name: 'Ay', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ajanda', exact: true })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('reports loads without runtime errors', async ({ page }) => {
    const errors = collectPageErrors(page)
    await page.goto('/reports')
    await expect(page.getByText('En Aktif Kurumlar')).toBeVisible()
    await expect(page.getByText('Toplantı Süreleri')).toBeVisible()
    expect(errors).toEqual([])
  })
})
