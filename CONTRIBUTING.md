# Contributing Guide

Thanks for collaborating on this project! Below is a pragmatic workflow we follow. It’s designed to be simple and to fit our current stack (static pages + small Node scripts).

## Branching model
- Main development happens on `main`.
- For any change, create a short-lived feature branch: `feat/<topic>` or `fix/<topic>`.
- Keep commits small and focused. Prefer rebase to keep history linear.

## Commit messages
- Use concise present-tense messages. Conventional Commits are welcome (e.g. `feat: add internal code viewer`).
- When user-visible behavior or cached assets change, bump version in `scripts/version.js` (this also helps Service Worker cache refresh).

## Pull Requests
- Open a PR to `main`.
- Include a brief summary, screenshots (if UI), and a short “How to verify” section.
- Check the PR checklist (added via template) before requesting review.
- Keep PRs small. Large refactors should be split.

## Coding notes
- Front-end: Vanilla HTML/CSS/JS. Avoid heavy dependencies.
- i18n: Pages usually have a minimal i18n map; please keep zh/en keys in sync.
- PWA/Cache: If you change user-visible assets or network logic, bump `window.__VERSION__` in `scripts/version.js` to force clients to refresh caches.
- Contest data:
  - Submissions are stored under `submissions/week-<n>/<handle>/solution.c`.
  - We now store encrypted JSON (v3) as file content. The leaderboard script decrypts content to compute byte length.
  - Do NOT manually edit participants’ submission files unless performing a mechanical/admin task.
- Ranking scripts:
  - `scripts/compute_ranks.mjs` generates `competition/data/week-*.json` and `total.json`.
  - It detects v3 encrypted files and decrypts to compute original bytes.

## Local workflow
```bash
# one-time
git clone git@github.com:ChenyuHeee/c.git
cd c

# new work
git checkout -b feat/some-change
# ...edit files...

# keep branch fresh
git fetch origin
git pull --rebase origin main

# resolve conflicts if any, then push
git push -u origin feat/some-change
```

## Dealing with push rejection (non fast-forward)
Prefer the safe route:
```bash
git fetch origin
git pull --rebase origin main
# fix conflicts -> git add <files> -> git rebase --continue
git push
```
Only force if you truly intend to overwrite remote history:
```bash
git push --force-with-lease
```

## Reviews
- At least one review is recommended for non-trivial changes.
- Use CODEOWNERS for default reviewers.

## Releasing
- Update `scripts/version.js` (version + date) and `CHANGELOG.md`.
- After merge to `main`, Pages will update automatically; Service Worker will refresh with the new version.
