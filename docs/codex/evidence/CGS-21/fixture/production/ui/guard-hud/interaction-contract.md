# Guard HUD contract — ux-designer in-session role

Path returned: production/ui/guard-hud/interaction-contract.md. This is a contract slice, not a full UX spec or an independent UX review.

- Present health as localized numeric current/maximum text. This avoids color-only status communication at the data-contract level.
- Emit guard-requested with input source keyboard or gamepad; gameplay chooses the effect. UI never writes health.
- Use the existing action-intent pattern; no new pattern is introduced and the pattern library remains unchanged.
- Context observed: concept PRESENT; player journey PRESENT; guard UI requirements PRESENT; interaction patterns PRESENT; accessibility requirements PRESENT (Basic synthetic tier).
- CONCERNS: platform, rendered layout, input devices, motion, actual contrast and screenshots are absent. No runtime accessibility or full UX APPROVED verdict is claimed.

The fixture owner authorizes only the nonvisual contract experiment despite these explicit unassessed dimensions. This does not authorize progression of the real team-ui delivery pipeline past its required UX review.
