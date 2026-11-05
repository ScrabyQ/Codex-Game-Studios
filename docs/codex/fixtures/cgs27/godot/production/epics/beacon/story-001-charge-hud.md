# CGS27 Charge Beacon HUD
**Status**: Complete
**Last Updated**: 2026-11-05
**Type**: UI
**Layer**: Feature
**GDD**: design/quick-specs/charge-beacon-2026-11-05.md
**ADR**: N/A — minimal isolated UI fixture
**Depends on**: None
**MVP Feature**: design/game-brief.md — MVP item1, Charge Beacon HUD
## Acceptance Criteria
- [x] AC1: initial3/3 and ready status from data.
- [x] AC2: spend three times,0/3 empty state, disabled spend, never negative.
- [x] AC3: reset restores3/3 and enabled spend.
- [x] AC4: actual non-headless800x480 render shows unclipped labels/buttons; retain/open screenshot.
- [x] AC5: another activation at zero cannot consume a charge or make the count negative.
## Out of Scope
Human usability/feel, publishing, independent review, export, networking.
## Test Evidence
Godot: tests/unit/charge_model_test.gd plus production/qa/evidence/story-001-charge-hud/*.png. Unity/Unreal: engine build/test and screenshot required; unavailable means blocked.
## Files
- src/charge_model.gd
- src/charge_beacon.gd
- tests/unit/charge_model_test.gd (baseline test-first input)
- scenes/charge_beacon.tscn
- assets/data/charge.json
- localization/en.json
- project.godot
- prototypes/.gdignore
- docs/project/ui-contract.md
- src/charge_model.gd.uid
- src/charge_beacon.gd.uid
- tests/unit/charge_model_test.gd.uid
- production/qa/evidence/story-001-charge-hud/01-ready.png
- production/qa/evidence/story-001-charge-hud/02-empty.png
- production/qa/evidence/story-001-charge-hud/03-reset.png
- production/qa/evidence/story-001-charge-hud/stamp.txt
- production/qa/qa-story-001.md
- production/session-state/active.md

## Completion Notes
**Completed**: 2026-11-05
**Criteria**:5/5 verified against actual tests/render and opened images.
**Test Evidence**: tests/unit/charge_model_test.gd and production/qa/evidence/story-001-charge-hud/.
**Reviewed by**: self, no independent review; solo QL/LP gates skipped by resolved policy.
**Deviations**: No gameplay/design deviation. Physical usability/feel and export are outside this story, unassessed.
Run result: OBSERVED — ready/empty/reset screenshots opened and compared to AC1–5.
Closure/write authorization: enclosing user-authorized CGS27 end-to-end fixture workflow; no new user decision inferred from automation.
