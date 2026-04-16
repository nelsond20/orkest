import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function resetApp(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.goto('/')
}

test('load template and run workflow to success', async ({ page }) => {
  await resetApp(page)

  await page.getByTestId('template-picker-button').click()
  await page.getByTestId('template-option-high-value-order').click()

  await expect(page).toHaveURL(/\/editor\//)
  await page.getByTestId('run-workflow-button').click()

  await expect(page).toHaveURL(/\/runs\//)
  await page.getByTestId('start-auto-mode-button').click()

  await expect.poll(async () => (await page.getByTestId('run-status-text').textContent()) ?? '').toContain('success')
  await expect.poll(async () => page.locator('[data-testid="step-log-item"][data-status="succeeded"]').count()).toBeGreaterThan(0)
  await expect(page.locator('[data-testid="step-log-item"][data-status="failed"]')).toHaveCount(0)
})

test('create invalid workflow and show inline validation errors', async ({ page }) => {
  await resetApp(page)

  await page.getByTestId('create-workflow-button').click()
  await expect(page).toHaveURL(/\/editor\//)

  await page.getByTestId('palette-node-action').click()
  await page.getByTestId('validate-workflow-button').click()

  await expect(page.locator('.node-error')).toHaveCount(1)
})

test('json roundtrip preserves canvas node count', async ({ page }) => {
  await resetApp(page)

  await page.getByTestId('template-picker-button').click()
  await page.getByTestId('template-option-appointment-confirmation').click()

  await expect(page).toHaveURL(/\/editor\//)

  const beforeCount = await page.locator('.react-flow__node').count()

  await page.getByTestId('tab-json-button').click()
  const jsonEditor = page.getByTestId('json-editor-textarea')
  await expect(jsonEditor).toBeVisible()

  const currentJson = await jsonEditor.inputValue()
  await jsonEditor.fill(currentJson)
  await page.getByTestId('apply-json-button').click()

  await page.getByTestId('tab-canvas-button').click()
  await expect(page.locator('.react-flow__node')).toHaveCount(beforeCount)
})
