---
name: herdr-demo
description: Run an agent team on one idea inside herdr. You (Claude Code) plan and build in your own worktree, open Codex in a pane to your right as the reviewer, prompt it yourself, and loop until it approves. Use when the user types /herdr-demo "<idea>" or /herdr-demo "<idea>" --auto.
---

# herdr-demo

You are the lead and the builder. Codex is the reviewer. You drive Codex through herdr. The user only steps in at the gates.

- `/herdr-demo "<idea>"`: human in the loop. Stop at two gates: the spec, and the pull request.
- `/herdr-demo "<idea>" --auto`: autonomous. Do not stop. End with a draft pull request.

Say one short line to the user at each step so the audience can follow along.

## 1. Set up the lane

1. Require `HERDR_ENV=1`. If it is not set, tell the user to start Claude Code from a herdr pane, and stop.
2. Pick a short kebab-case slug from the idea, for example `csv-export`.
3. Use the EnterWorktree tool with that slug, so this session works on its own branch in its own folder. Rename the branch to `feat/<slug>` if needed.
4. In the worktree: `ln -s <main repo>/node_modules node_modules` and `npm run seed`.
5. Pick a port for this lane, 4100 plus a number from 0 to 99. Use `PORT=<port>` for every `npm test` and `npm start`. Port 3000 may belong to another app.
6. Find your own pane: `herdr pane current`. Split it to the right, and start Codex in the new pane:
   ```
   herdr pane split <your pane> --direction right --no-focus
   herdr pane run <codex pane> "cd <worktree> && codex --sandbox workspace-write --ask-for-approval never -c check_for_update_on_startup=false"
   ```
   Wait until `herdr pane read <codex pane> --source visible` shows its prompt. If it asks to trust the folder, press Enter.

## 2. Plan

Read AGENTS.md and the code. Write `.agent-team/spec.md`: a title, Goal (one sentence), In scope, Out of scope, and Done when (testable bullets, with one edge case). Keep it under 20 lines. Add `.agent-team/` to `.git/info/exclude`.

- Human in the loop: show the spec and ask the user to approve it. Change it if they ask.
- Autonomous: continue.

## 3. Build

Implement the spec. Add a Playwright test for each Done when bullet. Run `PORT=<port> npm test` until it passes. Commit. Do not push.

## 4. Review with Codex

Write your own instruction for Codex. It must tell Codex to:

- not edit any file except its review file
- read `.agent-team/spec.md`, AGENTS.md, and `git diff main...HEAD`
- check that the change does what the spec says, and nothing more
- list each problem with its file and line
- write the review to `.agent-team/review-<round>.md`, ending with exactly one line: `VERDICT: APPROVE` or `VERDICT: REQUEST CHANGES`

Write it to `.agent-team/review-request.md`. Send Codex one line that tells it to read that file and names the round. Herdr needs a pause before Enter:

```
herdr agent send <codex pane> "<instruction>" && sleep 2 && herdr pane send-keys <codex pane> Enter
until grep -q '^VERDICT:' .agent-team/review-<round>.md 2>/dev/null; do sleep 3; done
```

Tell the user the verdict in one line.

## 5. Loop

On `REQUEST CHANGES`, fix each finding, run the tests, commit, and send Codex the next round. Stop after round 3 and hand back to the user. Then `git status` must be clean apart from your commits. If Codex changed files, say so and stop.

## 6. Finish

On `APPROVE`:

1. Start the app in the background with `PORT=<port> npm start`. Give the user the URL.
2. Human in the loop: ask whether to open a draft pull request. Autonomous: open it.
3. To open it: `git push -u origin feat/<slug>`, then `gh pr create --draft --base main --title "<spec title>" --body-file .agent-team/spec.md`. Give the user the URL.

## Rules

- Never push to main. Never merge.
- Codex reviews. It never edits code.
- Do not edit `.claude/`.
