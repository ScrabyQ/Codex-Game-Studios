# ADR-0001: Health ownership

## Status
Accepted

## Date
2026-11-01

## Summary
Health owns its value and emits change notifications.

## Engine Compatibility
| Field | Value |
|---|---|
| **Engine** | Godot 4.7 |
| **Domain** | Core |
| **Layer** | Core |
| **Post-Cutoff APIs Used** | None; no engine API prescribed |

## ADR Dependencies
| Field | Value |
|---|---|
| **Depends On** | None |

## Decision
Health must be the only writer of current_health. Health must never depend on the HUD.

## Alternatives Considered
Direct HUD writes are rejected because they split state ownership.

## Performance Implications
No measured budget provided; no performance claim.

## GDD Requirements Addressed
| GDD System | Requirement | How |
|---|---|---|
| health.md | TR-health-001: Health is clamped between 0 and max_health. | Single owner performs clamping. |
