import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER } from './fixtures'

test('appointment CRUD and postpone flow', async ({ page }) => {
  const orgName = uniqueName('E2E Kurum')
  const apptTitle = uniqueName('E2E Randevu')
  const todayISO = new Date().toISOString().slice(0, 10)

  await login(page, PERSONEL_USER)

  // Create an organization to attach the appointment to.
  await page.goto('/organizations')
  await page.getByRole('button', { name: '+ Yeni Kurum' }).click()
  await page.getByPlaceholder('Kurum Adı').fill(orgName)
  await page.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByPlaceholder('Kurum Adı')).toBeHidden()

  // Create an appointment linked to that organization.
  await page.goto('/appointments')
  await page.getByRole('button', { name: '+ Yeni Randevu' }).click()
  const createForm = page.locator('form', { has: page.getByPlaceholder('Başlık') })
  await createForm.getByPlaceholder('Başlık').fill(apptTitle)
  await createForm.locator('select[name="org_id"]').selectOption({ label: orgName })
  await createForm.locator('input[name="date"]').fill(todayISO)
  await createForm.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByPlaceholder('Başlık')).toBeHidden()

  // Both the desktop table and the (CSS-hidden at this viewport) mobile card
  // list render a matching text node, so scope to the first (desktop) match
  // to avoid a Playwright strict-mode ambiguity.
  const titleCell = page.getByText(apptTitle, { exact: true }).first()
  const row = titleCell.locator('..')
  await expect(titleCell).toBeVisible()

  // Select it and postpone to tomorrow.
  await row.locator('input[type="checkbox"]').click()
  await page.getByRole('button', { name: 'Ertele', exact: true }).click()
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const postponeForm = page.locator('form', { has: page.locator('input[name="newDate"]') })
  await postponeForm.locator('input[name="newDate"]').fill(tomorrow)
  await postponeForm.getByRole('button', { name: 'Ertele', exact: true }).click()

  await expect(titleCell).toBeVisible()
  await expect(row.getByText('Ertelendi')).toBeVisible()

  // Clean up: delete the appointment via its drawer, then the organization.
  page.once('dialog', (d) => d.accept())
  await titleCell.click()
  await page.getByTitle('Randevuyu sil').click()
  await expect(page.getByText(apptTitle, { exact: true })).toHaveCount(0)

  await page.goto('/organizations')
  page.once('dialog', (d) => d.accept())
  await page.getByText(orgName, { exact: true }).click()
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText(orgName, { exact: true })).toHaveCount(0)
})
