# Reviewed baseline reconciliation

The real active descriptor starts at the historical upstream commit `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`; no real baseline was promoted by these tests. Synthetic tests operate in disposable local Git clones. The original snapshot remains historical and is rechecked against the historical Git object after promotion.

An operator reviews a project-relative JSON plan of this shape:

```json
{
  "schema": 1,
  "reviewed": true,
  "old_sha": "<full active SHA>",
  "new_sha": "<full integrated upstream SHA>",
  "changes": [{
    "source": ".claude/skills/example/SKILL.md",
    "old_sha256": "<old content SHA256>",
    "new_sha256": "<new content SHA256>",
    "old_mode": "100644",
    "new_mode": "100644",
    "decision": "REBASE",
    "evidence": ["docs/review/example.md"],
    "overlay": {"path": "docs/codex/overlays/example.json", "sha256": "<reviewed rebased overlay SHA256>"},
    "targets": [{"target": ".agents/skills/example/SKILL.md", "old_sha256": "<registered target SHA256>"}]
  }],
  "hooks": [{"id": "hook:SessionStart:0:0", "decision": "REVIEW", "evidence": ["docs/review/hooks.md"]}]
}
```

Include every changed source and every affected existing hook declaration. The overlay entry is required when the existing Skill/helper overlay applies; it binds the intended reviewed rebased bytes, which may be written after preparation. Each target list must exactly match the existing registry. For a source with no overlay, omit the overlay field. The new commit must already be an ancestor of HEAD or be the active no-commit merge head. A same-SHA empty plan is a no-op.

Run `node scripts/codex/reconcile-upstream.mjs prepare --root . --plan docs/review/plan.json`. Preparation verifies hashes, modes, evidence, complete affected-target and hook coverage, and all old target bytes; archives the old inventory, migration matrix, registry, descriptor and exact reviewed plan under `docs/codex/reconciliation/<old>-<new>/`; then marks the new baseline and changed mappings PENDING. Normal CI and ordinary generation fail while PENDING.

After reviewing and writing the exact rebased overlay, explicitly regenerate only approved targets, for example `node scripts/codex/generate.mjs --family skills --names example --reconcile --targets .agents/skills/example/SKILL.md`; use `--family support` for a helper or hook target. Old target hashes are checked before writes, and unreviewed selections are refused. Record each changed file using `node scripts/codex/record-migration.mjs --source .claude/skills/example/SKILL.md --task CGS-29 --status EQUIVALENT --evidence docs/review/example.md --note "Reviewed against recorded tests"` and separately record fresh actual review/test evidence and a non-PENDING status for each affected hook declaration. Then run `node scripts/codex/reconcile-upstream.mjs finalize --root .`. Finalization verifies all generated families in `--check --complete` mode, recorded migration mappings, source and target hashes, reviewed overlay bytes, and fresh evidence before activating the baseline. Missing newly expected auxiliary targets require explicit onboarding. Structural checks do not certify behavioral parity.

When a shared derived target such as the rule index changes, unchanged source rows may still contain its former hash. Re-record each affected unchanged source explicitly with its existing reviewed status and appropriate evidence before finalization; stale recorded mappings are rejected rather than silently refreshed.

Added or deleted sources and hook declarations fail closed with onboarding/retirement guidance. Review the source, mappings, impact on preserved targets and historical records, and implement a dedicated explicit migration/retirement plan before retrying; do not delete generated files or alter counts merely to force a pass. No automatic source retirement or promotion is implied.

The fixture uses operator-supplied synthetic review records; they are not a model quality judgment. Native engine, editor, and independent behavioral tests remain separate.

After synthetic promotion, the fixture ran `node scripts/codex/ci.mjs --skip-reconcile` and exited 0. This explicitly selects every quick suite except the reconciliation fixture itself, avoiding recursive fixture creation; `post-promotion.json` retains its output and the synthetic SHA. The test derives its starting SHA from the active descriptor. Unsupported `--dry-run`, duplicate and incomplete options are rejected before work; a whole-fixture file/symlink snapshot confirmed no mutation in the negative cases. `--skip-reconcile` is for this bounded test; normal CI runs the reconciliation fixture.
