# CGS-17 QA workflow evidence

The eight source-bound overlays cover 20 generated files: eight Skills and twelve reference files. `traceability.json` records source, target, overlay and reference hashes, with the scope tested for each. The guarded generator check passed. These are **in-session role fallbacks, not independent reviews**; native Skill discovery and full behavioral equivalence remain PENDING.

The disposable fixture is `.scratch/cgs17-qa-118fe97f`. The actual Node runner executed the same regression test against two retained implementations: the buggy version failed (exit 1, 80 versus expected 90), then the fixed version passed (exit 0). A separate seeded-helper test passed. Both implementation files and the test file were checked for unchanged SHA-256 across that ordered run. This is real Node execution against a synthetic defect, not a Godot engine test. Complete TAP excerpts, exact commands and exits are in `runner-results.json`.

The fixture has no `project.godot`, gdUnit4 runner or CI workflow. The actual Godot test helper reported `ran no` and `godot:no-gdunit4`; although the observation helper itself exited 0, the test result is **NOT ASSESSED**. No engine install or Godot test execution is claimed. The UI story has no retained screenshot, so its required visual evidence is **MISSING/BLOCKING** under the observed standard defaults; the Node unit pass cannot replace it.

Actual configuration resolution exercised minimal, standard and full rigor, yielding the corresponding workflow and QA levels. A separate strictness fixture resolved Logic as advisory from `project.local.yaml` and UI as blocking from `project.yaml`. Minimal can waive eligible Logic/Integration/Config tests; it does not waive Visual/Feel or UI screenshots. See `qa-plan.md` for the scoped plan and missing evidence.

The test history produced PASS/FAIL/PASS with an intentionally toggled environment variable and unchanged test-file SHA-256. This is a **controlled simulation**, not evidence that a naturally flaky test exists. The source's fewer-than-three-run rule keeps a two-run case suspected; the third controlled result produces a 1/3 failure-rate example, but no quarantine was performed.

The 30-minute protocol in `soak-protocol.md` has the source's T+0, T+10, T+20 and T+30 checkpoints. No session or measurements were run; its result is **NOT ASSESSED**, not PASS. The fixture exercises representative paths only: independent reviews, native Skill execution, installed engine test frameworks, actual UI capture and a complete soak remain PENDING.

Project PreToolUse and PostToolUse guards both exited 0 for the authorized overlay and fixture writes. No project source or config outside the disposable fixture was changed.
