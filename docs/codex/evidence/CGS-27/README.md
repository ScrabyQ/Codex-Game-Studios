# CGS-27 — actual engine fixture matrix

The Godot fixture completed the scoped onboarding → brief/design → story → implementation → QA/closure workflow. Unity and Unreal remain **MANUAL/PENDING** where the installed environment cannot run the required checks. No engine success is inferred from source inspection.

| Engine | Pin / observed installation | Code and content roots | Actual result | Story |
|---|---|---|---|---|
| Godot | 4.7.2 / 4.7.2.stable.steam.ed1daf0bf | GDScript src/, scenes/, tests/unit/ | Import0, explicit parse0, eight logic assertions0; non-headless Windows/OpenGL RTX3060 run0; three retained PNGs opened | Complete,5/5 scoped criteria |
| Unity | 6000.3.26f1 on repository6.3LTS line / no editor found in scanned Hub directory | C# Assets/Scripts/ planned; actual editor-generated project absent | Explicit editor probe ENOENT, no process exit code. No compile/test/player/render claim | Blocked |
| Unreal | Requested5.8.3 from repository latest-hotfix reference / installed5.8.0, CL55116800 | C++ Source/TP_Blank/; Blueprint/map assets Content/ | UBT reached actual SDK validation, exit6: required Windows SDK10.0.19041.0 absent. Model/test drafts uncompiled; no UI/map/render claim | Blocked |

The broad source reference pins UE5.8; its latest-hotfix entry is5.8.3. This fixture deliberately retains5.8.3 as its requested patch and records installed5.8.0 separately. No reference or global engine setting was changed. Unity discovery is bounded to the standard configured Hub editor location and explicit executable probe; it does not prove no executable exists anywhere on the machine.

## Evidence

- [engine-matrix.json](engine-matrix.json): commands, versions, statuses, known limits.
- [onboarding.json](onboarding.json): actual selected-root project-state, set-stage/config-set readbacks, config resolution; no six rigor-fronted knobs seeded.
- [versions.json](versions.json): real Godot version output, installed UE Build.version, Unity editor directory inventory, unchanged source-reference hashes.
- [godot-test-red.json](godot-test-red.json): actual test-first failure, exit1 because the model did not exist.
- [godot-import.json](godot-import.json), [godot-parse.json](godot-parse.json), [godot-test.json](godot-test.json), [godot-run.json](godot-run.json): actual engine commands, timestamps, exit codes, stdout/stderr and exact source/test hashes.
- [visual-observations.json](visual-observations.json), [freshness.json](freshness.json): opened PNGs, SHA-256,800×480 dimensions, actual source review-receipts check with all paths UNCHANGED.
- [scope-before-close.json](scope-before-close.json), [git-baselines.json](git-baselines.json): isolated fixture Git baseline/status/diff, actual authors, no nested .git.
- [final-state.json](final-state.json): Godot Complete, Unity/Unreal Blocked; coarse granularity readback and five criteria.
- [unreal-build-default-runtime.json](unreal-build-default-runtime.json): direct UBT initially failed2147516547 because no system .NET runtime was registered.
- [unreal-build.json](unreal-build.json): process-local installed bundled.NET10 enabled UBT; actual SDK failure6 remained. Earlier bundled/UBA result is preserved separately.
- [cli-guards.json](cli-guards.json): unknown/duplicate/incomplete CLI refusal, explicit/env override ENOENT, template exclusions.

Actual retained screenshots, captured by the game viewport after rendered frames and opened with view_image:

| Ready | Empty | Reset |
|---|---|---|
| [01-ready.png](../../fixtures/cgs27/godot/production/qa/evidence/story-001-charge-hud/01-ready.png) | [02-empty.png](../../fixtures/cgs27/godot/production/qa/evidence/story-001-charge-hud/02-empty.png) | [03-reset.png](../../fixtures/cgs27/godot/production/qa/evidence/story-001-charge-hud/03-reset.png) |

