---
name: team-level
description: "Orchestrate the level team — level-designer, narrative-director, world-builder, art-director, systems-designer, qa-tester — for complete area creation."
---

## Codex execution contract

**CGS-21 Codex team execution contract:** Check the required argument before bootstrap, project reads, task creation or delegation. Then execute the explicit config bootstrap and announce the resolved team.size active set and every routed/not-spawned role. Team size, workflow and review depth are separate; these pipelines have their own decision points, not invented director phase gates. Do not assume shell interpolation, Claude Agent, subagent_type, or TaskCreate/TaskGet/TaskList/TaskUpdate are Codex APIs. Use native supported delegation and an available plan/task facility, or a local assignment ledger within the already authorized scope. Do not create external tracker tasks without authorization. Never infer model availability from source model metadata.

Choose actual subagents only when supported, authorized, and justified by independent work or a required independent view. Keep source department roles and active-set restrictions. A generic native child with the complete relevant adapted role brief can perform that role if actually spawned; report the mechanism and actual child handle. If unavailable or unnecessary, explicitly select **sequential in-session role execution; not independent review**, read the relevant role instructions, and perform each assigned role's phase in order. In this fallback the current Codex performs writes as the assigned role under that role's exact ownership and authorization; source wording requiring child-only writes is a source-runtime mechanism, not a reason to omit the fallback. Keep the source's special final-compilation ownership. A deliberately skipped or failed role is not the same as a completed sequential role: never silently fill its missing section or claim a fresh independent review.

Before any write, make an assignment with phase, role, mechanism, distilled inputs, exact owned paths, dependencies, allowed actions, expected artifact/return contract, and escalation. Resolve each path against the project root and account for aliases/case and ancestor-directory overlap. There is one active writer per file. If assignments overlap, do not launch them simultaneously: appoint one owner or serialize an explicit handoff after the first owner returns and the coordinator verifies the artifact. Reviewers read shared inputs and write separate review-[role] files. All required outputs must exist and be inspected before integration; integrate through one assigned owner. Read shared inputs once, pass relevant content rather than asking each role to reread everything, and preserve the source's summary/concerns return shape.

Existing user authorization persists, including explicit synthetic fixture choices. A named path or phase gate defines scope but does not itself grant permission. For implementation, propose and obtain authorization for the whole exact file set before editing unless that set is already authorized; normal phase approval alone does not supply missing write authorization. Available native questions or the same numbered plain-text choices replace widgets; wait for any required unanswered decision. Automation never grants permission or silently accepts an always-ask risk.

After each role, verify the named artifact, report actual status and evidence, and preserve outputs already completed. Missing artifact or incomplete response is a failed phase: surface it immediately, resume the same child or same sequential role with the unmet contract, then record BLOCKED if it still cannot complete. Offer the source retry/skip/stop choices and halt dependent phases. A chosen skip retains the gap and the source's blocked/unknown verdict precedence. Do not fabricate tests, engine validation, screenshots, profiling, assets, accessibility compliance or independent review. Pipeline parallel directives below mean issue independent calls together only when real delegation is available and paths do not conflict; the disclosed sequential fallback retains the same phase dependencies, artifacts, review criteria and output format.

