import { test, expect, type Page } from '@playwright/test';

let tag: string;

test.beforeEach(async ({ request }) => {
  tag = `milk${Date.now()}w${test.info().workerIndex}`;
  for (const title of [`Buy ${tag.toUpperCase()}`, `Pour ${tag}`, `Walk dog ${Date.now()}`]) {
    await request.post('/api/tasks', { data: { title } });
  }
});

test('typing filters tasks by title, ignoring case', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Search tasks').fill(tag);
  await expect(page.locator('#tasks li')).toHaveText([`Buy ${tag.toUpperCase()}`, `Pour ${tag}`]);
});

test('clearing the search shows every task again', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(`Pour ${tag}`)).toBeVisible();
  const allCount = await page.locator('#tasks li').count();
  const search = page.getByLabel('Search tasks');
  await search.fill(tag);
  await expect(page.locator('#tasks li')).toHaveCount(2);
  await search.fill('');
  await expect(page.locator('#tasks li')).toHaveCount(allCount);
});

test('a query with no match shows an empty list', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  await page.goto('/');
  await page.getByLabel('Search tasks').fill(`nothing-${tag}`);
  await expect(page.locator('#tasks li')).toHaveCount(0);
  expect(errors).toEqual([]);
});

// Marks the current items so the wait ends only after the refresh replaces them.
async function waitForListRefresh(page: Page, action: () => Promise<void>) {
  await page.locator('#tasks li').evaluateAll((items) => items.forEach((item) => (item.dataset.stale = 'true')));
  const refreshed = page.waitForResponse(
    (response) => response.url().endsWith('/api/tasks') && response.request().method() === 'GET',
  );
  await action();
  await refreshed;
  await expect(page.locator('#tasks li[data-stale]')).toHaveCount(0);
}

test('the search stays applied after a toggle or an add', async ({ page }) => {
  await page.goto('/');
  const search = page.getByLabel('Search tasks');
  const matchingTitles = [`Buy ${tag.toUpperCase()}`, `Pour ${tag}`];
  await expect(page.locator('#tasks li')).not.toHaveCount(0);
  await search.fill(tag);

  await waitForListRefresh(page, () => page.getByRole('checkbox', { name: `Mark Pour ${tag} complete` }).check());
  await expect(page.locator('#tasks li')).toHaveText(matchingTitles);
  await expect(search).toHaveValue(tag);

  await page.getByLabel('Task title').fill(`Water plants ${Date.now()}`);
  await waitForListRefresh(page, () => page.getByRole('button', { name: 'Add' }).click());
  await expect(page.locator('#tasks li')).toHaveText(matchingTitles);
  await expect(search).toHaveValue(tag);
});
