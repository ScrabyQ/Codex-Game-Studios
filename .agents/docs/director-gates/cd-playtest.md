> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# CD-PLAYTEST — Player Experience Validation

Agent: `creative-director` | Model: native session policy | Domain: Vision, pillars, player experience

**Trigger**: After playtest reports are generated (`$playtest-report`), or after
any session that produces player feedback

**Context to pass**:
- Playtest report — its file path, or its content inline when the calling skill
  reviews before saving (`$playtest-report` does)
- Game pillars and core fantasy statement
- The specific hypothesis being tested

**Prompt**:
> "Review this playtest report against the game's design pillars and core fantasy.
> Is the player experience matching the intended fantasy? Are there systematic issues
> that represent pillar drift — mechanics that feel fine in isolation but undermine
> the intended experience? Return APPROVE (core fantasy is landing), CONCERNS [gaps
> between intended and actual experience], or REJECT [core fantasy is not present —
> redesign needed before further playtesting]."

**Verdicts**: APPROVE / CONCERNS / REJECT
