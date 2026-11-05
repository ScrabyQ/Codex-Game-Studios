---
name: team-combat
description: "Orchestrate the combat team — game-designer, gameplay-programmer, ai-programmer, technical-artist, sound-designer, qa-tester — design through implement and validate."
---

## Codex execution contract

**CGS-21 Codex team execution contract:** Check the required argument before bootstrap, project reads, task creation or delegation. Then execute the explicit config bootstrap and announce the resolved team.size active set and every routed/not-spawned role. Team size, workflow and review depth are separate; these pipelines have their own decision points, not invented director phase gates. Do not assume shell interpolation, Claude Agent, subagent_type, or TaskCreate/TaskGet/TaskList/TaskUpdate are Codex APIs. Use native supported delegation and an available plan/task facility, or a local assignment ledger within the already authorized scope. Do not create external tracker tasks without authorization. Never infer model availability from source model metadata.

Choose actual subagents only when supported, authorized, and justified by independent work or a required independent view. Keep source department roles and active-set restrictions. A generic native child with the complete relevant adapted role brief can perform that role if actually spawned; report the mechanism and actual child handle. If unavailable or unnecessary, explicitly select **sequential in-session role execution; not independent review**, read the relevant role instructions, and perform each assigned role's phase in order. In this fallback the current Codex performs writes as the assigned role under that role's exact ownership and authorization; source wording requiring child-only writes is a source-runtime mechanism, not a reason to omit the fallback. Keep the source's special final-compilation ownership. A deliberately skipped or failed role is not the same as a completed sequential role: never silently fill its missing section or claim a fresh independent review.

Before any write, make an assignment with phase, role, mechanism, distilled inputs, exact owned paths, dependencies, allowed actions, expected artifact/return contract, and escalation. Resolve each path against the project root and account for aliases/case and ancestor-directory overlap. There is one active writer per file. If assignments overlap, do not launch them simultaneously: appoint one owner or serialize an explicit handoff after the first owner returns and the coordinator verifies the artifact. Reviewers read shared inputs and write separate review-[role] files. All required outputs must exist and be inspected before integration; integrate through one assigned owner. Read shared inputs once, pass relevant content rather than asking each role to reread everything, and preserve the source's summary/concerns return shape.

Existing user authorization persists, including explicit synthetic fixture choices. A named path or phase gate defines scope but does not itself grant permission. For implementation, propose and obtain authorization for the whole exact file set before editing unless that set is already authorized; normal phase approval alone does not supply missing write authorization. Available native questions or the same numbered plain-text choices replace widgets; wait for any required unanswered decision. Automation never grants permission or silently accepts an always-ask risk.

After each role, verify the named artifact, report actual status and evidence, and preserve outputs already completed. Missing artifact or incomplete response is a failed phase: surface it immediately, resume the same child or same sequential role with the unmet contract, then record BLOCKED if it still cannot complete. Offer the source retry/skip/stop choices and halt dependent phases. A chosen skip retains the gap and the source's blocked/unknown verdict precedence. Do not fabricate tests, engine validation, screenshots, profiling, assets, accessibility compliance or independent review. Pipeline parallel directives below mean issue independent calls together only when real delegation is available and paths do not conflict; the disclosed sequential fallback retains the same phase dependencies, artifacts, review criteria and output format.

