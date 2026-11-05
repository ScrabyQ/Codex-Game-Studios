# UI role return
Path: src/ui/guard-hud.mjs.
- Consumes immutable gameplay snapshot; does not own or mutate health.
- Uses hud.health localization key; no player-facing literal string.
- Keyboard and gamepad labels route to equivalent guard-requested events.
- No direct audio call; no new interaction pattern introduced.
- CONCERNS: this is a headless data/action contract. Actual input devices, layout, animation, resolutions, visual budget, contrast and screenshots remain NOT ASSESSED.

Status: scoped contract implementation complete; full UI delivery PENDING. Mechanism: sequential in-session role execution; not independent review.
