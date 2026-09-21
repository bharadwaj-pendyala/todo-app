import { test, expect } from '@playwright/test';

test('marking a task important shows it in the Important view without reordering the main list, and it survives completion', async ({ page }) => {
  await page.goto('/');

  const titleInput = page.locator('#title');
  const addButton = page.getByRole('button', { name: 'Add', exact: true });
  const mainList = page.locator('#tasks');

  const runId = Date.now();
  const taskNames = [`Alpha task ${runId}`, `Beta task ${runId}`, `Gamma task ${runId}`];

  for (const name of taskNames) {
    await titleInput.fill(name);
    await addButton.click();
    await expect(mainList.getByText(name, { exact: true })).toBeVisible();
  }

  const orderBefore = await mainList.locator('li .title').allTextContents();

  const targetName = taskNames[1];
  const targetItem = mainList.locator('li', { hasText: targetName });
  const importantToggle = targetItem.getByRole('button', { name: `Mark ${targetName} important`, exact: true });
  await importantToggle.click();

  await expect(targetItem.getByRole('button', { name: `Unmark ${targetName} important`, exact: true })).toBeVisible();

  const orderAfter = await mainList.locator('li .title').allTextContents();
  expect(orderAfter).toEqual(orderBefore);

  await page.locator('#tab-important').click();
  const importantList = page.locator('#tasks');
  await expect(importantList.locator('li')).toHaveCount(1);
  await expect(importantList.getByText(targetName, { exact: true })).toBeVisible();

  await page.locator('#tab-all').click();
  const doneCheckbox = mainList
    .locator('li', { hasText: targetName })
    .getByRole('checkbox', { name: `Mark ${targetName} complete`, exact: true });
  await doneCheckbox.check();

  await page.locator('#tab-important').click();
  await expect(importantList.locator('li')).toHaveCount(1);
  const importantItem = importantList.locator('li', { hasText: targetName });
  await expect(importantItem).toBeVisible();
  await expect(importantItem).toHaveClass('done');
  await expect(importantItem.getByRole('button', { name: `Unmark ${targetName} important`, exact: true })).toBeVisible();
});
