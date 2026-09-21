import { test, expect } from '@playwright/test';

test('toggling a task important marker persists and renders correctly without reordering', async ({ page }) => {
  const firstTitle = `First task ${Date.now()}`;
  const secondTitle = `Second task ${Date.now()}`;

  await page.goto('/');

  // Add two tasks, in order: firstTitle then secondTitle.
  await page.getByLabel('Task title').fill(firstTitle);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('li', { hasText: firstTitle })).toHaveCount(1);

  await page.getByLabel('Task title').fill(secondTitle);
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('li', { hasText: secondTitle })).toHaveCount(1);

  const firstItem = page.locator('li', { hasText: firstTitle });
  const secondItem = page.locator('li', { hasText: secondTitle });
  const firstStar = firstItem.getByRole('button');
  const secondStar = secondItem.getByRole('button');

  // Neither task starts out important: outline marker, aria-pressed false.
  await expect(firstStar).toHaveAttribute('aria-pressed', 'false');
  await expect(firstStar).toHaveText('☆');
  await expect(firstStar).not.toHaveClass(/important/);
  await expect(secondStar).toHaveAttribute('aria-pressed', 'false');
  await expect(secondStar).toHaveText('☆');
  await expect(secondStar).not.toHaveClass(/important/);

  // Mark only the second (later-added) task important via the star control.
  await secondStar.click();

  await expect(secondStar).toHaveAttribute('aria-pressed', 'true');
  await expect(secondStar).toHaveText('★');
  await expect(secondStar).toHaveClass(/important/);

  // The first (earlier-added, not important) task is untouched.
  await expect(firstStar).toHaveAttribute('aria-pressed', 'false');
  await expect(firstStar).toHaveText('☆');

  // List order stays by id: first task still appears before the second, even
  // though only the second one is important (no "important sorts to top").
  const titles = await page.locator('li .title').allTextContents();
  expect(titles.indexOf(firstTitle)).toBeLessThan(titles.indexOf(secondTitle));

  // No separate filter/view for important tasks: both remain in the single list.
  await expect(page.locator('li', { hasText: firstTitle })).toHaveCount(1);
  await expect(page.locator('li', { hasText: secondTitle })).toHaveCount(1);

  // The importance change was persisted via the API (not just client state).
  const apiTasks: Array<{ title: string; important: number }> = await page.evaluate(async () => {
    const response = await fetch('/api/tasks');
    return response.json();
  });
  const apiFirst = apiTasks.find((t) => t.title === firstTitle);
  const apiSecond = apiTasks.find((t) => t.title === secondTitle);
  expect(apiFirst?.important).toBeFalsy();
  expect(apiSecond?.important).toBeTruthy();

  // Reloading the page (fresh fetch from the DB) preserves the important state.
  await page.reload();

  const reloadedFirstStar = page.locator('li', { hasText: firstTitle }).getByRole('button');
  const reloadedSecondStar = page.locator('li', { hasText: secondTitle }).getByRole('button');

  await expect(reloadedFirstStar).toHaveAttribute('aria-pressed', 'false');
  await expect(reloadedFirstStar).toHaveText('☆');
  await expect(reloadedSecondStar).toHaveAttribute('aria-pressed', 'true');
  await expect(reloadedSecondStar).toHaveText('★');
  await expect(reloadedSecondStar).toHaveClass(/important/);

  // Order is still unaffected after reload.
  const titlesAfterReload = await page.locator('li .title').allTextContents();
  expect(titlesAfterReload.indexOf(firstTitle)).toBeLessThan(titlesAfterReload.indexOf(secondTitle));

  // Toggling back off works too and persists.
  await reloadedSecondStar.click();
  await expect(reloadedSecondStar).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(page.locator('li', { hasText: secondTitle }).getByRole('button')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});
