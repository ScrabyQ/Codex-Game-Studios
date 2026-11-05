# ADR-0003: Versioned binary health save

## Status
Accepted

## Date
2026-11-05

## Last Verified
NOT ASSESSED for engine execution. Source requirements reviewed 2026-11-05.

## Decision Makers
Synthetic scenario owner explicitly chose a replacement binary format; Codex host authored this proposal. Acceptance and old-decision supersession are separate.

## Summary
Persist health across sessions using a versioned binary envelope. Save owns serialization and consumes a health snapshot without making health depend on persistence.

## Engine Compatibility
| Field | Value |
|---|---|
| **Engine** | Godot 4.7, configured only; installed version NOT DETERMINED |
| **Domain** | Core |
| **Layer** | Foundation |
| **Knowledge Risk** | HIGH, from pinned VERSION.md |
| **References Consulted** | docs/engine-reference/godot/VERSION.md |
| **Post-Cutoff APIs Used** | None; no concrete engine API prescribed |
| **Verification Required** | Round-trip, invalid-save handling, and actual engine compatibility before implementation signoff |

## ADR Dependencies
| Field | Value |
|---|---|
| **Depends On** | None |
| **Enables** | None |
| **Blocks** | production/epics/save/story-001-save.md |
| **Ordering Note** | Acceptance precedes save implementation; layer map alone does not authorize implementation. |

## Context
### Problem Statement
The approved save design requires resuming recorded health with a versioned schema.
### Current State
No save implementation exists in this fixture.
### Constraints
Health owns mutation. Persistence must not introduce a dependency from health to save or HUD.
### Requirements
TR-save-001: Save must persist current health between sessions with a versioned schema.

## Decision
Save must encode a binary envelope containing schema_version = 2 and current_health. Save must be the sole owner of serialization. Health must never call save or HUD. Invalid or unsupported schemas must be rejected without modifying live health.

### Architecture Diagram
Health snapshot -> Save envelope -> storage; validated load -> health restoration boundary.
### Key Interfaces
Save consumes a read-only health snapshot and returns either a validated current_health value or a failure. This is an abstract boundary, not a claim about engine signatures.
### Implementation Guidelines
Serialization must stay in save. A failed load must leave health unchanged. No performance budget is asserted.

## Alternatives Considered
JSON encoding (ADR-0002): easier manual inspection. This fixture explicitly chooses binary as a replacement to exercise supersession; no measured performance advantage is claimed.

## Consequences
Positive: explicit binary schema boundary. Negative: reduced readability and unmeasured size/parsing cost. Risks: unknown historical save compatibility; no existing saves supplied.

## Performance Implications
NOT ASSESSED; no timing or memory measurement exists.

## Risks
Unknown historic format compatibility; no legacy saves were supplied. Engine API compatibility remains unverified.

## Migration Plan
No deployed saves exist in this fixture. A real migration from JSON requires a separate compatibility plan and validation before release; do not silently reinterpret historical data.

## Validation Criteria
Round-trip valid health; reject an unknown schema and malformed envelope without state changes. These are planned tests, not execution results.

## Related
design/gdd/save.md; docs/architecture/architecture.md. Intended replacement for ADR-0002; old ADR remains Accepted while this is Proposed.

## GDD Requirements Addressed
| GDD System | Requirement | How |
|---|---|---|
| save.md | TR-save-001: Save must persist current health between sessions with a versioned schema. | Versioned envelope and validated restoration boundary. |

## Review
TD-ADR gate skipped: Lean mode. This host-session artifact exercise is not independent review. Engine execution and production readiness remain NOT ASSESSED.
