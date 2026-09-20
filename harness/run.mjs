#!/usr/bin/env node
import { execFileSync, execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';

const RUNS_DIR = process.env.RUNS_DIR ?? 'runs';
const STATES = ['clarifying', 'clarified', 'prepared', 'implemented', 'checked', 'recorded', 'published', 'stopped'];

function runPath(id) {
  return `${RUNS_DIR}/${id}/run.json`;
}

function loadRun(id) {
  if (!existsSync(runPath(id))) throw new Error(`no run record for ${id}`);
  return JSON.parse(readFileSync(runPath(id), 'utf8'));
}

function saveRun(run) {
  mkdirSync(`${RUNS_DIR}/${run.id}`, { recursive: true });
  writeFileSync(runPath(run.id), JSON.stringify(run, null, 2));
  return run;
}

function transition(run, state, extra = {}) {
  if (!STATES.includes(state)) throw new Error(`unknown state: ${state}`);
  run.state = state;
  run.history.push({ state, at: new Date().toISOString() });
  Object.assign(run, extra);
  return saveRun(run);
}

function claude(prompt, { json = false } = {}) {
  const out = execFileSync('claude', ['-p', prompt], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (!json) return out.trim();

  const match = out.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`expected JSON, got:\n${out.slice(0, 400)}`);
  return JSON.parse(match[0]);
}

function clarify(request) {
  const run = saveRun({
    id: `run-${Date.now().toString(36)}-${randomUUID().slice(0, 4)}`,
    request,
    state: 'clarifying',
    baseCommit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
    history: [],
    artifacts: {},
  });

  const questions = claude(
    `You are the intake step of an engineering harness for this repository.\n\n` +
      `A non-engineer asked for this change:\n"${request}"\n\n` +
      `Read the repository to understand the current behavior. Then ask ONLY the questions whose answers ` +
      `would change what gets built. Never more than three. Each must be answerable by someone who does not ` +
      `read code.\n\n` +
      `Reply with JSON only: {"questions":[{"id":"q1","ask":"...","why":"what changes based on the answer"}]}`,
    { json: true },
  );

  transition(run, 'clarifying', { questions: questions.questions });
  console.log(`\nrun: ${run.id}\n`);
  for (const q of questions.questions) console.log(`  ${q.id}. ${q.ask}\n      (${q.why})\n`);
  console.log(`answer with:\n  node harness/run.mjs answer ${run.id} "a1" "a2" ...\n`);
  return run;
}

function answer(id, answers) {
  const run = loadRun(id);
  run.answers = run.questions.map((q, i) => ({ ...q, answer: answers[i] ?? '' }));

  const spec = claude(
    `You are writing the agreed task for an engineering harness.\n\n` +
      `Request: "${run.request}"\n\n` +
      `Clarifying exchange:\n` +
      run.answers.map((a) => `Q: ${a.ask}\nA: ${a.answer}`).join('\n') +
      `\n\nRead the repository. Write the agreed task as JSON only:\n` +
      `{"summary":"one line","acceptance":["observable statements"],"unchanged":["behavior that must not change"],` +
      `"check":"what the automated check must prove","journey":"kebab-case name for the recorded journey"}`,
    { json: true },
  );

  transition(run, 'clarified', { spec });
  console.log(`\n${spec.summary}\n`);
  for (const a of spec.acceptance) console.log(`  + ${a}`);
  for (const u of spec.unchanged) console.log(`  = ${u}`);
  console.log(`\ncheck: ${spec.check}\njourney: ${spec.journey}\n`);
  console.log(`execute with:\n  node harness/run.mjs execute ${run.id}\n`);
  return run;
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { help: { type: 'boolean', short: 'h' } },
});

const [command, ...rest] = positionals;

if (values.help || !command) {
  console.log(`usage:
  node harness/run.mjs clarify "<request>"
  node harness/run.mjs answer <run-id> "<a1>" "<a2>" ...
  node harness/run.mjs execute <run-id>
  node harness/run.mjs show <run-id>`);
  process.exit(values.help ? 0 : 1);
}

if (command === 'clarify') clarify(rest.join(' '));
else if (command === 'answer') answer(rest[0], rest.slice(1));
else if (command === 'show') console.log(JSON.stringify(loadRun(rest[0]), null, 2));
else {
  console.error(`unknown command: ${command}`);
  process.exit(1);
}
