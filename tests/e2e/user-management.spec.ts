import { test, expect } from '@playwright/test'
import { login } from './helpers'
import { ADMIN_USER } from './fixtures'

test('admin can create, change role, disable/enable, and delete a user', async ({ page }) => {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const fullName = `E2E Geçici Kullanıcı ${suffix}`
  const email = `e2e-temp-${suffix}@technoscope.test`

  await login(page, ADMIN_USER)
  await page.goto('/settings/users')

  await page.getByRole('button', { name: '+ Yeni Kullanıcı' }).click()
  const createForm = page.locator('form', { has: page.getByPlaceholder('Ad Soyad') })
  await createForm.getByPlaceholder('Ad Soyad').fill(fullName)
  await createForm.getByPlaceholder('E-posta').fill(email)
  await createForm.getByPlaceholder('Geçici şifre (en az 6 karakter)').fill('E2eTempPass!26')
  await createForm.locator('select[name="role"]').selectOption('personel')
  await createForm.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByPlaceholder('Ad Soyad')).toBeHidden()

  const nameCell = page.getByText(fullName, { exact: true })
  await expect(nameCell).toBeVisible()
  const row = nameCell.locator('..').locator('..')

  // Change role.
  await row.locator('select[name="role"]').selectOption('yonetici')
  await expect(row.locator('select[name="role"]')).toHaveValue('yonetici')

  // Disable, then re-enable. The "Devre dışı" badge must be matched with
  // exact:true — the "Devre Dışı Bırak" button label case-insensitively
  // contains "devre dışı" as a substring too, so a loose match against it
  // would never reach a count of 0 regardless of the actual banned state.
  page.once('dialog', (d) => d.accept())
  await row.getByRole('button', { name: 'Devre Dışı Bırak' }).click()
  await expect(page.getByText('Kullanıcı devre dışı bırakıldı')).toBeVisible()
  await expect(row.getByText('Devre dışı', { exact: true })).toBeVisible()

  page.once('dialog', (d) => d.accept())
  await row.getByRole('button', { name: 'Etkinleştir' }).click()
  await expect(page.getByText('Kullanıcı etkinleştirildi')).toBeVisible()
  await expect(row.getByText('Devre dışı', { exact: true })).toHaveCount(0)

  // Delete.
  page.once('dialog', (d) => d.accept())
  await row.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText(fullName, { exact: true })).toHaveCount(0)
})