Preserve narrative/lore/visual direction as inputs to layout, then systems, production concepts/accessibility and QA. Missing adjacent areas need the explicit placeholder-or-pause choice; retain UNRESOLVED references and do not invent neighboring content. BLOCKING accessibility concerns require acknowledgment before QA. Keep per-role working files and compile the final slugged design/levels document once in the orchestrator after its own write authorization; do not respawn merely to compile.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, TaskCreate, TaskGet, TaskList, TaskUpdate, Bash(bash "*/.agents/skills/team-level/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[level name or area to design] [--review full|lean|solo]". 


# Team Level

If no argument is provided, output usage guidance and exit without spawning any agents or reading any design files:
> Usage: `$team-level [level name or area to design] [--review full|lean|solo]` — specify the level or area to design (e.g., `forest temple`, `tutorial village`, `final boss arena`). Do not use `available user-question tool (or ask in plain text and wait)` here; output the guidance directly.

When this skill is invoked:

**Decision Points:** At each step transition, use `available user-question tool (or ask in plain text and wait)` to present
the user with the subagent's proposals as selectable options. Write the agent's
full analysis in conversation, then capture the decision with concise labels.
In collaborative mode, surface unresolved phase decisions and wait for the user; preserve decisions and actions already authorized.
In `guided` mode the pipeline advances automatically unless a step is BLOCKED;
in `autonomous` mode it runs end to end, recording each step outcome via
`log_decision`. Decisions in `automation_always_ask` categories
(`is_always_ask_category` helper) always prompt regardless of mode. See
`.agents/docs/automation-modes.md`.

## Phase 0: Resolve Config

**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,team.size`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

`review_mode` sets director-gate depth, and this pipeline has no director gate:
no phase below spawns CD-, TD-, PR- or AD-PHASE-GATE, at any `review_mode`. Its
phase gates are the pipeline's own decision points (defined under `team.size`
below), and the agents that work at them are team members, not director gates.

`automation` drives the Decision Points note above. See the Decision Points note above and
`.agents/docs/automation-modes.md` for how each mode changes pipeline behavior.

**`team.size`**: which agents are active (orthogonal to review_mode gate-depth and workflow docs).
- **`individual`** (default): `level-designer` only. Other agents consulted via the level-designer, not spawned separately.
- **`small`**: + `systems-designer` + `art-director` + `qa-tester`.
- **`studio`**: + `narrative-director` + `world-builder` + `accessibility-specialist` (the full pipeline as documented).
A non-core agent needed at `individual` routes through the nearest active core agent with an informational note. **"Phase gate" means any phase that ends in an `available user-question tool (or ask in plain text and wait)` decision point this pipeline itself lists** — a transition under Decision Points above, or a **Gate** step written into the pipeline below — **whatever the `automation` mode.** `guided` and `autonomous` change how a gate is passed (it auto-advances, or is recorded with `log_decision`), not whether it is one, so bounded-exception condition (3) below holds at it in every mode. An agent restricted to "phase gates only" is spawned at those points and no others. This active-set scoping applies throughout the pipeline below: any phase that names an agent outside the active set routes through the nearest core agent rather than spawning it.

**Announce the active set before Step 1 — never let the collapse be silent.**
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

1. **Read the argument** for the target level or area (e.g., `tutorial`,
   `forest dungeon`, `hub town`, `final boss arena`).

2. **Gather context** (read each design doc by section: find the headings you need
   with the Grep tool with pattern `^#` in content mode, and Read those ranges
   with offset and limit):
   - Read the game concept at `design/gdd/game-concept.md` — or `design/game-brief.md`,
     the one-page brief that replaces it at `rigor: minimal` — if either exists
   - Read game pillars at `design/gdd/game-pillars.md`
   - Read existing level docs in `design/levels/`
   - Read relevant narrative docs in `design/narrative/`
   - Read world-building docs for the area's region/faction

## How to Delegate

Use authorized native delegation when available for the following roles; otherwise use the disclosed in-session fallback or report PENDING:
- `narrative-director` — Narrative purpose, characters, emotional arc
- `world-builder` — Lore context, environmental storytelling, world rules
- `level-designer` — Spatial layout, pacing, encounters, navigation
- `systems-designer` — Enemy compositions, loot tables, difficulty balance
- `art-director` — Visual theme, color palette, lighting, asset requirements
- `accessibility-specialist` — Navigation clarity, colorblind safety, cognitive load
- `qa-tester` — Test cases, boundary testing, playtest checklist

**Brief each agent — do not dump context.** Read the shared inputs **once** and pass a distilled brief inline: the lines each agent actually needs, never a file path for a document you have already read (an agent handed a path re-reads the whole file). Pass a path only for a document you have not read and only that agent needs.

**End every agent prompt with a return contract:** "Write your full output to `[path]` — observe inherited authorization and the assigned path boundary. Return **only** (1) the path written, (2) a ≤5-bullet summary of decisions, (3) any BLOCKED/CONCERNS items, one line each. Do not restate the documents you read." Without it, an agent returns everything it read back into this session.

**Substitute a real path for `[path]`.** Working artifacts go under
`production/levels/[level-name]/`, slugged as in the "Save to" step below. One
file per agent, so the parallel steps never share one:

