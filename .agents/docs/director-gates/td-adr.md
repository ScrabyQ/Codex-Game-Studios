> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# TD-ADR — Architecture Decision Review

Agent: `technical-director` | Model: native session policy | Domain: Architecture, engine risk, performance

**Trigger**: After an individual ADR is authored (`$architecture-decision`), before
it is marked Accepted

**Context to pass**:
- ADR file path
- Engine version and knowledge gap risk level for the domain
- Related ADRs (if any)

**Prompt**:
> "Review this Architecture Decision Record. Does it have a clear problem statement
> and rationale? Are the rejected alternatives genuinely considered? Does the
> Consequences section acknowledge the trade-offs honestly? Is the engine version
> stamped? Are post-cutoff API risks flagged? Does it link to the GDD requirements
> it covers? Return APPROVE, CONCERNS [specific gaps], or REJECT [the decision is
> underspecified or makes unsound technical assumptions]."

**Verdicts**: APPROVE / CONCERNS / REJECT
