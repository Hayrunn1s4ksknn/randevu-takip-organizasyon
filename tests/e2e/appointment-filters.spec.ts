import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER } from './fixtures'

test('appointment list filters by search text, status, and organization', async ({ page }) => {
  test.slow()

  const orgName = uniqueName('E2E Filtre Kurum')
  const titleA = uniqueName('E2E Filtre Randevu A')
  const titleB = uniqueName('E2E Filtre Randevu B')
  const todayISO = new Date().toISOString().slice(0, 10)

  await login(page, PERSONEL_USER)

  // Organization for appointment A only.
  await page.goto('/organizations')
  await page.getByRole('button', { name: '+ Yeni Kurum' }).click()
  const orgForm = page.locator('form', { has: page.getByPlaceholder('Kurum Adı') })
  await orgForm.getByPlaceholder('Kurum Adı').fill(orgName)
  await orgForm.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByPlaceholder('Kurum Adı')).toBeHidden()

  // Appointment A: linked to the org, left in the default "Planlandı" status.
  await page.goto('/appointments')
  await page.getByRole('button', { name: '+ Yeni Randevu' }).click()
  let form = page.locator('form', { has: page.getByPlaceholder('Başlık') })
  await form.getByPlaceholder('Başlık').fill(titleA)
  await form.locator('select[name="org_id"]').selectOption({ label: orgName })
  await form.locator('input[name="date"]').fill(todayISO)
  await form.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByPlaceholder('Başlık')).toBeHidden()

  // Appointment B: no org, marked completed via the bulk action.
  await page.getByRole('button', { name: '+ Yeni Randevu' }).click()
  form = page.locator('form', { has: page.getByPlaceholder('Başlık') })
  await form.getByPlaceholder('Başlık').fill(titleB)
  await form.locator('input[name="date"]').fill(todayISO)
  await form.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByPlaceholder('Başlık')).toBeHidden()

  const rowB = page.getByText(titleB, { exact: true }).first().locator('..')
  await rowB.locator('input[type="checkbox"]').click()
  await page.getByRole('button', { name: 'Tamamlandı yap' }).click()
  await expect(
    page.getByText('Seçili randevular tamamlandı olarak işaretlendi', { exact: true })
  ).toBeVisible()

  // Search text narrows to A only.
  await page.getByPlaceholder('Randevu başlığı ara...').fill(titleA)
  await page.waitForURL((url) => url.searchParams.get('q') === titleA)
  await expect(page.getByText(titleA, { exact: true }).first()).toBeVisible()
  await expect(page.getByText(titleB, { exact: true })).toHaveCount(0)
  await page.getByPlaceholder('Randevu başlığı ara...').fill('')
  await page.waitForURL((url) => !url.searchParams.get('q'))

  // Status filter narrows to B only.
  await page.locator('select[name="status"]').selectOption('Tamamlandı')
  await page.waitForURL((url) => url.searchParams.get('status') === 'Tamamlandı')
  await expect(page.getByText(titleB, { exact: true }).first()).toBeVisible()
  await expect(page.getByText(titleA, { exact: true })).toHaveCount(0)
  await page.locator('select[name="status"]').selectOption('all')
  await page.waitForURL((url) => !url.searchParams.get('status') || url.searchParams.get('status') === 'all')

  // Org filter narrows to A only.
  await page.locator('select[name="org"]').selectOption({ label: orgName })
  await page.waitForURL((url) => !!url.searchParams.get('org'))
  await expect(page.getByText(titleA, { exact: true }).first()).toBeVisible()
  await expect(page.getByText(titleB, { exact: true })).toHaveCount(0)
  await page.locator('select[name="org"]').selectOption('all')

  // Clean up.
  await page.goto('/appointments')
  for (const title of [titleA, titleB]) {
    page.once('dialog', (d) => d.accept())
    await page.getByText(title, { exact: true }).first().click()
    await page.getByTitle('Randevuyu sil').click()
    await expect(page.getByText('Randevu silindi', { exact: true })).toBeVisible()
  }

  await page.goto('/organizations')
  page.once('dialog', (d) => d.accept())
  await page.getByText(orgName, { exact: true }).click()
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText('Kurum silindi', { exact: true })).toBeVisible()
  await expect(page.getByText(orgName, { exact: true })).toHaveCount(0)
})
