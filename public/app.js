const list = document.querySelector('#tasks');
const form = document.querySelector('#new-task');
const titleInput = document.querySelector('#title');
const importantOnly = document.querySelector('#important-only');

let tasks = [];

async function loadTasks() {
  const response = await fetch('/api/tasks');
  tasks = await response.json();
  render();
}

function render() {
  const visible = importantOnly.checked ? tasks.filter((task) => task.important) : tasks;
  list.replaceChildren(...visible.map(toListItem));
}

function toListItem(task) {
  const item = document.createElement('li');
  item.className = [task.done ? 'done' : '', task.important ? 'important' : ''].join(' ').trim();
  item.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(task.done);
  checkbox.setAttribute('aria-label', `Mark ${task.title} complete`);
  checkbox.addEventListener('change', () => toggleDone(task.id, checkbox.checked));

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = task.title;

  const flag = document.createElement('button');
  flag.type = 'button';
  flag.className = 'flag';
  flag.textContent = task.important ? 'Important' : 'Normal';
  flag.setAttribute('aria-pressed', String(Boolean(task.important)));
  flag.setAttribute('aria-label', `Toggle important for ${task.title}`);
  flag.addEventListener('click', () => toggleImportant(task.id, !task.important));

  item.append(checkbox, title, flag);
  return item;
}

async function toggleDone(id, done) {
  await patchTask(id, { done });
}

async function toggleImportant(id, important) {
  await patchTask(id, { important });
}

async function patchTask(id, changes) {
  await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(changes),
  });
  await loadTasks();
}

importantOnly.addEventListener('change', render);

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