| Step / agent | Writes to |
|---|---|
| 1 narrative-director | `production/levels/[level-name]/narrative.md` |
| 1 world-builder | `production/levels/[level-name]/lore.md` |
| 1 art-director | `production/levels/[level-name]/visual-direction.md` |
| 2 level-designer | `production/levels/[level-name]/layout.md` |
| 3 systems-designer | `production/levels/[level-name]/systems.md` |
| 4 art-director | `production/levels/[level-name]/production-concepts.md` |
| 4 accessibility-specialist | `production/levels/[level-name]/accessibility.md` |
| 5 qa-tester | `production/qa/test-cases/[level-name]-cases.md` — test cases, edge cases, playtest checklist, acceptance criteria |

These are working drafts; the durable record is the level design document you
compile from them (`design/levels/[level-name].md`).

> Named paths define assignment boundaries, not permission. Apply existing user authorization and host permissions; obtain a decision only for an unresolved choice or action outside that authorization.

3. **Orchestrate the level design team** in sequence:

### Step 1: Narrative + Visual Direction (narrative-director + world-builder + art-director, parallel)

When authorized native delegation is available, run independent assignments in parallel and collect all results. Otherwise use the disclosed in-session fallback or report PENDING.

Spawn the `narrative-director` agent to:
- Define the narrative purpose of this area (what story beats happen here?)
- Identify key characters, dialogue triggers, and lore elements
- Specify emotional arc (how should the player feel entering, during, leaving?)

Spawn the `world-builder` agent to:
- Provide lore context for the area (history, faction presence, ecology)
- Define environmental storytelling opportunities
- Specify any world rules that affect gameplay in this area

Spawn the `art-director` agent to:
- Establish visual theme targets for this area — these are INPUTS to layout, not outputs of it
- Define the color temperature and lighting mood for this area (how does it differ from adjacent areas?)
- Specify shape language direction (angular fortress? organic cave? decayed grandeur?)
- Name the primary visual landmarks that will orient the player
- Read `design/art/art-bible.md` if it exists — anchor all direction in the established art bible. Read it by section: find the headings you need with the Grep tool (pattern `^#`, content mode) and Read those ranges with offset and limit.

**The art-director's visual targets from Step 1 must be passed to the level-designer in Step 2** as explicit constraints. Layout decisions happen within the visual direction, not before it.

**Gate**: Use `available user-question tool (or ask in plain text and wait)` to present all three Step 1 outputs (narrative brief, lore foundation, visual direction targets) and confirm before proceeding to Step 2.

### Step 2: Layout and Encounter Design (level-designer)
Spawn the `level-designer` agent with the full Step 1 output as context:
- Narrative brief (from narrative-director)
- Lore foundation (from world-builder)
- **Visual direction targets (from art-director)** — layout must work within these targets, not contradict them

The level-designer should:
- Design the spatial layout (critical path, optional paths, secrets) — ensuring primary routes align with the visual landmark targets from Step 1
- Define pacing curve (tension peaks, rest areas, exploration zones) — coordinated with the emotional arc from narrative-director
- Place encounters with difficulty progression
- Design environmental puzzles or navigation challenges
- Define points of interest and landmarks for wayfinding — these must match the visual landmarks the art-director specified
- Specify entry/exit points and connections to adjacent areas

**Adjacent area dependency check**: After the layout is produced, check `design/levels/` for each adjacent area referenced by the level-designer. If any referenced area's `.md` file does not exist, surface the gap:
> "Level references [area-name] as an adjacent area but `design/levels/[area-name].md` does not exist."

Use `available user-question tool (or ask in plain text and wait)` with options:
- (a) Proceed with a placeholder reference — mark the connection as UNRESOLVED in the level doc and list it in the open cross-level dependencies section of the summary report
- (b) Pause and run `$team-level [area-name]` first to establish that area

Do NOT invent content for the missing adjacent area.

**Gate**: Use `available user-question tool (or ask in plain text and wait)` to present Step 2 layout (including any unresolved adjacent area dependencies) and confirm before proceeding to Step 3.

