const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');
const tabAll = document.querySelector('#tab-all');
const tabImportant = document.querySelector('#tab-important');

let tasks = [];
let view = 'all';

async function loadTasks() {
  const response = await fetch('/api/tasks');
  tasks = await response.json();
  renderView();
}

function renderView() {
  const visible = view === 'important' ? tasks.filter((task) => task.important) : tasks;
  render(visible);
}

function render(visibleTasks) {
  list.replaceChildren(...visibleTasks.map(toListItem));
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

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  const importantToggle = document.createElement('button');
  importantToggle.type = 'button';
  importantToggle.className = task.important ? 'important-toggle active' : 'important-toggle';
  importantToggle.textContent = task.important ? '★' : '☆';
  importantToggle.setAttribute('aria-pressed', String(Boolean(task.important)));
  importantToggle.setAttribute(
    'aria-label',
    task.important ? `Unmark ${task.title} important` : `Mark ${task.title} important`,
  );
  importantToggle.addEventListener('click', () => toggleImportant(task.id, !task.important));

  item.append(checkbox, title, importantToggle);
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

function setView(next) {
  view = next;
  tabAll.classList.toggle('active', view === 'all');
  tabAll.setAttribute('aria-pressed', String(view === 'all'));
  tabImportant.classList.toggle('active', view === 'important');
  tabImportant.setAttribute('aria-pressed', String(view === 'important'));
  renderView();
}

tabAll.addEventListener('click', () => setView('all'));
tabImportant.addEventListener('click', () => setView('important'));

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
