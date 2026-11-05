# Migrating legacy configuration to project.yaml

This guide concerns a project's configuration data, not replacing studio
skills or roles. See [UPGRADING.md](../UPGRADING.md) for product upgrades.
New projects use `$start` and `project.yaml`; they need no legacy migration
and no upstream source checkout.

## Determine whether migration is needed

The adapted converter is `.agents/scripts/migrate-v1-config.sh`. It reads:

- `production/stage.txt`
- `production/review-mode.txt`
- `.agents/docs/technical-preferences.md`, when migrated keys contain real
  values rather than untouched template placeholders

It does not search other historical directories or automatically translate
arbitrary old layouts. If your data lives elsewhere, first identify and review
the mapping in a disposable copy. Do not overwrite an existing adapted file.

If both `project.yaml` and migratable legacy data exist, the converter
distinguishes three cases. Disagreeing values refuse migration. Agreeing values
with a migration report also refuse a repeated conversion and point to
finalization. Agreeing values without a migration report are treated as mirrors:
the command reports nothing to do and leaves them in place. Do not finalize
ordinary current-project mirrors merely because they exist. Reconcile genuine
conflicts explicitly; a refusal does not authorize replacing either side.
`$adopt` can help audit the project and its gaps.

## Preview, then convert

Use Bash from the repository root. The script resolves its own repository
location; inspect it before applying it to valuable data. Keep a backup or
reviewable working copy of your actual project configuration.

```bash
bash .agents/scripts/migrate-v1-config.sh --dry-run
```

Dry run previews the mapping and writes nothing. Review warnings, raw invalid
values, missing values, and custom sections before the write:

```bash
bash .agents/scripts/migrate-v1-config.sh
```

The default mode writes `project.yaml` and
`production/migration-report.md`, leaving legacy inputs in place. Review both
outputs. This guide documents the command; running it still requires the
applicable authorization and explicit proposal/post-write checks in the
[hook guide](codex/hooks.md).

## What is carried over

| Legacy value | Destination |
|---|---|
| Stage marker | `project.stage` |
| Review marker | `modes.review_mode` |
| Engine/language/rendering/physics | `engine.*` |
| Platforms/input/gamepad/touch | `platform.*` |
| Naming conventions | `naming.*` |
| Framerate/frame budget/draw calls/memory | `performance.*` |
| Test framework and minimum coverage | `testing.framework`, `qa.coverage_minimum` |
| Engine specialist choices | `specialists.*` |

Legacy review mode `none` becomes `solo`; the report calls out that rename.
Unknown enum values can be preserved raw for manual resolution, so successful
conversion does not prove that all settings are valid.

The converter does not invent rigor settings absent from legacy data.
Unspecified rigor defaults to `minimal`, a lighter process than the historical
fixed workflow. Decide whether to retain that default or explicitly choose
`modes.rigor: standard` after reviewing the report. Do not seed workflow,
review mode, QA level, document density, team size, or story granularity merely
to repeat rigor expansion.

A genuine migrated review choice is preserved as an explicit override and
therefore outranks rigor. To have rigor control review depth later, review and
remove that explicit setting within the authorized scope. With no legacy
review choice, the converter leaves review mode unset.

Forbidden Patterns and Allowed Libraries have no equivalent YAML fields.
Preserve their useful guidance in the technical preferences record; do not
assume conversion captured every custom section.

## Finalize deliberately

Only after comparing the inputs, report, and effective configuration, consider:

```bash
bash .agents/scripts/migrate-v1-config.sh --finalize
```

Finalize deletes the two legacy stage/review marker files after checking that
their values are represented in `project.yaml` (including `none` → `solo`).
It also checks the configured engine name when technical preferences exist.
These checks are narrow: they do not independently verify every migrated field.
Manually compare all fields and custom content before authorizing cleanup.

The technical preferences file is retained, including its Forbidden Patterns
and Allowed Libraries guidance. If verification fails, finalize refuses
cleanup; investigate the discrepancy rather than bypassing the refusal.

After migration, resolve effective configuration using allowed local
overrides, `project.yaml`, legacy mirrors, rigor expansion, and defaults as
documented in [configuration resolution](../.agents/docs/config-resolution.md).
Use `$settings` to inspect provenance and `$project-stage-detect`/`$adopt`
to assess the next work. A migrated stage marker is not a quality verdict.
