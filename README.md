# To-do app for the remote harness demo

This repository is the application being changed. The conversation service,
approval, Actions workflows, and publication live in
[remote-harness](https://github.com/bharadwaj-pendyala/remote-harness).

The baseline has task titles and completion. Keep it without the Important
feature so an agent can first answer a repository question and then implement
the approved request on a separate branch.

## Run the baseline

Use Node 22 or later. These commands use disposable local data: setup reseeds
`db/tasks.db`. Set `DB_PATH` to a different disposable file when needed.

```sh
./scripts/setup-app
npx playwright install chromium
./scripts/check-app
./scripts/start-app
```

## The demonstration

1. In the harness chat, ask: **Is an Important label implemented in this app?**
2. Ask the agent which source files support its answer.
3. Request an on/off star marker. Existing tasks start unmarked; toggling it must
   persist across reload. Completion and list order stay unchanged. Do not add
   filtering, sorting, or multiple priority levels.
4. Review and approve the exact spec revision. This starts the remote build.
5. Review the generated draft PR and video. The video should show marking a task,
   reloading, completing it, and removing the marker. Accept the behavior only
   after checking it; engineering review and merge are separate.

[PR #4](https://github.com/bharadwaj-pendyala/todo-app/pull/4) is a prepared example
from the earlier workflow-driven intake. Disclose when using that recording
instead of a new run through the persistent chat service.

`harness.yml` documents this app's script contract. The current harness worker
calls those script paths directly; it is not yet a generic YAML adapter engine.
The harness chat reads a pinned Git commit, so commit app documentation changes
before starting a new conversation if the agent should see them.
