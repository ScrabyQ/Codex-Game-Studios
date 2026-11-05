# Code checks before an authorized commit

The explicit `PreToolUse` adapter dispatches `validate-commit.sh` for an exact proposed commit. This document does not install an automatic Git hook or authorize a commit.

## Scope and checks

Resolve the code root using [code-root-resolution.md](../code-root-resolution.md): Godot `src/`, Unity `Assets/`, Unreal `Source/<Module>/`. An unresolved root is a named skipped check; never scan a guessed `src/` and report success.

Inspect staged source and relevant working bytes included by the proposed command. The backend's finite scans flag possible hardcoded gameplay values (damage, health, speed, rate, chance, cost, duration) and unowned TODO/FIXME/HACK markers. Use data files for tunable values and `TODO(owner)` form for actionable follow-up. Code-type matching must include relevant C#/C++ paths rather than silently checking only Godot.

These scans are observations, not a complete correctness, style, documentation or complexity review. Advisory exit-0 warnings do not prohibit a commit. Missing interpreters, inputs or root resolution must be surfaced rather than represented as zero findings.

Use `$code-review` for architectural/domain assessment and the real engine parse/build/test commands for executable evidence. Apply selected path rules and pinned engine references before corrections.

## Handoff

Send a concrete issue to the owning programmer, or lead-programmer for architecture conflicts. Preserve unrelated staged and working edits. Re-run only the checks affected by the authorized correction; retain unresolved findings and unassessed scope.
