import { test, expect } from '@playwright/test'
import { login } from './helpers'
import { PERSONEL_USER } from './fixtures'

test.describe('export buttons trigger real file downloads', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, PERSONEL_USER)
  })

  test('appointments CSV export', async ({ page }) => {
    await page.goto('/appointments')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'CSV', exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^randevular_\d{4}-\d{2}-\d{2}\.csv$/)
  })

  test('appointments Excel export', async ({ page }) => {
    await page.goto('/appointments')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Excel', exact: true }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^randevular_\d{4}-\d{2}-\d{2}\.xlsx$/)
  })

  test('reports PDF export', async ({ page }) => {
    await page.goto('/reports')
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'PDF olarak indir' }).click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^rapor_\d{4}-\d{2}-\d{2}\.pdf$/)
  })
})
