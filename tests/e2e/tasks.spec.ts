import { test, expect } from '@playwright/test'
import { login, uniqueName } from './helpers'
import { PERSONEL_USER } from './fixtures'

test('task create, complete, and delete flow', async ({ page }) => {
  const taskTitle = uniqueName('E2E Görev')

  await login(page, PERSONEL_USER)
  await page.goto('/tasks')

  await page.getByRole('button', { name: '+ Yeni Görev' }).click()
  const createForm = page.locator('form', { has: page.getByPlaceholder('Görev başlığı') })
  await createForm.getByPlaceholder('Görev başlığı').fill(taskTitle)
  await createForm.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page.getByPlaceholder('Görev başlığı')).toBeHidden()

  // TaskItem's row div is two ancestors up from the title text node.
  const titleCell = page.getByText(taskTitle, { exact: true })
  await expect(titleCell).toBeVisible()
  const row = titleCell.locator('..').locator('..')

  await row.getByRole('checkbox').click()
  await expect(row.getByRole('checkbox')).toBeChecked()
  await expect(titleCell).toHaveCSS('text-decoration-line', 'line-through')

  page.once('dialog', (d) => d.accept())
  await row.getByRole('button', { name: 'Sil', exact: true }).click()
  await expect(page.getByText(taskTitle, { exact: true })).toHaveCount(0)
})
