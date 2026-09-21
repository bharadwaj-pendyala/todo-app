import { test, expect, type Page } from '@playwright/test';

function uniqueTitle(label: string) {
  return `${label} ${Math.random().toString(36).slice(2, 8)}`;
}

async function addTask(page: Page, title: string) {
  await page.getByLabel('Task title').fill(title);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('#tasks li').filter({ hasText: title })).toHaveCount(1);
}

function titleOrder(page: Page) {
  return page.locator('#tasks .title').allTextContents();
}

test('marking tasks important persists, filters, and never reorders the default view', async ({ page }) => {
  await page.goto('/');

  const first = uniqueTitle('Alpha');
  const second = uniqueTitle('Bravo');
  const third = uniqueTitle('Charlie');

  await addTask(page, first);
  await addTask(page, second);
  await addTask(page, third);

  const initialOrder = await titleOrder(page);
  expect(initialOrder.indexOf(first)).toBeLessThan(initialOrder.indexOf(second));
  expect(initialOrder.indexOf(second)).toBeLessThan(initialOrder.indexOf(third));

  await page.getByRole('checkbox', { name: `Mark ${second} important` }).check();

  await page.reload();
  await expect(page.getByRole('checkbox', { name: `Mark ${second} important` })).toBeChecked();

  await page.getByRole('checkbox', { name: 'Show important only' }).check();
  await expect(page.locator('#tasks .title')).toHaveText([second]);

  await page.getByRole('checkbox', { name: `Mark ${second} complete` }).check();
  await expect(page.locator('#tasks .title')).toHaveText([second]);
  await expect(page.getByRole('checkbox', { name: `Mark ${second} important` })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: `Mark ${second} complete` })).toBeChecked();

  await page.getByRole('checkbox', { name: 'Show important only' }).uncheck();
  const finalOrder = await titleOrder(page);
  expect(finalOrder).toContain(first);
  expect(finalOrder).toContain(second);
  expect(finalOrder).toContain(third);
  expect(finalOrder.indexOf(first)).toBeLessThan(finalOrder.indexOf(second));
  expect(finalOrder.indexOf(second)).toBeLessThan(finalOrder.indexOf(third));
});

test('newly created tasks default to not important', async ({ page }) => {
  await page.goto('/');

  const title = uniqueTitle('Delta');
  await addTask(page, title);

  await expect(page.getByRole('checkbox', { name: `Mark ${title} important` })).not.toBeChecked();
});
