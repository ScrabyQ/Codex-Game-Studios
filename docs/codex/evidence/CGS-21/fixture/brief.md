# Synthetic guard HUD and gameplay brief

This is an isolated coordination and pure JavaScript contract exercise, not a playable game or a runtime UI delivery. No engine is configured. The task operator authorizes the listed fixture artifacts and staged role work; these scripted choices do not approve any real project architecture.

Gameplay owns health, initially maxHealth from config. Damage must be finite and nonnegative; clamp to zero. Invalid input leaves state unchanged. A snapshot must be immutable. UI displays a localized value, reads the snapshot, and emits the guard-requested event for either keyboard or gamepad input. UI must never mutate health. Colors alone must not convey critical state. Audio and rendering are out of scope for implementation, but unassessed review streams must remain visible.

Authorized implementation set: src/gameplay/health.mjs (gameplay-programmer), src/ui/guard-hud.mjs (ui-programmer), tests/contracts.test.mjs (gameplay-programmer applying the QA checklist). Data file config/health.json is a fixture input. No shared file may have simultaneous writers. Test utilities under this evidence directory are not a new agent runtime.

Scripted gates: approve the engine-independent data contract and scoped implementation file set; approve sequential role execution. Keep all creative/runtime/input-device/accessibility validation gaps open. Do not override a missing review. If a role cannot provide its named artifact after a scoped retry, stop dependent integration and write a partial BLOCKED report. The incomplete role response is intentionally injected test input, not evidence that a real child failed.
