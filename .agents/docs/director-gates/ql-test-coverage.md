> Gate definition. For authorized native delegation, pass this path so the assigned reviewer reads it first. An in-session reviewer reads it explicitly and labels the review nonindependent; unavailable required independent execution remains PENDING.

# QL-TEST-COVERAGE — QA Lead Test Coverage Review

Agent: `qa-lead` | Model: native session policy

**Trigger**: After implementation stories are complete — `$story-done` runs it for
each story before marking it Complete

**Context to pass**:
- List of implemented stories with story types (Logic / Integration / Visual / UI / Config)
- Test file paths in `tests/`
- GDD acceptance criteria for the system

**Prompt**:
> "Review the test coverage for these implementation stories. Are all Logic stories
> covered by passing unit tests? Are Integration stories covered by integration
> tests or documented playtests? Are the GDD acceptance criteria each mapped to at
> least one test? Are there untested edge cases from the GDD Edge Cases section?
> Return ADEQUATE (coverage meets standards), GAPS [specific missing tests], or
> INADEQUATE [critical logic is untested — do not advance]."

**Verdicts**: ADEQUATE / GAPS / INADEQUATE
