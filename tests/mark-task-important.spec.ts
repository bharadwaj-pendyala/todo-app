import { test, expect, type Page } from '@playwright/test';

async function setStar(page: Page, testId: string, important: boolean) {
  const star = page.getByTestId(testId);
  const pressed = await star.getAttribute('aria-pressed');
  if ((pressed === 'true') !== important) {
    await star.click();
  }
  return star;
}

test('starring a task persists after reload', async ({ page }) => {
  await page.goto('/');
  await setStar(page, 'star-task-a', false);

  const star = page.getByTestId('star-task-a');
  await expect(star).toHaveAttribute('aria-pressed', 'false');
  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(page.getByTestId('star-task-a')).toHaveAttribute('aria-pressed', 'true');
});

test('un-starring a task persists after reload', async ({ page }) => {
  await page.goto('/');
  await setStar(page, 'star-task-a', true);

  const star = page.getByTestId('star-task-a');
  await star.click();
  await expect(star).toHaveAttribute('aria-pressed', 'false');

  await page.reload();
  await expect(page.getByTestId('star-task-a')).toHaveAttribute('aria-pressed', 'false');
});

test('important tasks are sorted above non-important tasks', async ({ page }) => {
  await page.goto('/');
  await setStar(page, 'star-task-a', false);
  await setStar(page, 'star-task-b', false);
  await setStar(page, 'star-renew-the-domain', true);

  await page.reload();
  const titles = page.locator('#tasks li .title');
  await expect(titles.first()).toHaveText('Renew the domain');
});

test('marking a task done does not change its important flag', async ({ page }) => {
  await page.goto('/');
  await setStar(page, 'star-task-a', true);

  const checkbox = page.getByRole('checkbox', { name: 'Mark Task A complete' });
  if (await checkbox.isChecked()) await checkbox.uncheck();
  await checkbox.check();

  await expect(page.getByTestId('star-task-a')).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(page.getByTestId('star-task-a')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('checkbox', { name: 'Mark Task A complete' })).toBeChecked();
});
