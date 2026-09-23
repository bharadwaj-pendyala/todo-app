import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH ?? 'db/tasks.db';

mkdirSync(dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec('DROP TABLE IF EXISTS tasks');
db.exec(`
  CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    important INTEGER NOT NULL DEFAULT 0
  )
`);

const insert = db.prepare('INSERT INTO tasks (title, done, important) VALUES (?, ?, ?)');
insert.run('Task A', 0, 0);
insert.run('Task B', 0, 0);
insert.run('Renew the domain', 1, 0);

console.log(`seeded ${DB_PATH}`);
