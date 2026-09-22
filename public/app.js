const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');

async function loadTasks() {
  const response = await fetch('/api/tasks');
  render(await response.json());
}

function render(tasks) {
  const sorted = [...tasks].sort((a, b) => {
    const aImportant = Boolean(a.important);
    const bImportant = Boolean(b.important);
    if (aImportant !== bImportant) return aImportant ? -1 : 1;
    if (aImportant) {
      const aDone = Boolean(a.done);
      const bDone = Boolean(b.done);
      if (aDone !== bDone) return aDone ? 1 : -1;
    }
    return a.id - b.id;
  });
  list.replaceChildren(...sorted.map(toListItem));
}

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toListItem(task) {
  const item = document.createElement('li');
  item.className = task.done ? 'done' : '';
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(task.done);
  checkbox.setAttribute('aria-label', `Mark ${task.title} complete`);
  checkbox.addEventListener('change', () => toggleDone(task.id, checkbox.checked));

  const star = document.createElement('button');
  star.type = 'button';
  star.className = task.important ? 'star important' : 'star';
  star.dataset.testid = `star-${slugify(task.title)}`;
  star.setAttribute('aria-pressed', String(Boolean(task.important)));
  star.setAttribute('aria-label', `Mark ${task.title} important`);
  star.textContent = task.important ? '★' : '☆';
  star.addEventListener('click', () => toggleImportant(task.id, !task.important));

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  item.append(checkbox, star, title);
  return item;
}

async function toggleDone(id, done) {
  await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ done }),
  });
  await loadTasks();
}

async function toggleImportant(id, important) {
  await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ important }),
  });
  await loadTasks();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  titleInput.value = '';
  await loadTasks();
});

loadTasks();
