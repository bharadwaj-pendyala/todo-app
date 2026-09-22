import { test, expect } from '@playwright/test';

test('the important flag can be toggled, is visually highlighted, and persists', async ({ page }) => {
  await page.goto('/');

  const title = `Important flag task ${Date.now()}`;
  await page.getByLabel('Task title').fill(title);
  await page.getByRole('button', { name: 'Add' }).click();

  const row = page.locator('#tasks li').filter({ hasText: title });
  await expect(row).toHaveCount(1);

  const importantCheckbox = row.getByRole('checkbox', { name: `Mark ${title} important` });

  await expect(importantCheckbox).not.toBeChecked();
  await expect(row).not.toHaveClass(/important/);

  await importantCheckbox.check();
  await expect(row).toHaveClass(/important/);

  await page.reload();

  const reloadedRow = page.locator('#tasks li').filter({ hasText: title });
  const reloadedImportantCheckbox = reloadedRow.getByRole('checkbox', { name: `Mark ${title} important` });
  await expect(reloadedImportantCheckbox).toBeChecked();
  await expect(reloadedRow).toHaveClass(/important/);

  await reloadedImportantCheckbox.uncheck();
  await expect(reloadedRow).not.toHaveClass(/important/);

  await page.reload();

  const finalRow = page.locator('#tasks li').filter({ hasText: title });
  const finalImportantCheckbox = finalRow.getByRole('checkbox', { name: `Mark ${title} important` });
  await expect(finalImportantCheckbox).not.toBeChecked();
  await expect(finalRow).not.toHaveClass(/important/);

  const finalDoneCheckbox = finalRow.getByRole('checkbox', { name: `Mark ${title} complete` });
  await expect(finalDoneCheckbox).not.toBeChecked();
  await finalDoneCheckbox.check();
  await expect(finalRow).toHaveClass(/done/);
  await expect(finalDoneCheckbox).toBeChecked();
});

test('the seeded tasks are still listed and the existing done toggle still works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeVisible();

  const taskBRow = page.locator('#tasks li').filter({ hasText: 'Task B' });
  const taskBDone = taskBRow.getByRole('checkbox', { name: 'Mark Task B complete' });
  await taskBDone.check();
  await page.reload();
  await expect(page.locator('#tasks li').filter({ hasText: 'Task B' }).getByRole('checkbox', { name: 'Mark Task B complete' })).toBeChecked();
});
