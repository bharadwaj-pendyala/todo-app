import { test } from '@playwright/test';

test('mark a task important', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(600);

  const titleInput = page.locator('#title');
  const addButton = page.getByRole('button', { name: 'Add', exact: true });
  const mainList = page.locator('#tasks');

  const taskName = `Ship the release notes ${Date.now()}`;
  await titleInput.fill(taskName);
  await page.waitForTimeout(400);
  await addButton.click();
  await page.waitForTimeout(600);

  const taskItem = mainList.locator('li', { hasText: taskName });
  const importantToggle = taskItem.getByRole('button', { name: `Mark ${taskName} important`, exact: true });
  await importantToggle.click();
  await page.waitForTimeout(600);

  await page.locator('#tab-important').click();
  await page.waitForTimeout(800);

  await page.locator('#tab-all').click();
  await page.waitForTimeout(600);

  const doneCheckbox = taskItem.getByRole('checkbox', { name: `Mark ${taskName} complete`, exact: true });
  await doneCheckbox.check();
  await page.waitForTimeout(600);

  await page.locator('#tab-important').click();
  await page.waitForTimeout(800);
});
