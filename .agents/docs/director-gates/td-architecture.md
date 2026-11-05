> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# TD-ARCHITECTURE — Architecture Sign-Off

Agent: `technical-director` | Model: native session policy | Domain: Architecture, engine risk, performance

**Trigger**: After the master architecture document is drafted (`$create-architecture`
Phase 7), and after any major architecture revision

**Context to pass**:
- Architecture document path (`docs/architecture/architecture.md`)
- Technical requirements baseline (TR-IDs and count)
- ADR list with statuses
- Engine knowledge gap inventory

**Prompt**:
> "Review this master architecture document for technical soundness. Check: (1) Is
> every technical requirement from the baseline covered by an architectural decision?
> (2) Are all HIGH risk engine domains explicitly addressed or flagged as open
> questions? (3) Are the API boundaries clean, minimal, and implementable? (4) Are
> Foundation layer ADR gaps resolved before implementation begins? Return APPROVE,
> CONCERNS [list], or REJECT [blockers that must be resolved before coding starts]."

**Verdicts**: APPROVE / CONCERNS / REJECT
