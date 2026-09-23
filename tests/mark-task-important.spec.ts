import { test, expect } from '@playwright/test';

test('marking a task important persists across reloads', async ({ page }) => {
  await page.goto('/');

  const title = `Star test task ${Date.now()}`;
  await page.getByLabel('Task title').fill(title);
  await page.getByRole('button', { name: 'Add' }).click();

  const item = page.locator('li').filter({ hasText: title });
  await expect(item).toBeVisible();

  const star = item.getByRole('button', { name: `Mark ${title} important` });
  await expect(star).toHaveAttribute('aria-pressed', 'false');

  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  const reloadedItem = page.locator('li').filter({ hasText: title });
  const reloadedStar = reloadedItem.getByRole('button', { name: `Mark ${title} important` });
  await expect(reloadedStar).toHaveAttribute('aria-pressed', 'true');

  await reloadedStar.click();
  await expect(reloadedStar).toHaveAttribute('aria-pressed', 'false');

  await page.reload();
  const finalItem = page.locator('li').filter({ hasText: title });
  const finalStar = finalItem.getByRole('button', { name: `Mark ${title} important` });
  await expect(finalStar).toHaveAttribute('aria-pressed', 'false');

  const checkbox = finalItem.getByRole('checkbox', { name: `Mark ${title} complete` });
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await expect(finalItem).toHaveClass(/done/);
  await expect(finalStar).toHaveAttribute('aria-pressed', 'false');
});
