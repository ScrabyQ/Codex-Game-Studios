# CGS-29 upstream synchronization evidence

The original upstream remains `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`. No upstream writes, force push, reset, automatic main merge or publication occurred. The tooling performs only an explicit fetch and, for preparation, creates a new branch/worktree with an uncommitted merge. This task's tests use retained local repositories under `.codex-tmp`.

## Actual runs

- `node scripts/codex/upstream-tests.mjs` — exit **0**, with detailed subprocess commands, SHAs and assertions in [tests.json](tests.json). Actual changes to one Skill and hook were detected; added role/deleted rule were also accounted for. The isolated merge kept the committed Codex overlay, reported the separate unstaged target drift and preserved the original checkout's dirty state and HEAD. Two dry runs were identical. A second preparation after source integration was a no-op. An intentional conflict returned **1**, remained reviewable, and `git merge --abort` restored that isolated checkout's pre-merge HEAD.
- `node scripts/codex/check-upstream.mjs --fetch` — exit **0** against the actual configured upstream on 2026-11-05; baseline and fetched upstream both `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`, HEAD `07459ca8738174167bd0c13444139443a8c40645`, no upstream changes, no generated target drift. Concurrent uncommitted adaptation work was reported and retained.
- Explicit `PreToolUse` first failed because sandboxed Git Bash could not create its named object. The same check through authorized host execution exited **0**. File-path checks and the test-command check also exited **0**. This does not establish native hook activation.

Two preliminary fixture runs failed honestly: Windows `autocrlf` converted the expected overlay bytes; then the minimal fixture lacked the real repository's worktree ignore rule. The fixture now explicitly configures LF and includes the ignore rule. Production preparation also refuses any nested worktree destination not ignored by Git. Both failures informed the passing rerun; they are not acceptance passes.

Review regression rerun: `node scripts/codex/upstream-tests.mjs` exited **0** after adding Windows case-variant containment, duplicate/malformed option refusals, derived rule-index impact and active reconciliation-state reporting. The latest `tests.json` records these additional assertions and expected exit-2 refusals. Production merge honors configured Git hooks; the earlier implementation's per-command hook override was removed during review. Fixture-only commits use their isolated test configuration.

Independent review found that the first pending-state fixture used the wrong enum (`reconciliation-pending`) and therefore did not exercise the central descriptor's `pending` value. The report comparison and fixture were corrected. The rerun exited **0** with a descriptor validated by the shared `baseline.mjs` reader, active source equal to fetched upstream, zero source changes, report `RECONCILIATION_PENDING` and `reconciliation.pending: true`. This supersedes the earlier pending-state assertion; the original false assurance is retained here for audit.

## Boundaries

The check/prepare commands produce adaptation proposals, not acceptance verdicts. They do not regenerate targets, advance the active baseline, erase overlay drift, commit or publish. Reconciliation is separately reviewed; changed/new requirements are PENDING until verified. Deletions are reported without deleting targets. Native background update activation and hosted draft-PR creation are not implemented or claimed. Root-level documentation links and the migration entry for the old update-check helper are integrator-owned.
