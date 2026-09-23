import { test } from '@playwright/test';

test('mark a task important', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  const title = `Star journey task ${Date.now()}`;
  await page.getByLabel('Task title').fill(title);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(600);

  const item = page.locator('li').filter({ hasText: title });
  const star = item.getByRole('button', { name: `Mark ${title} important` });

  await star.click();
  await page.waitForTimeout(600);

  await page.reload();
  await page.waitForTimeout(800);

  await star.click();
  await page.waitForTimeout(600);

  await page.reload();
  await page.waitForTimeout(800);
});
