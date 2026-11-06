> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# CD-NARRATIVE — Narrative Consistency Check

Agent: `creative-director` | Model: native session policy | Domain: Vision, pillars, player experience

**Trigger**: Invoked directly, after narrative GDDs, lore documents, dialogue specs
or world-building documents are authored — no skill spawns it; `$team-narrative`
runs its own review, ND-CONSISTENCY

**Context to pass**:
- Document file path(s)
- Game pillars
- Narrative direction brief or tone guide (if exists at `design/narrative/`)
- Any existing lore that the new document references

**Prompt**:
> "Review this narrative content for consistency with the game's pillars and
> established world rules. Does the tone match the game's established voice? Are
> there contradictions with existing lore or world-building? Does the content serve
> the player experience pillar? Return APPROVE, CONCERNS [specific inconsistencies],
> or REJECT [contradictions that break world coherence]."

**Verdicts**: APPROVE / CONCERNS / REJECT
