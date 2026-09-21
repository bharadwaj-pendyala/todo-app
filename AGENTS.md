# To-do demo contract

This is the small application exercised by `remote-harness`. The baseline lists,
creates and completes tasks. It intentionally has no Important marker: the demo
asks about that gap, then requests it as a separate change.

- Runtime: Node 22 or later, Express, and `node:sqlite`. Keep that stack.
- `server.js` owns the task API; `public/` owns the browser UI.
- Preserve task IDs, titles, completion state, and ID ordering unless the approved
  spec explicitly changes one of them.
- A schema change must handle an existing database. Do not rely on reseeding to
  migrate tasks. `db/seed.js` deliberately resets disposable demo data.
- Add acceptance checks under `tests/` and a visible journey under `journeys/`.
  Use accessible, uniquely scoped locators. A persistence criterion must mark the
  task before reloading and check the persisted result afterward.
- The generated change must not modify `.github/`, publish credentials, or merge.

Commands declared in `harness.yml`:

```sh
./scripts/setup-app       # installs dependencies and resets demo data
./scripts/start-app       # starts the server, honoring PORT and DB_PATH
./scripts/check-app       # Playwright acceptance suite
./scripts/record-journey <journey-name>
```

When a harness worker asks for edits only, leave execution of these commands to
the worker. `ARTIFACTS_DIR` selects the recording output directory.
