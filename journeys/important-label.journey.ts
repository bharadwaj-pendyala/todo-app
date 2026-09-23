import { test } from '@playwright/test';

test('marking a task important', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  const taskItem = page.locator('li', { has: page.getByText('Task A', { exact: true }) });
  const starButton = taskItem.getByRole('button', { name: 'Mark Task A important' });

  await starButton.click();
  await page.waitForTimeout(800);

  await page.reload();
  await page.waitForTimeout(800);

  await starButton.click();
  await page.waitForTimeout(600);
});
