# todo-app

A small task list app, and the `/herdr-demo` skill that builds features on it with two coding agents. This is the demo repo from the talk [Stop Prompting, Start Orchestrating](https://bharad.dev/talks).

The app is plain on purpose: Express in `server.js`, DOM code in `public/app.js`, SQLite through `node:sqlite`, and Playwright tests. The interesting part is the skill.

## The `/herdr-demo` skill

[`.claude/skills/herdr-demo/SKILL.md`](.claude/skills/herdr-demo/SKILL.md) is one markdown file, about 75 lines. You type one sentence into Claude Code, and Claude runs a small agent team on it:

- Claude Code plans and builds.
- Codex reviews. It never edits code.
- [Herdr](https://herdr.dev) runs both agents side by side and carries messages between them.

```
/herdr-demo "Let me export my tasks to a CSV file."
/herdr-demo "Add a search box that filters tasks." --auto
```

Without `--auto`, Claude stops twice: once for you to approve the spec, once before it opens a pull request. With `--auto`, it goes from the idea to a draft pull request on its own.

### What the file contains

| Section | What Claude does |
|---|---|
| Frontmatter | `name` and `description`. The description tells Claude when to use the skill. |
| 1. Set up the lane | Makes a worktree on `feat/<slug>`, picks a port, and starts Codex in a pane to its right. |
| 2. Plan | Writes `.agent-team/spec.md`: goal, in scope, out of scope, done when. Gate 1 in human in the loop mode. |
| 3. Build | Writes the code and a Playwright test for each "done when" line. Commits. |
| 4. Review with Codex | Writes the review request and sends it to Codex through Herdr. Waits for `VERDICT: APPROVE` or `VERDICT: REQUEST CHANGES` in `.agent-team/review-<round>.md`. |
| 5. Loop | Fixes the findings and sends the next round. Stops after round 3 and hands back to you. |
| 6. Finish | Starts the app and gives you the URL. Gate 2, then a draft pull request. |
| Rules | Never push to main. Never merge. Codex never edits. |

The fixed verdict line is what makes the loop work. Claude reads one of two exact phrases and decides the next step without you.

## Run it

You need Node 22 or later, [Claude Code](https://www.npmjs.com/package/@anthropic-ai/claude-code), the [Codex CLI](https://www.npmjs.com/package/@openai/codex), [Herdr](https://herdr.dev), and the GitHub CLI if you want the pull request step.

```
npm ci
npm run seed
npm test
```

Then open Herdr in this folder, start Claude Code in a pane, and type a `/herdr-demo` command. The skill refuses to start outside Herdr.

To let Claude drive Herdr and open a draft pull request without asking each time:

```
claude --permission-mode auto --allowedTools 'Bash(herdr *)' 'Bash(git push *)' 'Bash(gh pr create *)'
```

Each lane works in `.claude/worktrees/<slug>` with its own branch and port. Remove a lane when you are done:

```
git worktree remove --force .claude/worktrees/<slug>
git branch -D feat/<slug>
```

## Use the skill in your own repo

Copy `.claude/skills/herdr-demo/` into your repo. Then change the parts that belong to this app:

- `npm run seed`, `npm test` and `npm start` in steps 1, 3 and 6.
- The `node_modules` symlink in step 1, if your project does not use npm.
- The `PORT` convention. This app reads `PORT` from the environment.

Write an `AGENTS.md` with your house rules first. Claude reads it before it plans, and it tells Codex to read it before it reviews.

## Other files

`harness.yml`, `scripts/` and `journeys/` belong to [remote-harness](https://github.com/bharadwaj-pendyala/remote-harness), which runs the same loop on GitHub Actions instead of a laptop.
