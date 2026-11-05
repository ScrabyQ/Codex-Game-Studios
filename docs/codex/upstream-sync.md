# Reviewed upstream synchronization

The fork has two long-lived branches: `main` is **Codex Game Studios** (the default branch), while `source/ccgs-main` mirrors the original [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) `main`. `upstream` is a Git remote configured separately in each clone; `upstream/main` is its local remote-tracking ref. The mirror is for reference and source comparison, not for development or direct merges into the Codex `main`. Do not use GitHub's **Sync fork** button to merge upstream changes into the default branch.

## Source branch mirror

To update `source/ccgs-main` **manually** from a clean clone with the `upstream` remote configured, run:

```powershell
git fetch upstream main
git switch source/ccgs-main
git merge --ff-only upstream/main
git push origin source/ccgs-main
git switch main
```

For the first local checkout of the mirror, replace `git switch source/ccgs-main` with `git switch --track origin/source/ccgs-main`. The fast-forward-only merge refuses rewritten or divergent upstream history; inspect such cases instead of forcing a push. This updates only the mirror in your fork; it does **not** update the Codex adaptation. No scheduled mirror updater is installed. The Codex sync commands below read `upstream/main` directly, so keeping the mirror current is helpful for GitHub browsing but not required for change detection.

## Review and adapt changes

The on-demand commands replace the background behavior of the preserved `.claude/hooks/update-check.sh` helper. They install no scheduled updater and never push, commit or merge into the current branch. Git and Node are required. Fetch updates only the local remote-tracking ref; remote writes require existing explicit authorization.

```powershell
node scripts/codex/check-upstream.mjs --fetch
node scripts/codex/sync-upstream.mjs --dry-run
node scripts/codex/sync-upstream.mjs --prepare
```

`check-upstream` and `--dry-run` print deterministic JSON for the currently fetched ref; `--fetch` is optional on either command. A fixed ref and unchanged checkout produce identical reports. Reports classify changed, added and deleted agents, Skills and their resources, hooks, rules, templates, declarations and other files. They include exact baseline/upstream commits, old/new Git blob hashes and modes, registered source-to-target mappings, affected migration entries marked PENDING and generated target drift. New files without mappings remain visibly PENDING; deletion never silently removes a target. Changes to `.claude/settings.json` invalidate the associated declaration entries. Renames are deliberately represented as deletion plus addition.

The baseline comes from `docs/codex/active-baseline.json` (`source_commit`) when present, otherwise the migration manifest. Reports include that descriptor's state, reconciliation metadata and PENDING migration IDs. An unchanged upstream with reconciliation in progress reports `RECONCILIATION_PENDING`; `NO_UPSTREAM_CHANGES` alone never means every adaptation is accepted. `--baseline <full-SHA>` permits explicit comparison, not acceptance or promotion. Rewritten upstream history is refused. `--remote` and `--ref` default to `upstream` and `main`. Duplicate or malformed options are refused before fetch or preparation. Derived targets whose `sources` include a changed path are included alongside direct mappings.

Preparation creates a **new** branch `codex/sync-<SHA12>` and checkout `.codex/worktrees/sync-<SHA12>` from committed HEAD. It performs `git merge --no-commit --no-ff <exact-SHA>` there and honors the user's Git hook configuration. It writes `docs/codex/upstream-proposal.json` exclusively in that checkout. Existing branch/worktree/proposal paths are refused rather than replaced. Custom `--branch` and `--worktree` are available; nested paths must be Git-ignored, including case variants on Windows. Dirty edits in the original checkout are reported and remain there; they are not included in the new checkout or copied over generated files.

Exit 0 means the check or preparation succeeded, **not that adaptation passed**. Conflicts remain staged as conflicts, are listed in the report and return Git's nonzero exit (normally 1). Other refusal returns 2. Inspect the retained worktree, resolve each conflict explicitly and review the diff. To abandon only its uncommitted merge, run `git merge --abort` **inside that worktree**. The original checkout is unaffected; the proposal remains as an untracked review artifact. No cleanup or recursive deletion is automatic. A repeat preparation whose upstream commit is already in HEAD reports `NO_OP_ALREADY_IN_HISTORY`; stale adaptation status can still require reconciliation.

## Reconcile before approval

1. Review the proposal and every source change, including deleted components and declaration changes. Retain the initial snapshot as historical evidence; a new SHA is not a successful migration.
2. Reconcile the active inventory and manifest through the reviewed baseline workflow. Changed/new entries and affected declarations start PENDING. Carry forward acceptance only for byte-identical source; retain previous evidence as history and explicit retirement records for deleted entries.
3. Inspect each source-bound overlay. Rebase its transformations against the new source deliberately; never merely change its expected hash. Keep existing generated-target hashes as overwrite guards. Manual drift requires explicit review; neither sync command invokes generation or overwrites targets.
4. Run `node scripts/codex/inventory.mjs --check`, `node scripts/codex/generate.mjs --check --complete`, `node scripts/codex/validate.mjs` and affected behavioral suites after finalization. During pending reconciliation the finalizer uses its explicit pending preflight; ordinary CI refuses pending state. Review count changes against the new inventory instead of editing historical counts to make validation green. Do not claim new components supported until their tests and evidence exist.
5. Review all source, overlay, manifest and evidence diffs. Commit and push only within the user's authorization, to the user's fork, then open a draft PR for review. Never force-push, automatically choose `theirs`, merge into main automatically or publish a release.

The central reconciliation CLI is `node scripts/codex/reconcile-upstream.mjs prepare --root <worktree> --plan <relative-plan.json>`, followed after reviewed regeneration and fresh evidence by the same command with `finalize`. The separate plan requires `schema: 1`, `reviewed: true`, exact `old_sha`/`new_sha`, and exhaustive `changes` with source path, old/new content SHA256, `decision: "REBASE"`, evidence paths and targets with their old content SHA256. Hook declaration changes also require exhaustive `hooks` entries with ID, `decision: "REVIEW"` and evidence. Git blob hashes in the detection proposal are not content SHA256; candidate inventory supplies those independently. Prepare archives the prior inventory, migration matrix and generation registry, marks affected entries PENDING and stages the active descriptor. `generate.mjs --reconcile --targets ...` is limited to explicitly reviewed targets and preserves their existing hash guards. Ordinary validation cannot accept a pending reconciliation. Additions/deletions currently require explicit human onboarding/retirement; central preparation refuses them with guidance while check/sync retain their full proposal. Do not bypass that refusal by dropping changed entries from a plan.

`node scripts/codex/upstream-tests.mjs` exercises local fixture repositories, including actual fetch, a changed Skill and hook, addition/deletion, dirty target preservation, an uncommitted isolated merge, deterministic dry-runs, a no-op repeat and an explicit recoverable conflict. Fixtures and run output are temporary or ignored; see [testing](testing.md).

The active descriptor uses exactly `state: "active"` or `state: "pending"`. Reconciliation plan changes require `old_mode` and `new_mode`; source-bound overlays require `overlay: {path, sha256}` for the reviewed rebased bytes. Finalization checks complete generation coverage and current source/target mappings. Review each affected hook declaration separately. Keep transient review inputs and rollback data outside the tracked product; a support disposition alone does not establish behavioral parity.
