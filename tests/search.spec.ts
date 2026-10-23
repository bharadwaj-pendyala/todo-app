import { test, expect } from '@playwright/test';

test('searching hides tasks whose title does not match', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('task');
  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeVisible();
  await expect(page.getByText('Renew the domain')).toBeHidden();
});

test('search ignores case', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('RENEW');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByText('Renew the domain')).toBeVisible();
});

test('clearing the search shows every task again', async ({ page }) => {
  await page.goto('/');
  const search = page.getByLabel('Search tasks');
  await search.fill('renew');
  await search.fill('');
  await expect(page.getByRole('listitem')).toHaveCount(3);
});

test('a search with no matches says so', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('zzz');
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('No matching tasks')).toBeVisible();
});
