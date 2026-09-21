import { test, expect } from '@playwright/test';

async function fetchRemainingFromApi(request: import('@playwright/test').APIRequestContext) {
  const tasks = await (await request.get('/api/tasks')).json();
  return tasks.filter((task: { done: number }) => !task.done).length;
}

test('remaining count sits above the list and matches tasks with done = 0', async ({ page, request }) => {
  await page.goto('/');

  const count = page.getByTestId('remaining-count');
  await expect(count).toBeVisible();

  const expected = await fetchRemainingFromApi(request);
  await expect(count).toHaveText(`${expected} remaining`);

  const order = await page.evaluate(() => {
    const countEl = document.querySelector('[data-testid="remaining-count"]')!;
    const listEl = document.querySelector('#tasks')!;
    return Boolean(countEl.compareDocumentPosition(listEl) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
});

test('the count updates after adding a task and after toggling it done, with completed tasks staying visible', async ({
  page,
  request,
}) => {
  await page.goto('/');

  const count = page.getByTestId('remaining-count');
  const before = await fetchRemainingFromApi(request);
  await expect(count).toHaveText(`${before} remaining`);

  const title = `Temp task ${Date.now()}`;
  await page.getByLabel('Task title').fill(title);
  await page.getByRole('button', { name: 'Add' }).click();

  const item = page.locator('#tasks li').filter({ hasText: title });
  await expect(item).toBeVisible();
  await expect(count).toHaveText(`${before + 1} remaining`);

  const checkbox = page.getByRole('checkbox', { name: `Mark ${title} complete` });
  await checkbox.check();

  await expect(count).toHaveText(`${before} remaining`);
  await expect(item).toBeVisible();
  await expect(checkbox).toBeChecked();
});
