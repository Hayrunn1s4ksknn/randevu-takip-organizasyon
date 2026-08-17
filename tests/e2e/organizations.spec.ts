import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER } from './fixtures'

test('organization create, edit, and delete flow', async ({ page }) => {
  const orgName = uniqueName('E2E Kurum')
  const updatedSector = 'Güncellenmiş Sektör'

  await login(page, PERSONEL_USER)
  await page.goto('/organizations')

  await page.getByRole('button', { name: '+ Yeni Kurum' }).click()
  const createForm = page.locator('form', { has: page.getByPlaceholder('Kurum Adı') })
  await createForm.getByPlaceholder('Kurum Adı').fill(orgName)
  await createForm.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByPlaceholder('Kurum Adı')).toBeHidden()

  const card = page.getByText(orgName, { exact: true })
  await expect(card).toBeVisible()

  // Edit via the drawer.
  await card.click()
  await page.getByRole('button', { name: 'Düzenle' }).click()
  const editForm = page.locator('form', { has: page.getByPlaceholder('Sektör') })
  await editForm.getByPlaceholder('Sektör').fill(updatedSector)
  await editForm.getByRole('button', { name: 'Kaydet' }).click()
  await expect(page.getByText(updatedSector)).toBeVisible()

  // Delete via the drawer.
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText(orgName, { exact: true })).toHaveCount(0)
})
