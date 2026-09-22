import { test } from '@playwright/test';

test('important task label journey', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  const title = `Ship the launch email ${Date.now()}`;
  await page.getByLabel('Task title').fill(title);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(600);

  const row = page.locator('#tasks li').filter({ hasText: title });
  const importantCheckbox = row.getByRole('checkbox', { name: `Mark ${title} important` });

  await importantCheckbox.check();
  await page.waitForTimeout(800);

  await page.reload();
  await page.waitForTimeout(800);

  const reloadedRow = page.locator('#tasks li').filter({ hasText: title });
  const reloadedImportantCheckbox = reloadedRow.getByRole('checkbox', { name: `Mark ${title} important` });
  const reloadedDoneCheckbox = reloadedRow.getByRole('checkbox', { name: `Mark ${title} complete` });

  await reloadedDoneCheckbox.check();
  await page.waitForTimeout(800);

  await reloadedImportantCheckbox.uncheck();
  await page.waitForTimeout(800);
});
