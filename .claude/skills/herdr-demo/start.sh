#!/usr/bin/env bash
# Open a herdr workspace for one idea: builder (Claude Code) left, reviewer (Codex) right.
set -euo pipefail

[[ $# -ge 1 ]] || { echo 'usage: start.sh "<idea>" [--auto]' >&2; exit 2; }
IDEA=$1
MODE=human-in-the-loop
[[ ${2:-} == --auto ]] && MODE=autonomous

SKILL=$(cd "$(dirname "$0")" && pwd)
REPO=$(git -C "$SKILL" rev-parse --show-toplevel)
SLUG=$(printf %s "$IDEA" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | cut -c1-24 | sed 's/^-//; s/-$//')
PORT=$((4100 + $(printf %s "$SLUG" | cksum | cut -d' ' -f1) % 100))
field() { python3 -c "import sys, json; d = json.load(sys.stdin); print($1)"; }

created=$(herdr worktree create --cwd "$REPO" --branch "feat/$SLUG" --base main --label "$SLUG" --focus --json)
WT=$(echo "$created" | field 'd["result"]["worktree"]["path"]')
BUILDER=$(echo "$created" | field 'd["result"]["root_pane"]["pane_id"]')
REVIEWER=$(herdr pane split "$BUILDER" --direction right --no-focus | field 'd["result"]["pane"]["pane_id"]')

mkdir -p "$WT/.agent-team"
ln -s "$REPO/node_modules" "$WT/node_modules"
(cd "$WT" && npm run seed > /dev/null 2>&1)

python3 - "$SKILL/builder.md" "$WT/.agent-team/builder.md" \
  "IDEA=$IDEA" "MODE=$MODE" "REVIEWER=$REVIEWER" "PORT=$PORT" "SLUG=$SLUG" <<'PY'
import sys
src, dst, *pairs = sys.argv[1:]
text = open(src).read()
for pair in pairs:
    key, value = pair.split('=', 1)
    text = text.replace('{{' + key + '}}', value)
open(dst, 'w').write(text)
PY

herdr pane run "$REVIEWER" "cd '$WT' && codex --sandbox workspace-write --ask-for-approval never -c check_for_update_on_startup=false"
herdr pane run "$BUILDER" "cd '$WT' && PORT=$PORT claude ${BUILDER_MODEL:+--model $BUILDER_MODEL} --permission-mode auto --allowedTools 'Bash(herdr *)' 'Bash(git push *)' 'Bash(gh pr create *)' 'Read .agent-team/builder.md and follow it.'"

# Claude Code asks once whether to trust a new folder, and its default answer is "No, exit".
if herdr wait output "$BUILDER" --match 'trust this folder' --timeout 15000 > /dev/null 2>&1; then
  herdr pane send-keys "$BUILDER" Down Enter
fi

echo "workspace: $SLUG  ($MODE)"
echo "branch:    feat/$SLUG"
echo "app:       http://127.0.0.1:$PORT (once approved)"
