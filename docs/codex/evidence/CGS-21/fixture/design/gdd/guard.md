# Guard mechanic
## Summary
Display health and route a guard request; actual blocking combat behavior is not implemented.
## UI Requirements
Read-only health snapshot, localized health text, guard-requested event from keyboard or gamepad. Never let the UI own health.
## Formulas
nextHealth = max(0, currentHealth - damage); finite nonnegative damage only. Maximum health comes from config.
## Acceptance Criteria
Damage changes only gameplay-owned state. Invalid inputs do not change state. UI events do not apply damage or healing. Snapshot mutation fails.
