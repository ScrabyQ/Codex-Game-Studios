> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# TD-CHANGE-IMPACT — Design Change Impact Review

Agent: `technical-director` | Model: native session policy | Domain: Architecture, engine risk, performance

**Trigger**: After the Design Change Impact Report is produced
(`$propagate-design-change` Phase 6), before the resolution workflow begins

**Context to pass**:
- The full Design Change Impact Report from Phase 6 — change summary, every
  affected ADR with its Still Valid / Needs Review / Likely Superseded
  classification, and the recommended actions

**Prompt**:
> "Review this design-change impact assessment before any ADR is revised. Are the
> impact classifications correct — in particular, is any ADR under-classified
> (marked Still Valid when the change actually contradicts its assumptions)? Are
> the recommended actions architecturally sound? Were any cascading effects on
> other ADRs or systems missed — decisions that depend on the ones already
> flagged? Return APPROVE, CONCERNS [the specific ADRs or recommendations to
> revisit], or REJECT [the assessment must be re-analyzed before resolution
> begins — say what was missed]."

**Verdicts**: APPROVE / CONCERNS / REJECT
