import { test, expect, type Browser } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { ADMIN_USER, PERSONEL_USER, MISAFIR_USER } from './fixtures'

async function openAppointmentDrawer(
  browser: Browser,
  user: { email: string; password: string },
  title: string
) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await login(page, user)
  await page.goto('/appointments')
  await page.getByText(title, { exact: true }).first().click()
  return { context, page }
}

test('only admin/yönetici/personel see the appointment delete button, not misafir', async ({ browser }) => {
  const apptTitle = uniqueName('E2E Yetki Randevu')
  const todayISO = new Date().toISOString().slice(0, 10)

  // Admin creates a throwaway appointment (no organization needed for this check).
  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await login(adminPage, ADMIN_USER)
  await adminPage.goto('/appointments')
  await adminPage.getByRole('button', { name: '+ Yeni Randevu' }).click()
  const createForm = adminPage.locator('form', { has: adminPage.getByPlaceholder('Başlık') })
  await createForm.getByPlaceholder('Başlık').fill(apptTitle)
  await createForm.locator('input[name="date"]').fill(todayISO)
  await createForm.getByRole('button', { name: 'Oluştur' }).click()
  await expect(adminPage.getByPlaceholder('Başlık')).toBeHidden()

  const { context: personelContext, page: personelPage } = await openAppointmentDrawer(
    browser,
    PERSONEL_USER,
    apptTitle
  )
  await expect(personelPage.getByTitle('Randevuyu sil')).toBeVisible()
  await personelContext.close()

  const { context: misafirContext, page: misafirPage } = await openAppointmentDrawer(
    browser,
    MISAFIR_USER,
    apptTitle
  )
  await expect(misafirPage.getByTitle('Randevuyu sil')).toHaveCount(0)
  await misafirContext.close()

  // Clean up using the admin session, which is still open.
  await adminPage.getByText(apptTitle, { exact: true }).first().click()
  adminPage.once('dialog', (d) => d.accept())
  await adminPage.getByTitle('Randevuyu sil').click()
  await expect(adminPage.getByText(apptTitle, { exact: true })).toHaveCount(0)
  await adminContext.close()
})
