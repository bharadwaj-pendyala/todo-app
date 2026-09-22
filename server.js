import express from 'express';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.env.PORT ?? 3000);
const DB_PATH = process.env.DB_PATH ?? 'db/tasks.db';

const db = new DatabaseSync(DB_PATH);

const hasImportantColumn = db.prepare("PRAGMA table_info(tasks)").all()
  .some((column) => column.name === 'important');
if (!hasImportantColumn) {
  db.exec('ALTER TABLE tasks ADD COLUMN important INTEGER NOT NULL DEFAULT 0');
}

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/tasks', (_req, res) => {
  res.json(db.prepare('SELECT * FROM tasks ORDER BY id').all());
});

app.post('/api/tasks', (req, res) => {
  const title = String(req.body.title ?? '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });

  const { lastInsertRowid } = db.prepare('INSERT INTO tasks (title, done, important) VALUES (?, 0, 0)').run(title);
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(lastInsertRowid));
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'task not found' });

  if (typeof req.body.done === 'boolean') {
    db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(req.body.done ? 1 : 0, task.id);
  }
  if (typeof req.body.important === 'boolean') {
    db.prepare('UPDATE tasks SET important = ? WHERE id = ?').run(req.body.important ? 1 : 0, task.id);
  }
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id));
});

app.listen(PORT, () => console.log(`todo app on http://127.0.0.1:${PORT}`));
