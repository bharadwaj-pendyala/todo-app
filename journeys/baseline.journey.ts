import { test } from '@playwright/test';

test('baseline task list', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);
  await page.getByRole('checkbox', { name: 'Mark Task B complete' }).check();
  await page.waitForTimeout(600);
  await page.reload();
  await page.waitForTimeout(800);
});