Ready shows3/3 and “Ready to send”; empty shows0/3, amber “Out of charges” and disabled Spend; reset restores3/3. Text and controls fit the viewport. Input is explicitly **synthetic Input.parse_input_event injection inside the engine**, not a physical mouse/keyboard/gamepad session or human playtest. Capture-on-trigger follows the repository run-and-observe alternative and official [Viewport](https://docs.godotengine.org/en/stable/classes/class_viewport.html) and [Input](https://docs.godotengine.org/en/stable/classes/class_input.html) APIs. No image was generated or edited.

## Workflow fidelity and limits

The authorized fixture premise supplies a clear small concept, engine choices, minimal rigor and guided automation; these are test design decisions under the enclosing task, not fabricated human answers. Initial project-state reports unknown code root explicitly. Each engine gets project.yaml, a brief, a quick spec and one coarse story tied to MVP1. The minimal epic and build order are explicit; no existing story is replaced or renumbered. Stage stays Concept; no quality gate is inferred from source counts.

Godot gameplay capacity lives in assets/data/charge.json and copy in localization/en.json. The UI calls a separate typed charge model. The test was written and run before the model, then the implementation was imported, parsed, tested and rendered. A standalone SceneTree test runner is used because CGS27 explicitly requires actual testing; gdUnit4 was not installed or claimed. UI evidence is mandatory even at minimal QA. Prototype work is outside src/ and Godot prototypes/.gdignore prevents import; export docs clearly mark absent presets, SDKs and packaged builds PENDING.

The record is **actual in-session Codex host work**, not a separately spawned native skill/agent suite. Programmer, engine specialist and QA review are sequential/self review. Native custom-role loading and independent review remain PENDING; resolved solo review gates are skipped, not impersonated. Physical usability, feel, other resolutions, translation expansion and accessibility are unassessed. The five scoped criteria are initial state, consumption/empty state, reset, visual layout and no underflow.

Two preparation corrections are retained honestly: initial baseline creation failed because the metadata parent directory did not exist and was resumed with baseline.mjs; the original materializer put In Progress after code writes, and was corrected to set it before writes on replay. Actual engine QA saw In Progress; closure only followed fresh evidence and opened screenshots. Final source-format review split the already-executed no-underflow case into a fifth criterion to satisfy coarse5–10 and added explicit MVP/epic linkage, without changing tested code or screenshots. These scripts materialize this host-authored workflow; running them is not a new model judgment.

## Local Git and third-party template packaging

The three fixture baseline commits use the configured repository identity, observed here as ScrabyQ <scraby2016@yandex.ru>. Scripts inherit name/email using per-command Git configuration; no consumer identity is hardcoded. Metadata lives in ignored evidence/CGS-27/.local-git, outside fixture worktrees. Fixtures contain no .git marker, so the root repository stages ordinary files rather than gitlinks. No root commit, push or remote change was performed by this task.

Unreal's installed TP_Blank template is copied unchanged as a **local test input**. Its original engine copyright/provenance is retained, but its Config/, .uproject, module boilerplate and target/build files are **ignored and not redistributed** under this adaptation's MIT license. Only our ChargeModel.h/test, documentation and preparation logic are packaged. [unreal-template-provenance.json](unreal-template-provenance.json) lists all11 local template paths and source hashes.

On a fresh clone, restore those inputs from the user's own installation before an Unreal build:

```powershell
node docs/codex/evidence/CGS-27/prepare-unreal-template.mjs --engine-root "C:/Program Files/Epic Games/UE_5.8"
```

The preparer refuses a differing existing template file. It does not download engine material, fabricate a .uproject, invoke the new-project wizard, or edit binary .uasset/.umap files. Unity gets no fake ProjectSettings/ProjectVersion.txt, scene or executable.

## Opt-in reproduction

Run from the repository root against the retained fixture files:

```powershell
node scripts/codex/engine-e2e.mjs --engine godot --phase import
node scripts/codex/engine-e2e.mjs --engine godot --phase parse
node scripts/codex/engine-e2e.mjs --engine godot --phase test
node scripts/codex/engine-e2e.mjs --engine godot --phase run
```

For another installation use --exe PATH, or CGS_GODOT_EXE / CGS_UNITY_EDITOR / CGS_UNREAL_UBT. Priority: --exe, environment, tested default. Unreal bundled.NET is derived beside the selected UBT installation; CGS_UE_DOTNET_ROOT can select another installed runtime. CLI arguments are strict: unknown flags (including --dry-run), duplicates and missing values fail2 before an engine process. There is no implicit dry-run flag.

Unity --phase probe and Unreal --phase build are opt-in. Engine failures/PENDING return1; successful command checks return0. A process PASS is not new visual approval: open the resulting images and verify source freshness before any new story closure. Re-running prepare.mjs on retained fixtures intentionally refuses overwriting them; it is the original fixture-construction recipe, not the ordinary test command.

Unreal uses -NoEngineChanges, -NoHotReloadFromIDE, bounded timeout, process-local runtime variables and -NoUBA. **Observed limitation:** UBT5.8 starts a global trace before executor selection and writes/backs up user-AppData UnrealBuildTool/Trace.uba even with APPDATA/LOCALAPPDATA redirected and NoUBA. The logs disclose this cache write; no cleanup/deletion was attempted. No Engine source or user game project was modified, and no SDK/editor installation was performed. No further build attempt is needed until prerequisites change.

All launch helpers use windowsHide; no console helper window is requested. No external message, publish, deployment, package export or next Goal is performed by these fixtures.
