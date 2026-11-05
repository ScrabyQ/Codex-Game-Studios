---
name: architecture-decision
description: "Create an ADR documenting a technical decision: context, alternatives considered, consequences."
---

## Codex execution contract

**CGS-13 Codex architecture contract:** Resolve configuration with the explicit bootstrap before applying workflow or review gates. Source Read/Glob/Grep/Write/Edit examples describe operations: use available file tools, rg, and approved shell/Node helpers with the same path/range semantics. Source Agent/subagent_type examples are role briefs, not an assumed Codex API. Prefer an available authorized native role; otherwise an actual generic child may receive the complete adapted role and gate brief. If only an in-session role review is possible, read those instructions and label it "not independent"; never count it as a fresh independent review. Gate files can be read in-session for that disclosed fallback, despite source wording assigning the read to a child. Report unperformed required assessment as NOT ASSESSED. Do not invent engine execution or an unavailable specialist verdict.

Use available question tools, or present the same numbered options in plain text and wait; source widget-only wording cannot make an unavailable tool mandatory. Previously authorized writes and explicit scripted fixture choices remain authorized. An unanswered required choice, ADR acceptance, registry update, or supersession is never inferred from automation. Show actual effects and preserve authorization scope. Commands and helpers emit observations; missing/failed helpers are not clean results. Direct file-reading fallback is valid only when it establishes the same facts. Dependency graph computation and receipt hashing must actually run, or that subcheck is NOT ASSESSED. Native skill names use $name; merely recommending a skill never runs it.

Authoring always writes Proposed. Acceptance is a separate, explicitly authorized transition after known dependencies are Accepted; a review approval is not acceptance. Keep Date unchanged when accepting. Only unblock stories actually blocked pending this ADR under production/epics, never a story naming it only as a successor. Missing/UNKNOWN dependencies block acceptance. Foundation criticality matters at standard, but any story explicitly governed by a Proposed/Deprecated/Superseded ADR remains blocked even at minimal; do not waive a named dependency. Retrofit appends only missing sections and routes an Accepted answer through acceptance.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, Bash(wc -c *), Bash(bash "*/.agents/skills/architecture-decision/../../hooks/yaml-helper.sh" resolve_config *), Bash(bash .agents/scripts/registry.sh *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[title | retrofit <path> | accept <ADR-id>] [--review full|lean|solo]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,workflow,docs.density,team.size`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

# Architecture Decision

When this skill is invoked:

## 0. Parse Arguments — Detect Retrofit / Acceptance Mode

See `.agents/docs/director-gates.md` for the full check pattern. Individual gate definitions live in `.agents/docs/director-gates/[gate-id].md` — the spawned agent reads its own gate file; do not read it in the parent session.

Every `available user-question tool (or ask in plain text and wait)` call follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

**`team.size`**: which agents validate this ADR (orthogonal to review_mode/workflow).
- **`individual`** (default): `technical-director` (TD-ADR) + the engine-specialist.
- **`small`** and **`studio`**: the same two. This skill spawns no engine
  sub-specialist and no adversarial reviewer at any size.

**`docs.density`** — it controls the *depth* of the ADR's prose sections, not
which sections the skeleton emits (that is fixed). `modes.rigor` sets it
alongside `workflow`; set `docs.density` explicitly to vary ADR verbosity alone:
`terse` (the default, via `rigor: minimal`) = decision + alternatives as bullets, one line of rationale each;
`balanced` = paragraph per section with light rationale (`rigor: standard`); `thorough` =
full prose with trade-offs and worked rationale in Decision, Alternatives, and
Consequences. Apply it to the prose sections; the Engine Compatibility, ADR
Dependencies, and GDD Requirements tables are structural and stay whole at every
density.

**`workflow`** (see `.agents/docs/workflow-modes.md`):
- `full` — all ADRs on the required ADR list must be completed.
- `standard` — critical ADRs only (Foundation-layer systems).
- `minimal` — not required. Can still be run voluntarily.

**If the argument starts with `retrofit` followed by a file path**

**Read `references/0-retrofit.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

**If the argument starts with `accept` followed by an ADR id**

**Read `references/0-accept.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

If NOT in retrofit or acceptance mode, proceed to Step 1 below (normal ADR authoring).

**No-argument guard**: If no argument was provided (title is empty), ask before
running Phase 0:

> "What technical decision are you documenting? Please provide a short title
> (e.g., `event-system-architecture`, `physics-engine-choice`)."

Use the user's response as the title, then proceed to Step 1.

---

## 1. Load Engine Context (ALWAYS FIRST)

**Read `references/1-engine-context.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 2. Determine the next ADR number

Scan `docs/architecture/` for existing ADRs to find the next number.

---

## 3. Gather context

**Read `references/3-gather-context.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 4. Guide the decision collaboratively

**Read `references/4-decide.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 5. Generate the ADR

**Read `references/5-generate.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 6. Closing Next Steps

After the ADR is written (and registry optionally updated), close with `available user-question tool (or ask in plain text and wait)`.

Before generating the widget:
1. Read the `## Required ADRs` section of `docs/architecture/architecture.md` (by section) and list `docs/architecture/adr-*.md`: a required ADR with no file is still unwritten. Without `architecture.md`, look for ADRs flagged in technical-preferences.md or systems-index.md as prerequisites
2. Check if all prerequisite ADRs are now written. If yes, include a "Start writing GDDs" option.
3. List ALL remaining priority ADRs as individual options — not just the next one or two.

Widget format:
```
ADR-[NNNN] written and registry updated. What would you like to do next?
[1] Write [next-priority-adr-name] — [brief description from prerequisites list]
[2] Write [another-priority-adr] — [brief description]  (include ALL remaining ones)
[N] Start writing GDDs — run `$design-system [first-undesigned-system]` (only show if all prerequisite ADRs are written)
[N+1] Stop here for this session
```

If there are no remaining priority ADRs and no undesigned GDD systems, offer only "Stop here" and suggest running `$architecture-review` in a fresh session.

**Always include this fixed notice in the closing output (do NOT omit it):**

> To validate ADR coverage against your GDDs, open a **fresh Codex session**
> and run `$architecture-review`.
>
> **Never run `$architecture-review` in the same session as `$architecture-decision`.**
> The reviewing agent must be independent of the authoring context to give an unbiased
> assessment. Running it here would invalidate the review.

**Do NOT unblock stories here.** This ADR is `Proposed` — Step 5 guarantees it,
and a story blocked *pending this decision* is still pending it. Unblocking on
authoring defeats the guard at the moment it becomes relevant: the pipeline
appears to flow while running on decisions nobody has accepted.

Instead, tell the user what is now waiting on acceptance:

> "ADR-NNNN is written and `Proposed`. [N] stories remain `Blocked` pending it.
> Run `$architecture-decision accept ADR-NNNN` when the decision is settled —
> that is what moves them to `Ready`."

List the blocked stories by path so the cost of leaving it Proposed is visible.
(Acceptance has consequences enforced across many skills and an authority
recorded in only a few, so the route between them must stay explicit.)
