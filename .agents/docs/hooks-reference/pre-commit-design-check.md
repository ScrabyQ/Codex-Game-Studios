# Design and data checks before an authorized commit

Use the explicit `PreToolUse` adapter with the exact proposed commit command. No Git hook is installed by this guide; a passing check is not authorization to commit.

The `validate-commit.sh` backend inspects staged data, including bytes a combined add/commit proposal would stage. It checks design completeness and data syntax without claiming substantive design approval.

## Checks

- Resolve workflow before checking `design/gdd/`. Full workflow requires Overview, Player Fantasy, Detailed (including its documented alias), Formulas, Edge Cases, Dependencies, Tuning Knobs and Acceptance Criteria. Standard checks the five-section core: Overview, Detailed, Edge Cases, Dependencies and Acceptance Criteria. Apply the backend's minimal/per-system handling; do not impose the full template on unrelated design documents.
- Validate affected JSON using an available Python 3 parser. Name malformed files and the staged/working source checked. An absent interpreter or unavailable staged input is a skipped/unassessed check, never clean syntax.
- Preserve registry identifiers and cross-references. Section presence is only structural evidence; meaningful dependencies, formulas and design consistency require the corresponding review Skills.
- Capture actual diagnostics and exit code. Some backend findings are advisory warnings returning zero; do not describe those warnings as enforced prohibitions.

See [hook payloads](hook-input-schemas.md) and [workflow modes](../workflow-modes.md). Keep execution output outside tracked product files.

## Handoff

Missing GDD sections need the owning designer; invalid data needs its author/tools-programmer. Review a concrete correction within authorization, then repeat the relevant check. No absent artifact, skipped interpreter or fluent response establishes completion.
