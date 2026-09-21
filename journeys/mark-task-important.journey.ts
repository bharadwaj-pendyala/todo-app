import { test } from '@playwright/test';

test('mark a task important', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  const title = `Ship the launch email ${Date.now()}`;
  await page.getByLabel('Task title').fill(title);
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.waitForTimeout(600);

  const item = page.locator('li', { hasText: title });
  const star = item.getByRole('button');

  await star.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await star.click();
  await page.waitForTimeout(800);

  await page.reload();
  await page.waitForTimeout(800);
});
