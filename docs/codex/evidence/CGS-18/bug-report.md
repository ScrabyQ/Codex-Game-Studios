# Bug Report

## Summary
**Title**: Damage is subtracted twice
**ID**: BUG-0001
**Severity**: S2-High
**Priority**: P2-Fix soon
**Status**: Open
**Reported**: 2026-11-05
**Reporter**: —

## Classification
- **Category**: Gameplay
- **System**: Health
- **Frequency**: Unknown — one synthetic test execution failed
- **Regression**: Unknown — no earlier build was supplied

## Environment
- **Build**: Synthetic isolated fixture; no engine build
- **Platform**: Windows, Node.js 22
- **Scene/Level**: Not assessed
- **Game State**: 100 health; 10 damage

## Reproduction Steps
**Preconditions**: Use the fixture's unmodified health module and test.

1. Open the isolated fixture root.
2. Run `node --test tests/health.test.mjs`.
3. Observe the assertion result.

**Expected Result**: 90 health remains.
**Actual Result**: 80 health remains; the test exits 1.

## Technical Context
- **Likely affected files**: `src/health.mjs`
- **Related systems**: Not assessed
- **Possible root cause**: The fixture's function multiplies damage by two before subtracting.

## Evidence
- **Logs**: Actual TAP assertion reported `80 !== 90`.
- **Visual**: Not assessed; no engine or screenshot was used.

## Related Issues
- `design/game-brief.md` states the expected health outcome.

## Notes
S2/P2 are provisional fixture classifications pending a real game-impact and scheduling decision. No bug fix, external issue, or game playtest was performed.
