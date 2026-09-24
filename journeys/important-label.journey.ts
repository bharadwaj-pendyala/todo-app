import { test, expect } from '@playwright/test';

test('marking a task important', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  const taskItem = page.locator('li', { has: page.getByText('Task A', { exact: true }) });
  const starButton = taskItem.getByRole('button', { name: 'Mark Task A important' });

  await expect(taskItem).not.toHaveClass(/important/);
  await expect(starButton).toHaveAttribute('aria-pressed', 'false');

  await starButton.click();
  await page.waitForTimeout(800);

  await expect(taskItem).toHaveClass(/important/);
  await expect(starButton).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await page.waitForTimeout(800);

  const reloadedItem = page.locator('li', { has: page.getByText('Task A', { exact: true }) });
  const reloadedStar = reloadedItem.getByRole('button', { name: 'Mark Task A important' });

  await expect(reloadedItem).toHaveClass(/important/);
  await expect(reloadedStar).toHaveAttribute('aria-pressed', 'true');

  await reloadedStar.click();
  await page.waitForTimeout(600);

  await expect(reloadedItem).not.toHaveClass(/important/);
  await expect(reloadedStar).toHaveAttribute('aria-pressed', 'false');
});
