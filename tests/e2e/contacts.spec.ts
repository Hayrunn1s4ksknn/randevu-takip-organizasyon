import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER } from './fixtures'

test('contact create, edit, and delete flow', async ({ page }) => {
  const contactName = uniqueName('E2E Kişi')
  const updatedPosition = 'Güncellenmiş Pozisyon'

  await login(page, PERSONEL_USER)
  await page.goto('/contacts')

  await page.getByRole('button', { name: '+ Yeni Kişi' }).click()
  const createForm = page.locator('form', { has: page.getByPlaceholder('Ad Soyad') })
  await createForm.getByPlaceholder('Ad Soyad').fill(contactName)
  await createForm.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByPlaceholder('Ad Soyad')).toBeHidden()

  const card = page.getByText(contactName, { exact: true })
  await expect(card).toBeVisible()

  // Edit via the drawer.
  await card.click()
  await page.getByRole('button', { name: 'Düzenle' }).click()
  const editForm = page.locator('form', { has: page.getByPlaceholder('Pozisyon') })
  await editForm.getByPlaceholder('Pozisyon').fill(updatedPosition)
  await editForm.getByRole('button', { name: 'Kaydet' }).click()
  await expect(page.getByText(updatedPosition)).toBeVisible()

  // Delete via the drawer.
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText(contactName, { exact: true })).toHaveCount(0)
})
