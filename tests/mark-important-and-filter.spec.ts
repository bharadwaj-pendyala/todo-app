import { test, expect, type Page } from '@playwright/test';

const titles = (page: Page) => page.locator('#tasks .title').allTextContents();

const flag = (page: Page, title: string) =>
  page.getByRole('button', { name: `Toggle important for ${title}` });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  for (const title of ['Task A', 'Task B', 'Renew the domain']) {
    await expect(flag(page, title)).toHaveText('Normal');
  }
});

test('marking a task important survives a reload', async ({ page }) => {
  await flag(page, 'Task A').click();
  await expect(flag(page, 'Task A')).toHaveText('Important');

  await page.reload();
  await expect(flag(page, 'Task A')).toHaveText('Important');
  await expect(flag(page, 'Task B')).toHaveText('Normal');

  await flag(page, 'Task A').click();
});

test('the important-only view keeps the original relative order', async ({ page }) => {
  const allTasks = await titles(page);

  await flag(page, 'Task A').click();
  await flag(page, 'Renew the domain').click();

  await page.getByLabel('Show important only').check();
  await expect.poll(() => titles(page)).toEqual(['Task A', 'Renew the domain']);

  await page.getByLabel('Show important only').uncheck();
  await expect.poll(() => titles(page)).toEqual(allTasks);

  await flag(page, 'Task A').click();
  await flag(page, 'Renew the domain').click();
});

test('completing a task changes neither its position nor its important state', async ({ page }) => {
  const allTasks = await titles(page);

  await flag(page, 'Task B').click();
  await page.getByRole('checkbox', { name: 'Mark Task B complete' }).check();

  await expect.poll(() => titles(page)).toEqual(allTasks);
  await expect(flag(page, 'Task B')).toHaveText('Important');

  await page.getByRole('checkbox', { name: 'Mark Task B complete' }).uncheck();
  await flag(page, 'Task B').click();
});
