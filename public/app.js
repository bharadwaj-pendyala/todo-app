const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');

async function loadTasks() {
  const response = await fetch('/api/tasks');
  render(await response.json());
}

function render(tasks) {
  list.replaceChildren(...tasks.map(toListItem));
}

function toListItem(task) {
  const item = document.createElement('li');
  item.className = [task.done ? 'done' : '', task.important ? 'important' : ''].filter(Boolean).join(' ');
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(task.done);
  checkbox.setAttribute('aria-label', `Mark ${task.title} complete`);
  checkbox.addEventListener('change', () => toggleDone(task.id, checkbox.checked));

  const importantCheckbox = document.createElement('input');
  importantCheckbox.type = 'checkbox';
  importantCheckbox.checked = Boolean(task.important);
  importantCheckbox.setAttribute('aria-label', `Mark ${task.title} important`);
  importantCheckbox.addEventListener('change', () => toggleImportant(task.id, importantCheckbox.checked));

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  item.append(checkbox, importantCheckbox, title);
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
