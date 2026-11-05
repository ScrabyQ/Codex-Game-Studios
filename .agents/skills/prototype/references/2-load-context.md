# $prototype — Phase 2: Load Concept Context

> Part of `$prototype`. `SKILL.md` names when to read this file; the settings it
> resolved and the rules under its later headings still apply here.

## Phase 2: Load Concept Context

Read `design/gdd/game-concept.md` — or `design/game-brief.md`, the one-page brief
that replaces it at `rigor: minimal` — if either exists. Read it by section: find the
headings you need with the Grep tool (pattern `^#`, content mode) and Read those
ranges with offset and limit. Extract:
- Core fantasy (what the player is supposed to feel)
- Core loop (the moment-to-moment action being tested)

Resolve engine.name and engine.language using .agents/docs/config-resolution.md: permitted local overrides, project.yaml, applicable legacy fallback and defaults. Treat [TO BE CONFIGURED] as unset; report missing or unresolvable fields and ask only when the choice is needed and unresolved.

---