### Step 3: Systems Integration (systems-designer)
Spawn the `systems-designer` agent to:
- Specify enemy compositions and encounter formulas
- Define loot tables and reward placement
- Balance difficulty relative to expected player level/gear
- Design any area-specific mechanics or environmental hazards
- Specify resource distribution (health pickups, save points, shops)

**Gate**: Use `available user-question tool (or ask in plain text and wait)` to present Step 3 outputs and confirm before proceeding to Step 4.

### Step 4: Production Concepts + Accessibility (art-director + accessibility-specialist, parallel)

**Note**: The art-director's directional pass (visual theme, color targets, mood) happened in Step 1. This pass is location-specific production concepts — given the finalized layout, what does each specific space look like?

Spawn the `art-director` agent with the finalized layout from Step 2:
- Produce location-specific concept specs for key spaces (entrance, key encounter zones, landmarks, exits)
- Specify which art assets are unique to this area vs. shared from the global pool
- Define sight-line and lighting setups per key space (these are now layout-informed, not directional)
- Specify VFX needs that are specific to this area's layout (weather volumes, particles, atmospheric effects)
- Flag any locations where the layout creates visual direction conflicts with the Step 1 targets — surface these as production risks

Spawn the `accessibility-specialist` agent in parallel to:
- Review the level layout for navigation clarity (can players orient themselves without relying on color alone?)
- Check that critical path signposting uses shape/icon/sound cues in addition to color
- Review any puzzle mechanics for cognitive load — flag anything that requires holding more than 3 simultaneous states
- Check that key gameplay areas have sufficient contrast for colorblind players
- Output: accessibility concerns list with severity (BLOCKING / RECOMMENDED / NICE TO HAVE)

Wait for both agents to return before proceeding.

**Gate**: Use `available user-question tool (or ask in plain text and wait)` to present both Step 4 results. If the accessibility-specialist returned any BLOCKING concerns, highlight them prominently and offer:
- (a) Return to level-designer and art-director to redesign the flagged elements before Step 5
- (b) Document as a known accessibility gap and proceed to Step 5 with the concern explicitly logged in the final report

Do NOT proceed to Step 5 without the user acknowledging any BLOCKING accessibility concerns.

### Step 5: QA Planning (qa-tester)
Spawn the `qa-tester` agent to:
- Write test cases for the critical path
- Identify boundary and edge cases (sequence breaks, softlocks)
- Create a playtest checklist for the area
- Define acceptance criteria for level completion

4. **Compile the level design document** combining all team outputs into the
   level design template format.

The orchestrator already holds every sub-agent's output — **compile the document
itself; do not re-spawn `level-designer` and re-send all outputs verbatim.** That
second spawn pays a fresh agent's overhead plus a full re-transmission of context
the orchestrator already has, to move text it is already holding. After compiling
into the level-design template format, ask the user directly via
`available user-question tool (or ask in plain text and wait)`: "May I write the compiled level design to
`design/levels/[level-name].md`?" On approval, write it.

5. **Save to** `design/levels/[level-name].md` after that approval.
   `[level-name]` is the argument as a slug — lowercase, spaces → hyphens
   (`forest dungeon` → `forest-dungeon.md`) — and `[area-name]` in the adjacent
   area check is slugged the same way.

6. **Output a summary** with: area overview, encounter count, estimated asset
   list, narrative beats, any cross-team dependencies or open questions, open
   cross-level dependencies (adjacent areas referenced but not yet designed, each
   marked UNRESOLVED), and accessibility concerns with their resolution status.

## File Write Protocol

Assign each role its bounded work and paths. Existing user authorization and host permissions govern each write; a named path or phase gate does not itself grant permission. Preserve the pipeline’s final compilation ownership. When delegation is unavailable, disclose an in-session fallback or report PENDING. Prepare a reviewable draft only for unresolved decisions or actions outside authorization.

Verdict: **COMPLETE** — level design document produced and all team outputs compiled.
Verdict: **BLOCKED** — one or more agents blocked, or an agent was skipped (`.agents/docs/error-recovery-protocol.md` step 5); partial report produced with unresolved items listed.

## Next Steps

- Run `$design-review design/levels/[level-name].md` to validate the completed level design doc.
- Run `$dev-story` to implement level content once the design is approved.
- Run `$qa-plan` to generate a QA test plan for this level.

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
