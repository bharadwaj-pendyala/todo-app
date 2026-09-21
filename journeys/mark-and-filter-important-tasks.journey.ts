import { test } from '@playwright/test';

test('mark and filter important tasks', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  await page.getByLabel('Task title').fill('Prepare quarterly report');
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(600);

  await page.getByRole('checkbox', { name: 'Mark Prepare quarterly report important' }).check();
  await page.waitForTimeout(600);

  await page.reload();
  await page.waitForTimeout(600);

  await page.getByRole('checkbox', { name: 'Show important only' }).check();
  await page.waitForTimeout(800);

  await page.getByRole('checkbox', { name: 'Mark Prepare quarterly report complete' }).check();
  await page.waitForTimeout(800);

  await page.getByRole('checkbox', { name: 'Show important only' }).uncheck();
  await page.waitForTimeout(800);
});
