import path from 'path'
import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER, ADMIN_USER } from './fixtures'

const UPLOAD_FIXTURE = path.join(__dirname, 'fixtures', 'test-upload.txt')

test('appointment drawer: notes, comments, participants, meeting details, assigned-to, files', async ({
  page,
}) => {
  // This exercises far more sequential real round-trips (10+) than any
  // other single spec — the default 30s test timeout is tight for that many
  // real network hops to a remote staging DB.
  test.slow()

  const apptTitle = uniqueName('E2E Panel Randevu')
  const contactName = uniqueName('E2E Panel Kişi')
  const noteBody = uniqueName('E2E not')
  const commentBody = uniqueName('E2E yorum')
  const todayISO = new Date().toISOString().slice(0, 10)

  await login(page, PERSONEL_USER)

  // A contact to add as a participant later.
  await page.goto('/contacts')
  await page.getByRole('button', { name: '+ Yeni Kişi' }).click()
  const contactForm = page.locator('form', { has: page.getByPlaceholder('Ad Soyad') })
  await contactForm.getByPlaceholder('Ad Soyad').fill(contactName)
  await contactForm.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByPlaceholder('Ad Soyad')).toBeHidden()

  // A throwaway appointment to open in the drawer.
  await page.goto('/appointments')
  await page.getByRole('button', { name: '+ Yeni Randevu' }).click()
  const apptForm = page.locator('form', { has: page.getByPlaceholder('Başlık') })
  await apptForm.getByPlaceholder('Başlık').fill(apptTitle)
  await apptForm.locator('input[name="date"]').fill(todayISO)
  await apptForm.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByPlaceholder('Başlık')).toBeHidden()

  await page.getByText(apptTitle, { exact: true }).first().click()

  // Notes tab (open by default).
  await page.getByPlaceholder('Not ekle...').fill(noteBody)
  await page.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByText(noteBody)).toBeVisible()

  // Comments tab.
  await page.getByRole('button', { name: 'Yorumlar' }).click()
  await page.getByPlaceholder('Yorum ekle...').fill(commentBody)
  await page.getByRole('button', { name: 'Ekle' }).click()
  await expect(page.getByText(commentBody)).toBeVisible()

  // Participants tab. The underlying appointments page (still in the DOM
  // behind the drawer) also has a contact filter <select name="contact">,
  // so exclude named selects to isolate the drawer's own dropdown.
  await page.getByRole('button', { name: 'Katılımcılar' }).click()
  const participantSelect = page.locator('select:not([name])', {
    has: page.locator(`option:text-is("${contactName}")`),
  })
  await participantSelect.selectOption({ label: contactName })
  await page.getByRole('button', { name: 'Ekle' }).click()
  // Scope to the participant <span> specifically — the page underneath the
  // drawer still has a contact filter <option> with the same text.
  const participantSpan = page.locator(`span:text-is("${contactName}")`)
  await expect(participantSpan).toBeVisible()
  await page.getByRole('button', { name: 'Kaldır' }).click()
  await expect(participantSpan).toHaveCount(0)

  // Meeting type / duration and assigned-to editors live in the header,
  // outside the tabs, and update local state optimistically — close and
  // reopen the drawer afterward to prove the PATCH actually persisted
  // server-side rather than just changing what's on screen.
  const meetingTypeSelect = page.locator('select', {
    has: page.locator('option:text-is("Toplantı tipi yok")'),
  })
  // Neither save fires a toast, so synchronize on the network instead —
  // both handlers fire-and-forget with no await from the click handler.
  // A PATCH response alone isn't enough either: onChanged() calls
  // queryClient.invalidateQueries() *after* the PATCH resolves, which
  // triggers a background GET refetch — closing the drawer before that GET
  // lands leaves the query cache holding pre-save data, so a reopened
  // AssignedToEditor/MeetingDetailsEditor (which seed local state from
  // props only once, on mount) would read the stale cached value.
  async function waitForAppointmentRoundTrip(action: () => Promise<void>) {
    const patchWait = page.waitForResponse(
      (r) => r.url().includes('/api/appointments/') && r.request().method() === 'PATCH'
    )
    const getWait = page.waitForResponse(
      (r) => r.url().includes('/api/appointments/') && r.request().method() === 'GET'
    )
    await Promise.all([patchWait, action()])
    await getWait
  }

  await meetingTypeSelect.selectOption('Online')
  await page.getByPlaceholder('Süre (dk)').fill('45')
  await waitForAppointmentRoundTrip(() => page.getByRole('button', { name: 'Kaydet' }).click())

  const assignedSelect = page.locator('select', {
    has: page.locator('option:text-is("Sorumlu atanmadı")'),
  })
  await waitForAppointmentRoundTrip(() =>
    assignedSelect.selectOption({ label: ADMIN_USER.email }).then(() => {})
  )

  await page.getByRole('button', { name: '×' }).click()
  await page.getByText(apptTitle, { exact: true }).first().click()

  await expect(
    page.locator('select', { has: page.locator('option:text-is("Toplantı tipi yok")') })
  ).toHaveValue('Online')
  await expect(page.getByPlaceholder('Süre (dk)')).toHaveValue('45')
  const adminOptionValue = await getStaffOptionValue(page, ADMIN_USER.email)
  await expect(
    page.locator('select', { has: page.locator('option:text-is("Sorumlu atanmadı")') })
  ).toHaveValue(adminOptionValue ?? '')

  // Files tab: upload a real file, confirm it's listed, then delete it.
  await page.getByRole('button', { name: 'Dosyalar' }).click()
  await page.locator('input[type="file"]').setInputFiles(UPLOAD_FIXTURE)
  await expect(page.getByText('test-upload.txt')).toBeVisible()
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText('test-upload.txt')).toHaveCount(0)

  // Clean up. Wait for each completion toast before checking the list —
  // deletion runs through a startTransition(async () => {...}) chain
  // (delete -> close drawer -> toast -> router.refresh()), and checking the
  // list immediately can race ahead of the refresh landing.
  // "Randevu silindi" is a substring of the realtime broadcast toast "Bir
  // randevu silindi" (fired because this same user also receives their own
  // delete as a realtime event) — exact:true is required to isolate it.
  page.once('dialog', (d) => d.accept())
  await page.getByTitle('Randevuyu sil').click()
  await expect(page.getByText('Randevu silindi', { exact: true })).toBeVisible()
  // router.refresh() re-fetches the RSC payload for the current route; wait
  // for that to settle before asserting, so the check doesn't land mid-navigation.
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(apptTitle, { exact: true })).toHaveCount(0)

  await page.goto('/contacts')
  page.once('dialog', (d) => d.accept())
  await page.getByText(contactName, { exact: true }).click()
  await page.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText('Kişi silindi')).toBeVisible()
  await expect(page.getByText(contactName, { exact: true })).toHaveCount(0)
})

async function getStaffOptionValue(page: import('@playwright/test').Page, label: string) {
  const select = page.locator('select', { has: page.locator('option:text-is("Sorumlu atanmadı")') })
  const option = select.locator('option', { hasText: label })
  return option.getAttribute('value')
}
