import { test, expect } from '@playwright/test';

test('clicking Export CSV downloads tasks.csv', async ({ page }) => {
  await page.goto('/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('tasks.csv');
});

test('the CSV has a header row and one row per task', async ({ request }) => {
  const tasks = await (await request.get('/api/tasks')).json();
  const response = await request.get('/api/tasks.csv');

  expect(response.headers()['content-type']).toContain('text/csv');
  const [header, ...rows] = (await response.text()).trimEnd().split('\r\n');
  expect(header).toBe('id,title,done');
  expect(rows).toHaveLength(tasks.length);

  const seededTitles = ['Task A', 'Task B', 'Renew the domain'];
  for (const task of tasks.filter((t) => seededTitles.includes(t.title))) {
    expect(rows).toContain(`${task.id},${task.title},${Boolean(task.done)}`);
  }
});

test('a title with a comma and quotes is escaped', async ({ request }) => {
  const created = await (await request.post('/api/tasks', { data: { title: 'Buy milk, "2%"' } })).json();
  const csv = await (await request.get('/api/tasks.csv')).text();
  expect(csv).toContain(`${created.id},"Buy milk, ""2%""",false\r\n`);
});
