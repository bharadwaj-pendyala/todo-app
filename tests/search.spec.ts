import { test, expect } from '@playwright/test';

test('typing a query shows only tasks whose title matches', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('task a');
  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeHidden();
  await expect(page.getByText('Renew the domain')).toBeHidden();
});

test('clearing the search box shows every task again', async ({ page }) => {
  await page.goto('/');
  const search = page.getByLabel('Search tasks');
  await search.fill('task a');
  await expect(page.getByText('Task B')).toBeHidden();

  await search.fill('');
  await expect(page.getByText('Task A')).toBeVisible();
  await expect(page.getByText('Task B')).toBeVisible();
  await expect(page.getByText('Renew the domain')).toBeVisible();
});

test('the filter stays applied after completing a task', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('task');
  const checkbox = page.getByRole('checkbox', { name: 'Mark Task A complete' });
  const wasChecked = await checkbox.isChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked({ checked: !wasChecked });
  await expect(page.getByText('Task B')).toBeVisible();
  await expect(page.getByText('Renew the domain')).toBeHidden();
});

test('the filter stays applied after adding a task', async ({ page }) => {
  const title = `Water the plants task ${Date.now()}`;
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('task');
  await page.getByLabel('Task title').fill(title);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText('Renew the domain')).toBeHidden();
});

test('a query that matches no title shows a no-match message', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill('zzz no such task');
  await expect(page.getByText('No matching tasks')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});
