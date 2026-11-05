# Maintaining upstream imports

Normal use needs no upstream remote, source checkout, mirror branch or historical Git objects. Native files in `.agents/` and `.codex/` are maintained product sources. `validate.mjs` and `generate.mjs --check --complete` inspect them offline.

The original [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) is an optional maintainer source. `source/ccgs-main` is a reference mirror. Do not merge its tree into the product or use Sync fork on the product branch. Updating that mirror is a separate authorized operation; the tools below do not write it.

## Inspect changes

Git and Node.js are required. Add a missing remote once; inspect existing configuration instead of replacing it.

```powershell
git remote add upstream https://github.com/Donchitos/Claude-Code-Game-Studios.git
git remote set-url --push upstream DISABLED
node scripts/codex/check-upstream.mjs --fetch
node scripts/codex/sync-upstream.mjs --dry-run --source-ref refs/remotes/upstream/main
```

Fetch updates local tracking refs only. Select its remote and branch with `--remote` and `--ref`. Fetch separately: sync refuses `--fetch`. An external local source repository, including a bare repository, can be selected with `--source-repo <path> --source-ref <ref>`; it is read through Git objects without a checkout or remote writes.

Ref precedence is an explicit source ref, `source_ref` in `docs/codex/active-baseline.json`, then an available source mirror. A pinned baseline alone reports `SOURCE_UNAVAILABLE` because it cannot establish that upstream is current. The baseline commit is versioned configuration. Rewritten history is refused.

Output accounts for modified, added, deleted and renamed Skills, agents, rules, hooks, templates, declarations and other files. Each change is PENDING, including unknown transforms. Source file modes, blob/content hashes, mappings and target drift are reported. Settings changes also contain explicit old/new hook declaration data. An unchanged source does not accept an unfinished reconciliation.

## Prepare a product worktree

Start from a clean committed product whose target hashes match. Select a new branch and path:

```powershell
node scripts/codex/sync-upstream.mjs --prepare --source-ref refs/remotes/upstream/main --branch codex/source-review --worktree ../cgs-source-review
```

The worktree starts at product HEAD, with no source-tree merge. Protected main/mirror branch names, existing paths, dirty input, target drift and worktrees inside an external source repository are refused. Nested product worktrees must be ignored. The proposal goes only to the worktree's ignored `.scratch/upstream-proposal.json`. Exit 0 means preparation completed, not that adaptation passed.

## Reviewed reconciliation

Keep plans, rollback inputs and generated candidates in temporary or ignored storage. Do not track execution reports.

The schema 2 plan has `reviewed: true`, exact `old_sha`/`new_sha` and exhaustive `changes`. Each change includes old/new paths, blob/content hashes and modes, an `adapt`, `retain` or `retire` decision, and all affected targets. Each change also lists `overlays: [{path, old_sha256, new_sha256}]` (empty when none); apply checks the reviewed overlay bytes and their embedded source pins. A settings change must copy the proposal's exact `declarations: [{id, old, new, status: "PENDING"}]` for explicit review. Target actions are `retain`, `update`, `retire` or `add`, with exact old/new hashes; a nonexistent side uses `null`. Additions need `registration: {source, transform_ids}` (or explicit shared `sources`) and coherent native discovery, model policy, catalog and rule metadata. Shared targets need consistent decisions. Review must preserve useful local behavior when upstream removes its source.

```powershell
node scripts/codex/reconcile-upstream.mjs prepare --root <worktree> --plan <absolute-plan-path> --source-repo <source-repository> --source-ref <reviewed-ref>
node scripts/codex/reconcile-upstream.mjs apply --root <worktree>
node scripts/codex/reconcile-upstream.mjs finalize --root <worktree>
```

Replace placeholders with real paths and refs. Preparation guards source and target inputs, stores recovery material and leaves a PENDING baseline without editing native bodies. Make reviewed target edits before apply. Apply verifies their exact bytes and updates coverage/provenance; failed validation restores metadata. Retained generated targets without a current source become explicitly native-owned with retired provenance. New or affected source entries and declarations remain PENDING.

Existing source mappings to maintained Markdown or Node wrappers can appear as `ownership: "manual"` targets. Repeat that ownership and the exact old/new hashes in each reviewed retain, update or retire action. These targets must already be explicitly mapped; unknown manual additions require separate onboarding and are refused rather than silently accepted. Source renames preserve reviewed mappings. A retained manual target whose source was deleted is recorded in `retired_manual_mappings` with source commit/hash and a guarded target hash. Native validation and selected hash recording continue to protect it without requiring the historical source object.

Review those support dispositions using `record-migration.mjs --id <entry> --status <status> --review <review-summary> --root <worktree>`. A matching hash does not establish PORTED or EQUIVALENT behavior. An unsupported disposition needs a reason and impact. Finalize requires recorded review and native structural validation; run affected behavioral suites before it and full CI afterward.

The separate generator supports `skills`, `roles`, `references`, `support` and `rules` transformation families. To prepare candidates from a new tip before applying it, create its isolated inventory and pass that inventory explicitly:

```powershell
node scripts/codex/inventory.mjs --candidate <full-source-commit> --source-repo <source-repository> --source-ref <reviewed-ref> --output-dir <new-temporary-inventory-directory>
node scripts/codex/generate.mjs --root <worktree> --source-repo <source-repository> --source-ref <reviewed-ref> --source-inventory <inventory-directory>/upstream-inventory.json --candidate-dir <new-external-candidate-directory> --family skills --names <skill-name>
```

The selected commit must match the candidate inventory. Source reads, inventory hashes, existing product target hashes and overlay anchors remain guarded. Skill and role selections require `--names`. A separate `--overlay-root <staging-root>` may contain deliberately rebased overlays at their normal relative paths; it is allowed only with isolated candidate output. Review all outputs before adapting product files. Never repin an overlay merely to silence a refusal.

For deliberate ordinary native edits, `generate.mjs --record-native --targets <comma-separated-paths>` records selected hashes after review, refuses unrelated drift and restores metadata if validation fails. It preserves support status and provenance.

New native-authored Skills and roles use the separate `--register-native --targets <paths> --review <summary>` action after preparing coherent model policy, catalog, specs and references. Select all new Skill resources or role TOMLs explicitly. It records authored provenance without a source repository, historical object or migration row, and restores the registry if full native validation fails. See [contributing](../../CONTRIBUTING.md). Unknown targets remain refused by ordinary hash recording.

From the finalized worktree, run:

```powershell
node scripts/codex/validate.mjs
node scripts/codex/generate.mjs --check --complete
node scripts/codex/ci.mjs
```

Review the diff, license and real test results before an authorized commit, push to your own fork and PR. No automatic merge, force push or release is part of this workflow. Disposable importer, sync and reconciliation fixtures run in CI; [testing](testing.md) distinguishes them from engine or native-client checks.
