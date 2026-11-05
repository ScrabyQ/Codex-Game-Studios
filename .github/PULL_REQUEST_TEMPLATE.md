## Problem and resulting behavior

Describe the concrete issue, the final change, and a useful before/after example.

## Validation

List checks actually run and their results. Distinguish static structure,
helper/backend execution, and an actual model/client run. State missing runtime,
visual, independent-review, or native-hook evidence.

## Checklist

- [ ] Scope is focused and unrelated changes are preserved
- [ ] Native skills use `.agents/skills/<name>/SKILL.md` with `name` and `description`
- [ ] Role TOML preserves required fields, ownership, and tool ceilings
- [ ] Configuration precedence, diagnostics, and rigor expansion are preserved
- [ ] Relevant docs and examples describe actual host capabilities
- [ ] Explicit proposal and post-write checks were used where applicable
- [ ] `node scripts/codex/ci.mjs` passes, or failures are explained
- [ ] Secrets and generated runtime evidence are excluded

Mark items that do not apply as such in the description. A successful helper
check does not establish model behavior or automatic native hook activation.
