import { test, expect } from '@playwright/test';

test('the seeded tasks are listed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeVisible();
});

test('completing a task survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('checkbox', { name: 'Mark Task B complete' }).check();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Mark Task B complete' })).toBeChecked();
});
