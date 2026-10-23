---
name: herdr-demo
description: Start an agent team on one idea inside herdr. Opens a new workspace on its own branch with Claude Code (builder) on the left and Codex (reviewer) on the right. Use when the user types /herdr-demo "<idea>" [--auto].
---

# herdr-demo

Run the start script with the user's arguments, then report what it printed.

```bash
.claude/skills/herdr-demo/start.sh "<idea>" [--auto]
```

- Without `--auto`: human in the loop. The builder asks the user to approve the spec and to open the pull request.
- With `--auto`: autonomous. The builder goes from idea to a draft pull request without stopping.

Rules:

- Require `HERDR_ENV=1`. If it is not set, tell the user to run this from a herdr pane and stop.
- Do not build the feature yourself. The new workspace does the work.
- After the script prints the workspace name, tell the user to switch to it in the herdr sidebar. Then stop.
