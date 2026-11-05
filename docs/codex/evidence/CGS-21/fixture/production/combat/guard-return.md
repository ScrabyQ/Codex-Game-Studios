# Gameplay role return
Path: src/gameplay/health.mjs; docs/architecture/guard-sketch.md.
- Sole writer owns health in a closure; config supplies maximum.
- Immutable snapshots prevent UI mutation and preserve previous values.
- Invalid damage is rejected before state changes; lethal damage clamps to zero.
- No AI work requested; AI escalation not activated.
- Contract tests await UI handoff. Engine and rendered feature validation NOT ASSESSED.

Status: scoped implementation complete, full team-combat sign-off PENDING. Mechanism: sequential in-session role execution; not independent review. No code-review, balance-check or team-polish invocation is implied by this report.
