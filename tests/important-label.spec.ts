import { test, expect } from '@playwright/test';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = process.env.DB_PATH ?? 'db/tasks.db';

test('the seeded tasks default to important = false', async ({ request }) => {
  const response = await request.get('/api/tasks');
  const tasks = await response.json();

  expect(tasks.length).toBeGreaterThan(0);
  for (const task of tasks) {
    expect(task).toHaveProperty('important');
    expect(task.important).toBe(0);
  }
});

test('PATCH updates important independently of done and title', async ({ request }) => {
  const before = await (await request.get('/api/tasks')).json();
  const target = before.find((task: { title: string }) => task.title === 'Task A');

  const patched = await (
    await request.patch(`/api/tasks/${target.id}`, { data: { important: true } })
  ).json();

  expect(patched.important).toBe(1);
  expect(patched.done).toBe(target.done);
  expect(patched.title).toBe(target.title);

  const doneOnly = await (
    await request.patch(`/api/tasks/${target.id}`, { data: { done: true } })
  ).json();

  expect(doneOnly.important).toBe(1);
  expect(doneOnly.done).toBe(1);
  expect(doneOnly.title).toBe(target.title);

  // restore state for other tests
  await request.patch(`/api/tasks/${target.id}`, { data: { important: false, done: Boolean(target.done) } });
});

test('db/seed.js creates the tasks table with an important column defaulting to 0', async () => {
  const db = new DatabaseSync(DB_PATH);
  const columns = db.prepare('PRAGMA table_info(tasks)').all() as Array<{ name: string; dflt_value: string }>;
  const importantColumn = columns.find((column) => column.name === 'important');

  expect(importantColumn).toBeDefined();
  expect(importantColumn?.dflt_value).toBe('0');
  db.close();
});

test('toggling the important star persists across a reload', async ({ page }) => {
  await page.goto('/');

  const taskItem = page.locator('li', { has: page.getByText('Task A', { exact: true }) });
  const starButton = taskItem.getByRole('button', { name: 'Mark Task A important' });

  await expect(taskItem).not.toHaveClass(/important/);
  await expect(starButton).toHaveAttribute('aria-pressed', 'false');

  await starButton.click();

  await expect(taskItem).toHaveClass(/important/);
  await expect(starButton).toHaveAttribute('aria-pressed', 'true');

  await page.reload();

  const reloadedItem = page.locator('li', { has: page.getByText('Task A', { exact: true }) });
  const reloadedStar = reloadedItem.getByRole('button', { name: 'Mark Task A important' });

  await expect(reloadedItem).toHaveClass(/important/);
  await expect(reloadedStar).toHaveAttribute('aria-pressed', 'true');

  // restore state for other tests
  await reloadedStar.click();
  await expect(reloadedItem).not.toHaveClass(/important/);
});
