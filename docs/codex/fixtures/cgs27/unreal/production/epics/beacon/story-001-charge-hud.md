# CGS27 Charge Beacon HUD
**Status**: Blocked
**Last Updated**: 2026-11-05
**Type**: UI
**Layer**: Feature
**GDD**: design/quick-specs/charge-beacon-2026-11-05.md
**ADR**: N/A — minimal isolated UI fixture
**Depends on**: None
**MVP Feature**: design/game-brief.md — MVP item1, Charge Beacon HUD
## Acceptance Criteria
- [ ] AC1: initial3/3 and ready status from data.
- [ ] AC2: spend three times,0/3 empty state, disabled spend, never negative.
- [ ] AC3: reset restores3/3 and enabled spend.
- [ ] AC4: actual non-headless800x480 render shows unclipped labels/buttons; retain/open screenshot.
- [ ] AC5: another activation at zero cannot consume a charge or make the count negative.
## Out of Scope
Human usability/feel, publishing, independent review, export, networking.
## Test Evidence
Godot: tests/unit/charge_model_test.gd plus production/qa/evidence/story-001-charge-hud/*.png. Unity/Unreal: engine build/test and screenshot required; unavailable means blocked.
## Files
Implementation file set will be recorded before closure; engine code root Source/TP_Blank/.

## Blocker
Engine template provenance retained. Installed5.8.0 differs from requested5.8.3. Real editor-target build failed exit6: Windows SDK10.0.19041.0 absent. Draft Source/TP_Blank/ChargeModel.h and ChargeModelTest.cpp remain uncompiled; no Blueprint/map/UI or visual run exists.
Run result: NOT VERIFIED — engine/toolchain prerequisites unavailable. Story remains open.
