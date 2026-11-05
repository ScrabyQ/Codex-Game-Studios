---
name: estimate
description: "Estimate task effort from complexity, dependencies, velocity, risk. Structured estimate with confidence levels."
---

## Codex execution contract

**CGS-14 execution contract:** Resolve the explicitly selected project root and current project settings; use actual artifact content and status, not file existence as proof of completion. Missing, unreadable, placeholder-only, failed or unrun checks are unknown/NOT ASSESSED when required, never a fabricated pass. Execute explicit bootstrap and helpers through available supported tools with the selected root. Use the dispatcher `--root <selected-root>` once for `story-status`, `story-facts`, and `artifact-check`; never pass a second positional root to the dispatcher. For `artifact-check`, require a catalog inside that root and confirm its emitted ROOT matches the selected project; report an unavailable helper and fall back only to directly verifiable facts. Keep prior user authorization and host permissions; unanswered or skipped required decisions are not consent. Do not invoke a suggested next skill automatically. When native role delegation is unavailable, an in-session review is not independent: disclose it and leave any required independent gate NOT ASSESSED.

Read-only. Report counts only if actually measured, identify unreadable/missing files, distinguish observed history from assumptions, and label uncalibrated ranges when no velocity exists. Never invent measured complexity, durations or team velocity; absent task facts make the affected estimate NOT ASSESSED or low confidence.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[task-description]". 


# Estimate

## Phase 1: Understand the Task

Read the task description from the argument. If the description is too vague to estimate meaningfully, ask for clarification before proceeding.

Resolve engine and project settings from project.yaml, and read AGENTS.md and applicable on-demand standards for project context; treat unconfigured fields as unknown.

Read relevant design documents from `design/gdd/` if the task relates to a documented feature or system. Read them by section: find the headings you need with the Grep tool (pattern `^#`, content mode) and Read those ranges with offset and limit.

---

## Phase 2: Scan Affected Code

Identify files and modules that would need to change:

- Measure size and branching with Grep, per affected file — Read, Glob and Grep
  are this skill's only tools, so these counts are the measurement:
  - **Size:** `Grep pattern="[^[:space:]]" path="[file]" output_mode="count"` —
    non-blank lines.
  - **Branching:** `Grep pattern="(^|[^A-Za-z0-9_])(if|elif|for|foreach|while|match|switch|case|catch)([^A-Za-z0-9_]|$)|&&|[|][|]" path="[file]" output_mode="count"` —
    lines holding a branch or a boolean operator. The count
    approximates cyclomatic complexity (comments and strings count too); report
    it as that, never as a measured complexity.
  - **Dependencies:** what each file pulls in — `preload`/`load(` (GDScript),
    `using` (C#), `#include` (C++) — and which other files reference it.
  - Name any file Grep could not count (missing, binary, unreadable) under Notes
    and Assumptions rather than leaving it out of the totals.
- Identify integration points with other systems
- Check for existing test coverage in the affected areas
- Read past sprint data from `production/sprints/` for similar completed tasks and historical velocity.
  **If there is none**, say so under Notes and Assumptions — "No sprint history found;
  this estimate is not calibrated to the team's velocity" — and treat that as a risk
  in the confidence level, not as a silent padding of the figures.

---

## Phase 3: Analyze Complexity Factors

**Code Complexity:**
- Size and branching of the affected files (Phase 2's Grep counts)
- Number of dependencies and coupling level
- Whether this touches core/engine code vs leaf/feature code
- Whether existing patterns can be followed or new patterns are needed

**Scope:**
- Number of systems touched
- New code vs modification of existing code
- Amount of new test coverage required
- Data migration or configuration changes needed

**Risk:**
- New technology or unfamiliar libraries
- Unclear or ambiguous requirements
- Dependencies on unfinished work
- Cross-system integration complexity
- Performance sensitivity

---

## Phase 4: Generate the Estimate

```markdown
## Task Estimate: [Task Name]
Generated: [Date]

### Task Description
[Restate the task clearly in 1-2 sentences]

### Complexity Assessment

| Factor | Assessment | Notes |
|--------|-----------|-------|
| Systems affected | [List] | [Core, gameplay, UI, etc.] |
| Files likely modified | [Count] | [Key files listed below] |
| Size of affected files | [N non-blank lines; M branch lines] | Grep counts; branch lines approximate complexity |
| New code vs modification | [Ratio] | |
| Integration points | [Count] | [Which systems interact] |
| Test coverage needed | [Low / Medium / High] | |
| Existing patterns available | [Yes / Partial / No] | |

**Key files likely affected:**
- `[path/to/file1]` -- [what changes here]

### Effort Estimate

| Scenario | Days | Assumption |
|----------|------|------------|
| Optimistic | [X] | Everything goes right, no surprises |
| Expected | [Y] | Normal pace, minor issues, one round of review |
| Pessimistic | [Z] | Significant unknowns surface, blocked for a day |

**Recommended budget: [Y days]**

### Confidence: [High / Medium / Low]

[Explain which factors drive the confidence level for this specific task.]

### Risk Factors

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

### Dependencies

| Dependency | Status | Impact if Delayed |
|-----------|--------|-------------------|

### Suggested Breakdown

| # | Sub-task | Estimate | Notes |
|---|----------|----------|-------|
| 1 | [Research / spike] | [X days] | |
| 2 | [Core implementation] | [X days] | |
| 3 | [Testing and validation] | [X days] | |
| | **Total** | **[Y days]** | |

### Notes and Assumptions
- [Key assumption that affects the estimate]
- [Any caveats about scope boundaries]
```

Output the estimate with a brief summary: recommended budget, confidence level, and the single biggest risk factor.

This skill is read-only — no files are written. Verdict: **COMPLETE** — estimate generated.

---

## Phase 5: Next Steps

- If confidence is Low: recommend a time-boxed spike (`$prototype`) before committing.
- If the task is > 10 days: recommend breaking it into smaller stories via `$create-stories`.
- To schedule the task: run `$sprint-plan update` to add it to the next sprint (if the project has no sprint plan, as on the default minimal workflow, add it to the brief's build order instead).

### Guidelines

- Always give a range (optimistic / expected / pessimistic), never a single number
- The recommended budget should be the expected estimate, not the optimistic one
- Round to half-day increments — estimating in hours implies false precision for tasks longer than a day
- Do not pad estimates silently — call out risk explicitly so the team can decide
- Confidence is Low whenever the approach is undecided or the core requirements are still TBD — a range built on an unmade decision is a guess
