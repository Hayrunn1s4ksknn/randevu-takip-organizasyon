import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER } from './fixtures'

test('global search finds an organization and opens its drawer', async ({ page }) => {
  const orgName = uniqueName('E2E Arama Kurum')

  await login(page, PERSONEL_USER)

  // Create a throwaway organization so there's a known, unique record to
  // search for (staging is shared across specs, so we can't rely on
  // pre-existing data being stable).
  await page.goto('/organizations')
  await page.getByRole('button', { name: '+ Yeni Kurum' }).click()
  const createForm = page.locator('form', { has: page.getByPlaceholder('Kurum Adı') })
  await createForm.getByPlaceholder('Kurum Adı').fill(orgName)
  await createForm.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByPlaceholder('Kurum Adı')).toBeHidden()

  await page.getByRole('button', { name: 'Ara...' }).click()
  // Wait for the actual /api/search response tied to this query, not just
  // the result text becoming visible — there's a brief loading-state render
  // ("Sonuç bulunamadı") before the fetch resolves that can otherwise still
  // overlap the result row and intercept the click.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/search') && r.status() === 200),
    page.getByPlaceholder('Kişi, kurum veya randevu ara...').fill(orgName),
  ])

  // The search result renders the org name in a bare <span>, while the
  // (visually covered but still-present) organizations grid card behind the
  // modal renders it in a <div> — scope to the span to avoid ambiguity.
  const result = page.locator(`span:text-is("${orgName}")`)
  await expect(result).toBeVisible()
  await expect(page.getByText('Sonuç bulunamadı')).toHaveCount(0)
  await result.click()

  await expect(page).toHaveURL(/\/organizations/)
  // The drawer for the matched organization opens automatically.
  await expect(page.getByRole('button', { name: 'Düzenle' })).toBeVisible()

  // Clean up.
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText(orgName, { exact: true })).toHaveCount(0)
})
