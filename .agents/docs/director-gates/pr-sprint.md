> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# PR-SPRINT — Sprint Feasibility Review

Agent: `producer` | Model: native session policy | Domain: Scope, timeline, dependencies, production risk

**Trigger**: Before finalising a sprint plan (`$sprint-plan`), and after any
mid-sprint scope change

**Context to pass**:
- Proposed sprint story list (titles, estimates, dependencies)
- Team capacity (hours available)
- Current sprint backlog debt (if any)
- Milestone constraints

**Prompt**:
> "Review this sprint plan for feasibility. Is the story load realistic for the
> available capacity? Are stories correctly ordered by dependency? Are there hidden
> dependencies between stories that could block the sprint mid-way? Are any stories
> underestimated given their technical complexity? Return REALISTIC (plan is
> achievable), CONCERNS [specific risks], or UNREALISTIC [sprint must be
> descoped — identify which stories to defer]."

**Verdicts**: REALISTIC / CONCERNS / UNREALISTIC
