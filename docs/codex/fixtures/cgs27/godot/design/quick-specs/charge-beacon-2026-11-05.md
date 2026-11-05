# Quick Design Spec: Charge Beacon
**Type**: New Small System
**GDD Reference**: design/game-brief.md
**Estimated Implementation**: bounded fixture, under one day
No GDD or systems index exists at minimal; brief and story are authoritative. No previous specs. Classification/filing follows authorized test design discretion.
## Core Rules
Initial charges come from data (default3, range1–9). Spend returns success only above zero, decreases exactly one, and cannot become negative. Reset restores initial value. Text is localization data, not literals in game code.
## Tuning Knobs
initial_charges=3, range1–9, gate; persist in assets/data/charge.json or engine equivalent.
## Acceptance Criteria
1. Initial display3/3 and ready label.
2. Three input activations produce0/3 and empty label; spend disabled, no underflow.
3. Reset produces3/3 and enabled spending.
4. All UI elements readable and within800x480 in retained actual render.
## Systems Index
Below systems-index threshold; quick spec sufficient. No GDD update.
