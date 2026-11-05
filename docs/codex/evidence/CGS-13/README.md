# CGS-13 architecture skill migration evidence

Five source-bound overlays adapt 30 skill/resource files. The parent generator owns the generated targets and central registry. This task changed no upstream source, central manifest, Git history, or external service.

## Scope and observed results

| Skill | Actual behavioral exercise | Result and limit |
|---|---|---|
| create-architecture | Host followed generated skill to update only the fixture layer map and document status; version 2 → 3, Save → Foundation | EQUIVALENT scoped update; unrelated sections byte-identical. TD-ARCHITECTURE and LP-FEASIBILITY skipped — Lean mode. Full architecture authoring and independent gates PENDING. |
| architecture-decision | Host authored Proposed ADR, checked dependency/status observations, explicitly accepted the scripted choice, accepted a replacement before superseding its predecessor | EQUIVALENT scoped lifecycle. Date/body/history preserved; matching story alone unblocked; stale governing story later blocked. Separate Proposed-prerequisite acceptance refused without writes. Full native lifecycle and retrofit scenarios PENDING. |
| architecture-review | Host read real fixture artifacts and ran graph, registry, Markdown and receipt helpers; preserved TR-health-001 and retired TR-health-002, registered next TR-save-001 | EQUIVALENT scoped coverage diagnostic, verdict CONCERNS. Proposed coverage is not Accepted coverage; missing tests are not passing tests. Full independent review and engine assessments PENDING. |
| create-control-manifest | Host extracted rules from the two Accepted ADRs and excluded Superseded ADR-0002 | EQUIVALENT accepted-only preview and prerequisite guard. Final Active publication is deliberately PENDING because the current review has CONCERNS; no final control-manifest.md exists. |
| reverse-document | Host stopped on the 4-line stub; authored a minimal per-system health brief from actual substantive code, retaining unknown intent/provenance and source bytes | EQUIVALENT host fallback. Native CLI also inspected the stub and correctly refused document creation with zero mechanics/formulas/tuning values and the design-system handoff. Native bootstrap remained PENDING due Windows process errors. |

“Host” means this actual Codex session used its file and command tools in an isolated fixture. It is **not independent review**, and it is not a claim that an autonomous test runner invoked the five skills. The assertions only inspect already-authored artifacts. Synthetic scripted choices exercise approval-dependent transitions without claiming real game ADR approval or live human-question UX coverage. Parent authorization covers these fixture operations, including the scoped registry append; no real project architecture was accepted.

## Reproducible checks and records

Run from the repository root:

```powershell
node docs/codex/evidence/CGS-13/check-host-artifacts.mjs
node scripts/codex/native-smoke.mjs --case scripts/codex/cases/cgs13-reverse-thin.json --model gpt-5.6-luna --output docs/codex/evidence/CGS-13/native-reverse-thin.json
```

The first command passed 12 assertion groups, including a separate structural comparison of all 30 generated files with source-bound plans. It does not regenerate behavioral artifacts. `--live` additionally checks the retained scratch fixture. `fixture-inputs.json` preserves initial bytes and scripted choices; `snapshots/` preserves intermediate lifecycle artifacts; `artifacts/` preserves final portable outputs; `helper-observations.json` contains actual commands, exit codes and output. Helper output is observation, not a verdict. The final project rigor is restored to standard after the minimal reverse-document exercise; the minimal resolution is retained in helper observations.

`native-reverse-thin.json` records Codex CLI 0.148.0, explicit model selection gpt-5.6-luna (not independent attestation of the serving model), prompt, input hashes, tool trace and no-write assertion. `native-review.json` records semantic review beyond the harness's substring assertions. Actual source/config reads succeeded after intermittent process errors; the bootstrap did not execute successfully and was disclosed as PENDING. The initial invalid harness option combination was rejected before model execution, then corrected to workspace-write plus `no_writes` assertions and automatic review; no trust registry, global configuration or sandbox bypass was used.

The remaining four `scripts/codex/cases/cgs13-*.json` cases are prepared **but not run**. They are not positive behavioral evidence. `prepare-fixture.mjs` creates only inputs; `prepare-cases.mjs` creates only cases. Do not rerun input preparation over recorded evidence to imply another behavioral run. Original `studio-tests/skills/{authoring,review,pipeline,utility}` specifications informed the scenarios, but their complete test matrices were not executed.

## API and workflow substitutions

- `.claude/{skills,docs,scripts,hooks}` → generated `.agents` mirrors; role references → `.codex/agents/*.toml`. Source-bound hashes and exact anchors protect transforms.
- Shell interpolation → explicit bootstrap commands. Read/Glob/Grep/Edit/Write examples → available file tools and rg with the original scopes; tool ceilings remain ceilings, never grants.
- AskUserQuestion → available native questions, or the same numbered plain-text options with an actual wait. Existing authorization persists; unanswered required choices are not consent.
- Agent/subagent_type → actual supported native role or actual generic child with the full role brief. In-session fallback is labeled not independent and cannot satisfy fresh independent review requirements.
- Required deterministic graph and receipt operations remain real helper executions. Unavailable operations are NOT ASSESSED, never an empty clean result.
- Supersession is an explicitly authorized transition after replacement acceptance. Retrofit remains append-missing-only; no source ADR body is silently rewritten.

## Pending verification

Full independent director/specialist review, native custom-role loading, native positive ADR lifecycle, Active manifest publication after a passing review, reverse-document architecture retrofit/acceptance, all rigor branches and all upstream scenario matrices remain PENDING. No game engine, performance test or game implementation was run. The synthetic artifact review correctly retains CONCERNS rather than declaring the fixture production-ready.
