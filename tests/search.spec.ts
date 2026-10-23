import { test, expect } from '@playwright/test';

test('typing a query hides tasks whose title does not match', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('task');
  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeVisible();
  await expect(page.getByText('Renew the domain')).toBeHidden();
});

test('the search ignores case', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('RENEW');
  await expect(page.getByRole('listitem')).toHaveText(['Renew the domain']);
});

test('clearing the search shows every task again', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Search tasks' });
  await search.fill('renew');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await search.fill('');
  await expect(page.getByRole('listitem')).toHaveCount(3);
});

test('the filter still applies after a task is checked', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('task a');
  const checkbox = page.getByRole('checkbox', { name: 'Mark Task A complete' });

  const reloaded = page.waitForResponse((r) => r.url().endsWith('/api/tasks') && r.request().method() === 'GET');
  await checkbox.check();
  await reloaded;

  await expect(page.getByRole('listitem')).toHaveText(['Task A']);
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
});
