# In-session QA plan — synthetic combat fixture

Scope: two actual stories under `.scratch/cgs17-qa-118fe97f/production/epics/combat/`. This is a fixture plan, not an independent review or a release sign-off.

| Story | Type | Standard evidence | Observed state |
|---|---|---|---|
| story-001 — Damage formula | Logic | Automated test for both damage and zero-clamp criteria | Node regression test failed against buggy code then passed against fixed code; Godot runner not assessed |
| story-002 — Health HUD | UI | Retained screenshot of the screen | MISSING; no retained image was found |

At `qa.level: minimal`, an absent eligible Logic automated test may be waived; a UI screenshot is still required. At `standard`, the normal per-type requirements apply; at `full`, add per-system coverage targets, which are **PENDING** until the project supplies them. For the strictness fixture, Logic is advisory from the local override and UI blocking from project.yaml; this does not make absent UI evidence a passing screenshot.

No plan assumes an installed engine, runnable project, or successful visual check. The user has not asked for changes to project tests or evidence.
