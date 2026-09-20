import { test } from '@playwright/test';

test('mark important and filter', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(800);

  await page.getByRole('button', { name: 'Toggle important for Task A' }).click();
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Toggle important for Renew the domain' }).click();
  await page.waitForTimeout(900);

  await page.getByLabel('Show important only').check();
  await page.waitForTimeout(1200);

  await page.getByLabel('Show important only').uncheck();
  await page.waitForTimeout(1000);

  await page.getByRole('checkbox', { name: 'Mark Task A complete' }).check();
  await page.waitForTimeout(900);

  await page.reload();
  await page.waitForTimeout(1200);

  await page.getByRole('checkbox', { name: 'Mark Task A complete' }).uncheck();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Toggle important for Task A' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Toggle important for Renew the domain' }).click();
  await page.waitForTimeout(800);
});
