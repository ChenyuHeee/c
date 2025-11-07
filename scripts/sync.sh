#!/usr/bin/env bash
set -euo pipefail

BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$BRANCH" ]; then
  echo "[sync] Not in a git repository?" >&2
  exit 1
fi

echo "[sync] Fetching origin..."
git fetch origin

echo "[sync] Rebase onto origin/main..."
# If current is main just rebase fast; else rebase feature branch
if [ "$BRANCH" = "main" ]; then
  git pull --rebase origin main
else
  git rebase origin/main
fi

echo "[sync] Status after rebase:"
git status -sb

if ! git diff --quiet; then
  echo "[sync] Working tree not clean after rebase (unexpected). Commit or stash before running sync." >&2
  exit 2
fi

echo "[sync] Pushing (with lease)..."
git push --force-with-lease origin "$BRANCH"

echo "[sync] Done."
