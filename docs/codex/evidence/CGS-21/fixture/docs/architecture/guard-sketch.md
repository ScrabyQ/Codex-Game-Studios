# Guard contract sketch — gameplay-programmer in-session role

createHealth(config) closes over health. snapshot() returns a frozen copy; damage(amount) validates then updates owned state. projectHealth(snapshot, translate) returns display values without modifying input. requestGuard(source, emit) emits an intent and cannot reach health state. Tests use the public boundary.

Owned writes: gameplay-programmer → src/gameplay/health.mjs; ui-programmer → src/ui/guard-hud.mjs. One file owner at a time; the rejected shared-health-file proposal is recorded in assignments.json. The handoff is an immutable snapshot, not a shared writable object.

This record is not an Accepted ADR and is not consumed by a later gate. Engine validation: NOT ASSESSED — no engine configured. No engine API is prescribed. Full game architecture, visual delivery and game state transitions beyond the fixture formula remain outside this contract test.
