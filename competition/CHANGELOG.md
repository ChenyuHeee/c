# Competition Changelog

## 0.0.1 (初始版本 / Initial)

### Pages
- `competition/index.html`: Weekly challenge hub with bilingual (zh/en), links to week 1 problem & leaderboards.
- `competition/1.html`: Week 1 problem (diamond pattern). Includes:
  - Input & Output Format sections.
  - Collapsible sample inputs/outputs (two sets) with i18n toggle labels.
  - Submission & ranking rules.
  - Quick local test button linking to editor.
- `competition/rank/1.html`: Week 1 leaderboard (fetches `competition/data/week-1.json`).
- `competition/rank/index.html`: Overall leaderboard aggregated from per-week JSON.
- `competition/submit.html`: Generated contest submission landing page from share modal (#contest payload).

### Data & Scripts
- `competition/data/week-1.json`: Placeholder leaderboard JSON (auto-populated by CI).
- `competition/data/total.json`: Aggregated totals placeholder (auto-populated by CI).
- `scripts/compute_ranks.mjs`: Node script calculating per-week and total rankings.
- `scripts/compute_rank.js`: Wrapper launcher for environments expecting .js.

### Workflow
- `.github/workflows/compute-rank.yml`: CI job computing leaderboards on push / schedule.

### Share Modal Enhancements
- Added contest participation section with problem code input (e.g. `week-1`).
- First-time participant profile collection via `DataCollect.html` (stored in `localStorage.contest_profile`).
- Submission opens `competition/submit.html` with prefilled code & GitHub create file link.

### i18n Additions
- Contest navigation link in main editor header (`contest_nav`).
- Contest modal strings (submit, code placeholder, first-time info, errors, copy feedback).
- Sample section toggle labels (`sample_toggle_expand`, `sample_toggle_collapse`).
- Input/Output format titles & descriptions.

### UX Notes
- Collapsible samples default hidden; toggle preserves state only during current view.
- Leaderboard pages fall back to loading message if JSON empty or fetch fails.
- Contest submission payload uses `#submission=` base64 JSON for portability.

### Ranking Rules (Week 1)
- Primary: byte length ascending.
- Tie-break: earlier commit time.
- Aggregation: best (minimum bytes) + count of participated weeks.

### Known Future Enhancements (Not in 0.0.1)
- Multiple weeks (`week-2`, etc.) expansions of script `WEEK` env.
- Hash/integrity check for contest submissions.
- Additional statistics (average bytes, rank progression).
- Persistent expand/collapse state for samples.

---
Generated on: 2025-11-06
