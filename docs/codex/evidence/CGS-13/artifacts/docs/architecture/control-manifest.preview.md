# Control Manifest — Reviewable Draft

> **Engine**: Godot 4.7 configured; installed version NOT DETERMINED
> **Last Updated**: 2026-11-05
> **Manifest Version**: 2026-11-05
> **ADRs Covered**: ADR-0001, ADR-0003
> **Status**: Draft — BLOCKED from Active publication by architecture-review CONCERNS

Accepted-only extraction preview, explicitly authorized for this synthetic fixture. Excluded: ADR-0002, Superseded by ADR-0003. No rule from ADR-0002's obsolete JSON format is current. This preview does not unblock implementation and does not satisfy a final manifest gate.

## Foundation Layer Rules
### Required Patterns
- Save must encode a binary envelope containing schema_version = 2 and current_health — source: ADR-0003, Decision.
- Save must be the sole owner of serialization — source: ADR-0003, Decision.
- Reject invalid or unsupported schemas without modifying live health — source: ADR-0003, Decision.
### Forbidden Approaches
- Health must never call save or HUD — source: ADR-0003, Decision.
### Performance Guardrails
NOT ASSESSED; no measured budget supplied by ADR-0003. No numeric limit is invented.

## Core Layer Rules
### Required Patterns
- Health must be the only writer of current_health — source: ADR-0001, Decision.
### Forbidden Approaches
- Health must never depend on the HUD — source: ADR-0001, Decision.
### Performance Guardrails
No measured budget supplied by ADR-0001.

## Feature Layer Rules
No Accepted source rules in the scoped input set; not a claim that the whole project needs none.

## Presentation Layer Rules
No independent Presentation-layer ADR exists in this fixture. Core's HUD dependency restriction is retained under its source layer.

## Global Rules (All Layers)
Project naming/performance keys are absent and legacy technical-preferences values are unconfigured placeholders. These are missing inputs, not permission to invent conventions or budgets. No engine/library API rules added without verified applicable sources.

## Review and publication
TD-MANIFEST skipped — Lean mode. Host-session extraction review is not independent. Final docs/architecture/control-manifest.md is intentionally absent: resolve the architecture-review concerns and obtain the required publication decision before creating an Active artifact.
