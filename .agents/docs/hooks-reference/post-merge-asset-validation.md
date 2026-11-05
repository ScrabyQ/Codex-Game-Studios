# Asset validation after an authorized merge

This is an explicit workflow, not an installed post-merge Git hook. A merge requires its own authorization. Identify the actual compared revisions and changed asset paths; a missing ref or an ambiguous diff is NOT ASSESSED, not “no assets changed”.

## Observe assets

Resolve the engine's asset root and the art bible's naming/size policies. Use the registered helper:

```powershell
node scripts/codex/helper.mjs asset-scan --root . --engine godot --files
```

The example selects Godot; use the resolved engine. Supply actual project budgets using supported options such as `--budget texture=4M`, `--max-dim`, `--sample-rates` and `--name-regex`. Budget precedence is extension, then type, then all; a file exactly at the limit remains in budget. Do not invent policy from a filename.

Preserve these dimensions in the review:

- Naming against the configured convention; lowercase/underscores are a Godot default, not a universal Unity/Unreal rule.
- Texture dimensions and power-of-two requirements when the project actually requires them. Unsupported formats or missing tools remain named unassessed checks.
- File sizes against the art bible. Example budgets such as 4 MB textures, 10 MB music and 512 KB SFX illustrate category-specific limits; they are not automatic project settings.
- Audio format/sample rates, orphaned assets and missing source references where the helper supports assessment.

The helper emits observations, check status and hits. An unrun check uses a missing result, never zero hits. `$asset-audit` applies policy and produces its verdict. No changed assets means that scope is N/A, not a claim that all project assets passed.

## Handoff

Naming policy questions go to art-director; size/format optimization to technical-artist. Use available authorized delegation or disclose an in-session review. Store run artifacts in ignored/temporary storage or CI, preserving source assets until a correction is authorized.
