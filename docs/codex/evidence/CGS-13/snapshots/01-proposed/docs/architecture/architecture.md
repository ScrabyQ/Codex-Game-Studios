# Pocket Arena — Master Architecture

## Document Status
- Version: 3
- Last Updated: 2026-11-05
- Engine: Godot 4.7

## System Layer Map
| System | Layer | Boundary |
|---|---|---|
| health | Core | Owns current_health; publishes a read-only snapshot. |
| save | Foundation | Owns persistence and schema versioning; consumes the snapshot. |
| health-hud | Presentation | Consumes health notifications; never writes health. |

Save's Foundation classification describes its build prerequisite, not permission for Core to import persistence. Health remains independent of save and HUD.

## Module Ownership
PRESERVE-OWNERSHIP: health alone owns current_health.

## Data Flow
PRESERVE-DATA-FLOW: health emits a read-only snapshot to save and HUD.

## Required ADRs
ADR-0002 save format (Foundation) is required before save implementation.

## Technical Requirements Baseline
| Req ID | System | Requirement |
|---|---|---|
| TR-health-001 | health | Health is clamped between 0 and max_health. |
| TR-save-001 (provisional) | save | Save must persist current health between sessions with a versioned schema. |
