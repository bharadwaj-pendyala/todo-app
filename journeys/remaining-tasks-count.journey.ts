import { test } from '@playwright/test';

test('remaining tasks count updates live', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  await page.getByLabel('Task title').fill('Buy milk');
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(600);

  await page.getByRole('checkbox', { name: 'Mark Buy milk complete' }).check();
  await page.waitForTimeout(800);
});
