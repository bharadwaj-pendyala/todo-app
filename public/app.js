const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');
const filterImportant = document.querySelector('#filter-important');

let tasks = [];

async function loadTasks() {
  const response = await fetch('/api/tasks');
  tasks = await response.json();
  render();
}

function render() {
  const visible = filterImportant.checked ? tasks.filter((task) => task.important) : tasks;
  list.replaceChildren(...visible.map(toListItem));
}

function toListItem(task) {
  const item = document.createElement('li');
  item.className = [task.done ? 'done' : '', task.important ? 'important' : ''].filter(Boolean).join(' ');
  item.dataset.id = task.id;

  const doneCheckbox = document.createElement('input');
  doneCheckbox.type = 'checkbox';
  doneCheckbox.checked = Boolean(task.done);
  doneCheckbox.setAttribute('aria-label', `Mark ${task.title} complete`);
  doneCheckbox.addEventListener('change', () => toggleField(task.id, 'done', doneCheckbox.checked));

  const importantCheckbox = document.createElement('input');
  importantCheckbox.type = 'checkbox';
  importantCheckbox.checked = Boolean(task.important);
  importantCheckbox.setAttribute('aria-label', `Mark ${task.title} important`);
  importantCheckbox.addEventListener('change', () => toggleField(task.id, 'important', importantCheckbox.checked));

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  item.append(doneCheckbox, importantCheckbox, title);
  return item;
}

async function toggleField(id, field, value) {
  await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ [field]: value }),
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

filterImportant.addEventListener('change', render);

loadTasks();
