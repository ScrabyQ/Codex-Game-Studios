# CGS-15 implementation and evidence

Source snapshot: `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`. Five source-bound overlays preserve the implementation, close, review, debt and profiling procedures. All 14 generated targets, including the two explicit-only `agents/openai.yaml` policy files for dev-story and story-done, match their source-bound plans and registry hashes (`traceability.json`). Native enforcement of those policy metadata files remains PENDING. Migration statuses remain PENDING for the integrator's assessment.

The evidence below is an in-session Codex-host workflow using actual files, an isolated fixture, the installed Godot 4.7.2 executable and host tools. It is not a nested Codex CLI invocation, an independent role review, a visual/gameplay test, or proof of all branches. The parent authorized fixture writes; every explicit file write passed the documented PreToolUse proposal and PostToolUse checks. Native hook activation is not claimed.

| Skill | Bounded exercise | Outcome and limitation |
|---|---|---|
| dev-story | A nonvisual counter story moved Ready → In Progress; implemented only the stated counter and its optional fixture test. Actual Godot import and explicit script parse both exited 0, and the test exited 0. | PASS for this fixture. No player-visible output exists, so `Run result: N/A — nonvisual counter has no rendered surface`; no screenshot or visual run was claimed. Delegation used in-session fallback, not independent agents. |
| story-done | Read and verified all three criteria against the retained actual test result, checked source/test SHA-256 freshness, preserved the unrelated sentinel, and closed the authorized fixture story after checks. | PASS for this minimal-QA, nonvisual story. Controls show stale source and missing expected test prevent closure; the actual story stayed In Progress during those controls. An interrupted implementation also remains In Progress. Git scope comparison was not available because this disposable fixture has no Git repository; file scope was checked from known writes, source/test listings and the sentinel. |
| code-review | Read the actual counter, test and project context; reviewed the small implementation in-session. No concrete defect was found in the stated behavior. | Independent engine/QA specialist review: NOT ASSESSED. The in-session review is not independent approval. |
| tech-debt | Scanned one actual source file for TODO/FIXME/HACK/deprecated markers: `rg` exit 1 (no matches); inspected its small implementation. No register was written. | PASS only for this one-file marker check, not proof the whole project is debt-free. |
| perf-profile | No performance sample, target budget or profiler report was provided. | NOT ASSESSED — NO DATA. Godot startup time and the logic test are not performance measurements. |

Godot commands (all run against `.scratch/cgs15-counter-ZAndNQ` after explicit proposal checks):

- `godot --headless --path <fixture> --import` — exit 0; no error output.
- `godot --headless --path <fixture> --script <repo>/.agents/scripts/godot-parse-check.gd -- res://src/score_counter.gd` — exit 0, `ok: res://src/score_counter.gd`.
- `godot --headless --path <fixture> --script res://tests/score_counter_test.gd` — exit 0, initial value, one increment, a second increment and reset all passed. This is a standalone SceneTree fixture runner, not a claim that gdUnit4 is installed.
- `node scripts/codex/helper.mjs story-facts --root <fixture> --lint --granularity coarse --all` — exit 0, one Complete story. Its `no_tr_id` row is expected at minimal tier, where the story traces to the brief rather than a TR-ID.
- `rg -n 'TODO|FIXME|HACK|@deprecated' <fixture>/src/score_counter.gd` — exit 1, no matches in one inspected file.
- `node scripts/codex/generate.mjs --family skills --names dev-story,story-done,code-review,tech-debt,perf-profile --check` — exit 0.

`godot-test-run.json` retains the actual command outputs and hashes of the exact source/test bytes, and `guards.json` records independent fresh, stale, missing-path and out-of-scope controls. A separate control copy was changed after its recorded hash; the stale condition was detected. A separate control omitted the story's actual expected test path; it was detected. The out-of-scope check flagged the unrelated sentinel path without editing it; the actual sentinel remained byte-for-byte unchanged. These are in-session control decisions, not behavioral proof of a separately invoked native skill.

Godot import created `.uid` companions beside both source and test. They were reported and recorded in the story's Files list; the engine's `.godot/` cache is generated fixture data. The fixture source, test and final story are retained under `fixture/` for review. No real project, source history, commit, Git state, or Singularity state was modified by this task.

Actual fixture resolver readback (`node scripts/codex/config.mjs resolve --root <fixture> --keys rigor,workflow,review_mode,review_gate,qa.level`, exit 0): rigor=minimal (project.yaml); workflow=minimal, review_mode=solo, qa.level=minimal (each rigor:minimal); review_gate skill-gates=skip and phase-gates=skip (review_mode solo, rigor:minimal). The close therefore did not require an independent role gate under this fixture configuration; the in-session review is explicitly labeled self, and does not establish an independent review. The exact fixture configuration is retained at `fixture/project.yaml`.
