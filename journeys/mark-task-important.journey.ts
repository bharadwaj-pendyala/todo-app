import { test } from '@playwright/test';

test('mark a task important', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  await page.getByTestId('star-renew-the-domain').click();
  await page.waitForTimeout(600);

  await page.getByTestId('star-task-a').click();
  await page.waitForTimeout(800);

  await page.reload();
  await page.waitForTimeout(800);

  await page.getByTestId('star-task-a').click();
  await page.waitForTimeout(600);

  await page.reload();
  await page.waitForTimeout(800);
});
