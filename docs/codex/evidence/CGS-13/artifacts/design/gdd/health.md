# Health
## Summary
A clamped health counter notifies the HUD when changed.
## Detailed Rules
Health is clamped between 0 and max_health.
## Dependencies
The HUD reads health notifications; health never references the HUD.
## Acceptance Criteria
Damage below zero leaves health unchanged. Lethal damage clamps health to zero.