Preserve the gameplay-programmer individual core and conditional AI escalation, the workflow-sized GDD, designer draft versus orchestrator-approved final design, architecture then configured-engine review, approved implementation set, integration then QA. Missing or Proposed governing ADR blocks its implementation; an architecture sketch is not an Accepted ADR. No engine means explicitly NOT ASSESSED, not engine-validated.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, TaskCreate, TaskGet, TaskList, TaskUpdate, Bash(bash "*/.agents/skills/team-combat/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[combat feature description] [--review full|lean|solo]". 

# Team Combat

**Argument check:** If no combat feature description is provided, output:
> "Usage: `$team-combat [combat feature description] [--review full|lean|solo]` — Provide a description of the combat feature to design and implement (e.g., `melee parry system`, `ranged weapon spread`)."
Then stop immediately without spawning any subagents or reading any files.

When this skill is invoked with a valid argument, orchestrate the combat team through a structured pipeline.

**Decision Points:** At each phase transition, use `available user-question tool (or ask in plain text and wait)` to present
the user with the subagent's proposals as selectable options. Write the agent's
full analysis in conversation, then capture the decision with concise labels.
In collaborative mode, surface unresolved phase decisions and wait for the user; preserve decisions and actions already authorized.
In `guided` mode the pipeline advances automatically unless a phase is BLOCKED;
in `autonomous` mode it runs end to end, recording each phase outcome via
`log_decision`. Decisions in `automation_always_ask` categories
(`is_always_ask_category` helper) always prompt regardless of mode. See
`.agents/docs/automation-modes.md`.

## Phase 0: Resolve Config

**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,team.size,workflow`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

`review_mode` sets director-gate depth, and this pipeline has no director gate:
no phase below spawns CD-, TD-, PR- or AD-PHASE-GATE, at any `review_mode`. Its
phase gates are the pipeline's own decision points (defined under `team.size`
below), and the agents that work at them are team members, not director gates.

`automation` drives the Decision Points note above. See the Decision Points note above and
`.agents/docs/automation-modes.md` for how each mode changes pipeline behavior.

`workflow` sizes the Phase 1 design document the way `$design-system` does:
`## Summary` plus all 8 sections at `full`; at `standard`, Overview, Detailed
Design, Edge Cases, Dependencies and Acceptance Criteria, plus Formulas whenever
the mechanic defines numeric rules (a combat mechanic almost always does); at
`minimal` the game brief is the design record and the GDD is optional — draft
those five sections and tell the user it is optional at this workflow level.

**`team.size`**: which agents are active (orthogonal to review_mode gate-depth and workflow docs).
- **`individual`** (default): `gameplay-programmer` runs the pipeline; escalate `ai-programmer` only if the feature flags AI work. Other Team Composition agents are consulted via the gameplay-programmer, not spawned separately.
- **`small`**: the full Team Composition pipeline below, as documented.
- **`studio`**: full pipeline + engine sub-specialists + an adversarial review pass. *Engine sub-specialists*: the primary engine specialist's prompt says it may hand parts of its review to the sub-specialists its `tools:` grant names (for example `ue-gas-specialist` for abilities); below `studio` it answers alone. *Adversarial review pass*: Phase 5's qa-tester is told "your job is not to confirm this works — find how it breaks", and the report says the pass ran.
A non-core agent needed at `individual` routes through the nearest active core agent with an informational note. **"Phase gate" means any phase that ends in an `available user-question tool (or ask in plain text and wait)` decision point this pipeline itself lists** — a transition under Decision Points above, or a **Gate** step written into the pipeline below — **whatever the `automation` mode.** `guided` and `autonomous` change how a gate is passed (it auto-advances, or is recorded with `log_decision`), not whether it is one, so bounded-exception condition (3) below holds at it in every mode. An agent restricted to "phase gates only" is spawned at those points and no others. This active-set scoping applies throughout the pipeline below: any phase that names an agent outside the active set routes through the nearest core agent rather than spawning it.

**Announce the active set before Phase 1 — never let the collapse be silent.**
Before spawning anything, state in one line which agents this run will actually
spawn, and which the pipeline below names but will **not** spawn at the resolved
`team.size`. For example:

> `Active set (team.size: <resolved>): <the agents listed for that size above>.`
> `Not spawned this run: <every other agent this pipeline names> — consulted`
> `through <nearest active core agent>. Raise team.size (or modes.rigor) to widen.`

Fill it from the `team.size` list directly above and the agents this file's own
pipeline names — not from an example. Both sets differ per orchestrator.

The pipeline below reads as a multi-agent fan-out and at the shipped default it
is one or two agents — `team-release` names ten and runs one, `team-narrative`
names six across five phases and runs `writer` alone. **The collapse is correct**:
`team.size` is rigor-fronted and the narrow default is the token lever.
Without saying so, a reader cannot
distinguish a correctly-collapsed run from a broken pipeline, and the per-agent
"routes through the nearest core agent with an informational note" rule above
fires at routing time and never states the shape of the run as a whole.

This is the same rule as the skipped-check reporting elsewhere in this file: **a constraint that is enforced but never surfaced is
indistinguishable, to the person reading the output, from one that was never
enforced.**

## Team Composition
- **game-designer** — Design the mechanic, define formulas and edge cases
- **gameplay-programmer** — Implement the core gameplay code
- **ai-programmer** — Implement NPC/enemy AI behavior for the feature
- **technical-artist** — Create VFX, shader effects, and visual feedback
- **sound-designer** — Define audio events, impact sounds, and ambient combat audio
- **engine specialist** (primary) — Validate architecture and implementation patterns are idiomatic for the engine (the primary specialist is `<engine>-specialist` from `engine.name` — Godot→`godot-specialist`, Unity→`unity-specialist`, Unreal→`unreal-specialist`; fall back to the Primary line of `## Engine Specialists` in `technical-preferences.md`)
- **qa-tester** — Write test cases and validate the implementation

## How to Delegate

Use authorized native delegation when available for the following roles; otherwise use the disclosed in-session fallback or report PENDING:
- `game-designer` — Design the mechanic, define formulas and edge cases
- `gameplay-programmer` — Implement the core gameplay code
- `ai-programmer` — Implement NPC/enemy AI behavior
- `technical-artist` — Create VFX, shader effects, visual feedback
- `sound-designer` — Define audio events, impact sounds, ambient audio
- `[primary engine specialist]` — Engine idiom validation for architecture and implementation
- `qa-tester` — Write test cases and validate implementation

**Brief each agent — do not dump context.** Read the shared inputs **once** and pass a distilled brief inline: the lines each agent actually needs, never a file path for a document you have already read (an agent handed a path re-reads the whole file). Pass a path only for a document you have not read and only that agent needs.

**End every agent prompt with a return contract:** "Write your full output to `[path]` — observe inherited authorization and the assigned path boundary. Return **only** (1) the path written, (2) a ≤5-bullet summary of decisions, (3) any BLOCKED/CONCERNS items, one line each. Do not restate the documents you read." Without it, an agent returns everything it read back into this session. Implementation assignments must specify the affected files and respect existing authorization; ask only if an unresolved decision or authorization remains.

**Substitute a real path for `[path]`.** Every phase that produces an artifact
names one; most are fixed by the skill that already reads them:

| Phase / agent | Writes to | Destination fixed by |
|---|---|---|
| 1 game-designer (draft) | `production/combat/[feature]-gdd-draft.md` | this skill — you write the final `design/gdd/[feature].md` (Phase 1) |
| 2 gameplay-programmer | `docs/architecture/[feature]-sketch.md` | see note below |
| 2 engine specialist | `docs/architecture/[feature]-engine-notes.md` | see note below |
| 3 gameplay-programmer, ai-programmer, technical-artist | the code root and `assets/` — the files assigned within authorized scope | subject to existing user authorization and host permissions |
| 3 sound-designer | `production/combat/[feature]-audio-events.md` | this skill |
| 5 qa-tester (test cases) | `production/qa/test-cases/[feature]-cases.md` | `$team-qa` Phase 4 |
| 5 qa-tester (bugs) | `production/qa/bugs/BUG-[NNNN].md` | `$team-qa` Phase 5 |

Phase 6 is a spoken status report, not an artifact — no path, and none needed.

> **Every phase above names a concrete destination, deliberately.** The Error
> Recovery Protocol below says "a named artifact that is not on disk is a failed
> phase" — a check that cannot run when no path was named.
>
> **The two `docs/architecture/` entries are a judgement call, not a convention.**
> That directory holds ADRs (`adr-NNNN-*.md`); a sketch is a precursor to one, not
> one itself, and **nothing in the repo reads either file**. Say so when
> reporting, so the sketch is understood as a record rather than an input to a
> later gate.

> Named paths define assignment boundaries, not permission. Apply existing user authorization and host permissions; obtain a decision only for an unresolved choice or action outside that authorization.

Launch independent agents in parallel where the pipeline allows it (e.g., Phase 3 agents can run simultaneously).

## Pipeline

### Phase 1: Design
Delegate to **game-designer**:
- Create or update the design document for `design/gdd/[feature].md` from `.agents/docs/templates/game-design-document.md`, with `## Summary` and the sections `workflow` requires (Phase 0) — at `full`: mechanic overview, player fantasy, detailed rules, formulas with variable definitions, edge cases, dependencies, tuning knobs with safe ranges, and acceptance criteria
- Output: completed design document, drafted to `production/combat/[feature]-gdd-draft.md`

`design/` is outside the bounded write exception above, so the game-designer
drafts and **you** write the GDD — the pattern `$team-level` and
`$team-narrative` use. At the Phase 1 decision point, present the draft and ask
via `available user-question tool (or ask in plain text and wait)`: "May I write the design document to
`design/gdd/[feature].md`?" Write it on approval; nothing is written under
`design/` before that answer.

### Phase 2: Architecture
Delegate to **gameplay-programmer** (with **ai-programmer** if AI is involved):
- Review the design document, reading it by section: find the headings you need with the Grep tool (pattern `^#`, content mode) and Read those ranges with offset and limit
- Design the code architecture: class structure, interfaces, data flow
- Identify integration points with existing systems
- Output: architecture sketch with file list and interface definitions

Then spawn the **primary engine specialist** to validate the proposed architecture:
- Is the class/node/component structure idiomatic for the pinned engine? (e.g., Godot node hierarchy, Unity MonoBehaviour vs DOTS, Unreal Actor/Component design)
- Are there engine-native systems that should be used instead of custom implementations?
- Any proposed APIs that are deprecated or changed in the pinned engine version?
- Output: engine architecture notes — incorporate into the architecture before Phase 3 begins

If no engine is configured, skip the specialist spawn. **Record ``Engine validation: NOT ASSESSED — no engine configured (`engine.name` unset in `project.yaml`)`` in this run's output.** A skipped check that says nothing is indistinguishable from a check that passed.

Use `available user-question tool (or ask in plain text and wait)`:
- Prompt: "Architecture sketch complete. Approve to proceed with parallel implementation."
- Options:
  - `[A] Proceed — spawn implementation agents (gameplay-programmer, ai-programmer, technical-artist, sound-designer)`
  - `[B] Revise the architecture first — I'll describe what needs to change`
  - `[C] Stop here — I'll continue later`

Only spawn implementation agents if user selects [A]. (In `guided`/`autonomous`
mode this architecture gate is a normal phase transition — proceed to
implementation unless the architecture sketch came back BLOCKED, recording the
decision via `log_decision` in autonomous mode. The gate is not a release-
critical or irreversible decision, so it follows the standard pipeline rule.)

### Phase 3: Implementation (parallel where possible)
Delegate in parallel:
- **gameplay-programmer**: Implement core combat mechanic code
- **ai-programmer**: Implement AI behaviors (if the feature involves NPC reactions)
- **technical-artist**: Create VFX and shader effects
- **sound-designer**: Define audio event list and mixing notes, drafted to `production/combat/[feature]-audio-events.md`

The code, VFX and shader work is outside the bounded write exception: each of
those agents first returns the files it will create or change, you ask once for
the whole set, and they write only after a yes (File Write Protocol).

### Phase 4: Integration
- Wire together gameplay code, AI, VFX, and audio
- Ensure all tuning knobs are exposed and data-driven
- Verify the feature works with existing combat systems

**Gate**: Use `available user-question tool (or ask in plain text and wait)` to present the integration result and confirm before proceeding to Phase 5.

### Phase 5: Validation
Delegate to **qa-tester**:
- Write test cases from the acceptance criteria
- Test all edge cases documented in the design
- Verify performance impact is within budget
- File bug reports for any issues found

### Phase 6: Sign-off
- Collect results from all team members
- Report feature status: COMPLETE / NEEDS WORK / BLOCKED
- List any outstanding issues and their assigned owners

## Error Recovery Protocol

**First, verify the artifact.** If the return contract named a path, check the
path exists before treating the phase as done — **a named artifact that is not
on disk is a failed phase, however fluent the response reads.** An agent can
burn a full phase and return a plausible preamble having written nothing, which
is neither BLOCKED nor an error nor "cannot complete", so the trigger below
never fires. Resume it naming the unmet contract; the context is
usually still there.

If any spawned agent returns BLOCKED, errors, or cannot complete: **surface it
immediately, don't proceed past a dependency it blocks, and always produce a
partial report.** A skipped agent's section stays a named gap — never fill it with content of your own. Full procedure: `.agents/docs/error-recovery-protocol.md`.

Common blockers:
- Input file missing (story not found, GDD absent) → redirect to the skill that creates it
- ADR status is Proposed → do not implement; once it is decided, accept it with `$architecture-decision accept ADR-NNNN`
- Scope too large → split into two stories via `$create-stories`
- Conflicting instructions between ADR and story → surface the conflict, do not guess

## File Write Protocol

Assign each role its bounded work and paths. Existing user authorization and host permissions govern each write; a named path or phase gate does not itself grant permission. Preserve the pipeline’s final compilation ownership. When delegation is unavailable, disclose an in-session fallback or report PENDING. Prepare a reviewable draft only for unresolved decisions or actions outside authorization.

## Output

A summary report covering: design completion status, implementation status per team member, test results, and any open issues.

Verdict: **COMPLETE** — combat feature designed, implemented, and validated.

If the engine validation was skipped (Phase 2, no engine configured), the verdict
says so — never a plain COMPLETE:

Verdict: **COMPLETE — engine validation NOT ASSESSED ([reason])** — combat feature designed, implemented, and validated; the engine specialist never reviewed the architecture.

Verdict: **NEEDS WORK** — every phase ran, but Phase 5 validation left failures or open bugs unresolved; the report lists each with its owner.

Verdict: **BLOCKED** — one or more phases could not complete, or an agent was skipped (`.agents/docs/error-recovery-protocol.md` step 5); partial report produced with unresolved items listed.

## Next Steps

- Run `$code-review` on the implemented combat code before closing stories.
- Run `$balance-check` to validate combat formulas and tuning values.
- Run `$team-polish` if VFX, audio, or performance polish is needed.
