# $test-setup — Phase 2: Present Plan

> Part of `$test-setup`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 2: Present Plan

Based on the engine detected and the existing state, present a plan:

```
## Test Setup Plan — [Engine]

I will create the following (skipping any that already exist):

tests/
  unit/           — Isolated unit tests for formulas, state, and logic   (Godot only)
  integration/    — Cross-system tests and save/load round-trips         (Godot only)
  smoke/          — Critical path test list (15-minute manual gate)
  README.md       — Test framework documentation

[Unity/Unreal: unit and integration tests go under the engine's test root
 instead — Unity Assets/Tests/EditMode|PlayMode/, Unreal
 Source/<Module>/Private/Tests/ — because neither compiles code in tests/]

production/qa/
  evidence/       — Screenshot and manual test sign-off records

[Engine-specific files — see per-engine details below]

.github/workflows/tests.yml  — CI: run tests on every push to main

Estimated time: ~5 minutes to create all files.
```

Present the proposed files, preserving existing files without overwriting them. Proceed when this work is already authorized and allowed by the host. If an action or material choice remains unauthorized or unresolved, present the reviewable plan and wait for the answer. Automation modes may guide routine decisions and logging but do not grant or revoke authorization.

---
