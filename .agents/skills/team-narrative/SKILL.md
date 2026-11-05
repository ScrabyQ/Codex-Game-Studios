---
name: team-narrative
description: "Orchestrate the narrative team — narrative-director, writer, world-builder, level-designer — for story, world lore, narrative-driven levels."
---

## Codex execution contract

**CGS-22 Codex team and authority contract:** Preserve this skill's exact argument/default discovery and bootstrap order: release may infer then confirm a version, QA may infer scope, and narrative/live-ops show usage when missing their required argument. Execute configuration resolution; never assume shell interpolation or source model metadata executes. Announce the actual team.size active set and routed roles, retaining phase-gate-only and review-mode exceptions. Claude Agent/subagent_type and TaskCreate/TaskGet/TaskList/TaskUpdate are source API names: use actual supported native delegation/local task facilities, or a scoped assignment ledger. Do not create external tasks without authorization.

Delegate only when supported, authorized and justified. A supported generic child can receive the complete relevant role brief, but report the actual mechanism and handle. Otherwise use **sequential in-session role execution; not independent review**: read the relevant adapted role and gate criteria, including gate files in-session when needed for this disclosed fallback, and perform the same bounded assignment/output/review contract. Source child-only writes map to the assigned role's authorized work, not permission to skip that role or grant the coordinator unrestricted writes. Keep the source's final compilation ownership and qa-lead reply-only sign-off return. A self-check or in-session opinion is never a fresh independent sign-off. Missing capability remains named PENDING/NOT ASSESSED; do not silently substitute a role or invent an executed review.

Each assignment carries phase, role, exact owned paths, inputs, dependencies, permission scope, expected artifact and return status. One active writer per canonical file; resolve case/alias/directory overlap before scheduling. Independent reviews write separate files and integration waits for every required artifact. A missing artifact or incomplete return fails the phase: resume the same role with the unmet contract, preserve partial outputs, and stop dependent phases if still blocked. Never fill a skipped department's section with invented findings. Named paths define ownership, not permission. All work follows inherited authorization and host permissions.

Preserve the decision hierarchy: peers consult without binding decisions outside their domain; unresolved conflicts go to their shared parent. If none exists, use creative-director for design conflicts or technical-director for technical conflicts. Narrative-director settles writer/world-builder canon disagreements by presenting reconciliation options for the user to confirm; do not automatically escalate a shared-parent canon dispute further. Producer coordinates schedules and propagation. Directors and producer offer domain recommendations/verdicts, **never user permission**. Prior authorization persists; do not ask again for an already authorized exact action. For an unresolved decision use an available native question tool or equivalent plain-text choices and wait; a skipped/empty answer is not consent.

Collaborative, guided and autonomous alter routine decision flow only. None grants write, commit/tag/push, deployment, publication, messaging, storefront, external-service or risk-override authority. Preserve all source unconditional approvals even when automation_always_ask omits their category. Log autonomous routine decisions with the real log_decision helper (or disclose a bounded local record fallback); logging cannot turn an unapproved action into an approved one. Do not turn leadership roles into a hidden permission service. A recommended handoff or monitoring plan is not an executed task, sent message, scheduled automation or published artifact.

Preserve canon-first inputs, dialogue <120 characters, named placeholders, string keys, localization headroom and draft/final paths. ND-CONSISTENCY is never skipped merely for lean/solo; at individual preserve the explicitly labeled writer self-check and pillar-conflict-only narrative-director escalation. APPROVE/CONCERNS/REJECT/NOT ASSESSED retain their separate effects; a self-check is not a gate verdict. Final design/narrative documents need their authorized final write set.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, TaskCreate, TaskGet, TaskList, TaskUpdate, Bash(bash "*/.agents/skills/team-narrative/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[narrative content description] [--review full|lean|solo]". 

# Team Narrative

If no argument is provided, output usage guidance and exit without spawning any agents:
> Usage: `$team-narrative [narrative content description] [--review full|lean|solo]` — describe the story content, scene, or narrative area to work on (e.g., `boss encounter cutscene`, `faction intro dialogue`, `tutorial narrative`). Do not use `available user-question tool (or ask in plain text and wait)` here; output the guidance directly.

When this skill is invoked with an argument, orchestrate the narrative team through a structured pipeline.

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

**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,team.size`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

`review_mode` sets director-gate depth, and this pipeline has no director gate:
no phase below spawns CD-, TD-, PR- or AD-PHASE-GATE, at any `review_mode`. Its
phase gates are the pipeline's own decision points (defined under `team.size`
below), and the agents that work at them are team members, not director gates.

Phase 4's ND-CONSISTENCY is the exception in every mode: it is this pipeline's own
review, not an optional director gate, so `review_mode` never skips it (`team.size`
still decides who runs it — see Phase 4).

`automation` drives the Decision Points note above. See the Decision Points note above and
`.agents/docs/automation-modes.md` for how each mode changes pipeline behavior.

**`team.size`**: which agents are active (orthogonal to review_mode gate-depth and workflow docs).
- **`individual`** (default): `writer` only; `narrative-director` invoked only on an explicit pillar conflict. Other agents consulted via the writer, not spawned separately.
- **`small`**: `narrative-director` + `writer`, plus `localization-lead` and `world-builder` when `review_mode` is `full` (at `lean` and `solo` they are consulted through the writer).
- **`studio`**: all six Team Composition agents, whatever the `review_mode` (the full pipeline as documented).
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
- **narrative-director** — Story arcs, character design, dialogue strategy, narrative vision
- **writer** — Dialogue writing, lore entries, item descriptions, in-game text
- **world-builder** — World rules, faction design, history, geography, environmental storytelling
- **art-director** — Character visual design, environmental visual storytelling, cutscene/cinematic tone
- **level-designer** — Level layouts that serve the narrative, pacing, environmental storytelling beats
- **localization-lead** — Localization readiness — flags non-localizable strings, cultural assumptions, and i18n gaps

## How to Delegate

Use authorized native delegation when available for the following roles; otherwise use the disclosed in-session fallback or report PENDING:
- `narrative-director` — Story arcs, character design, narrative vision
- `writer` — Dialogue writing, lore entries, in-game text
- `world-builder` — World rules, faction design, history, geography
- `art-director` — Character visual profiles, environmental visual storytelling, cinematic tone
- `level-designer` — Level layouts that serve the narrative, pacing
- `localization-lead` — Localization readiness — flags non-localizable strings, cultural assumptions, and i18n gaps

**Read the canon first.** Before Phase 1, read the shared inputs that exist — the narrative bible or tone guide, the character and faction files under `design/narrative/`, and the world rules. Never tell an agent to invent canon: if none exists, say so and ask the user before any drafting.

**Brief each agent — do not dump context.** Read the shared inputs **once** and pass a distilled brief inline: the lines each agent actually needs, never a file path for a document you have already read (an agent handed a path re-reads the whole file). Pass a path only for a document you have not read and only that agent needs.

**End every agent prompt with a return contract:** "Write your full output to `[path]` — observe inherited authorization and the assigned path boundary. Return **only** (1) the path written, (2) a ≤5-bullet summary of decisions, (3) any BLOCKED/CONCERNS items, one line each. Do not restate the documents you read." Without it, an agent returns everything it read back into this session.

**Substitute a real path for `[path]`.** Agents write drafts under
`production/narrative/[content-slug]/` — within the assigned authorized scope. The
finished documents belong in `design/narrative/`, which the exception does **not**
cover, so **you** write those after one approval (see "Write the finals"):

| Agent | Drafts to (`[path]`) | Final document (you write it) |
|---|---|---|
| narrative-director | `production/narrative/[content-slug]/brief.md` | `design/narrative/[content-slug]-brief.md` |
| world-builder | `production/narrative/[content-slug]/lore-[topic].md` | `design/narrative/lore/[topic].md` |
| writer | `production/narrative/[content-slug]/dialogue-[scene-slug].md` | `design/narrative/dialogue/[scene-slug].md` |
| art-director | `production/narrative/[content-slug]/visual-direction.md` | `design/narrative/[content-slug]-visual-direction.md` |
| level-designer | `production/narrative/[content-slug]/level-integration.md` | `design/narrative/[content-slug]-level-integration.md` |
| localization-lead | `production/narrative/[content-slug]/i18n-review.md` | stays in `production/` — a review, not a design document |

> **The final destination is not a free choice.** `design/narrative/` is read by
> `$asset-spec`, `$design-review`, `$localize`, `$onboard`,
> `$project-stage-detect`, `$team-level` and the `cd-narrative` director gate.
> An artifact written anywhere else is invisible to all seven.
>
> The `[path]` contract above has a precondition: the path is one *you* named. A
> skill that states the contract but names no concrete destination leaves every
> run to invent one, which defeats it. `$team-qa` Phase 4 carries the same
> requirement for the same reason.

> Named paths define assignment boundaries, not permission. Apply existing user authorization and host permissions; obtain a decision only for an unresolved choice or action outside that authorization.

Launch independent agents in parallel where the pipeline allows it (e.g., Phase 2 agents can run simultaneously).

## Pipeline

### Phase 1: Narrative Direction
Delegate to **narrative-director**:
- Define the narrative purpose of this content: what story beat does it serve?
- Identify characters involved, their motivations, and how this fits the overall arc
- Set the emotional tone and pacing targets
- Specify any lore dependencies or new lore this introduces
- Output: narrative brief with story requirements

### Phase 2: World Foundation (parallel)
When authorized native delegation is available, delegate independent work in parallel and collect all results; otherwise use the disclosed in-session fallback or report PENDING:
- **world-builder**: Create or update lore entries for factions, locations, and history relevant to this content. Cross-reference against existing lore for contradictions. Set canon level for new entries.
- **writer**: Draft character dialogue using voice profiles. Ensure all lines are under 120 characters, use named placeholders for variables, and are localization-ready.
- **art-director**: Define character visual design direction for key characters appearing in this content (silhouette, visual archetype, distinguishing features). Specify environmental visual storytelling elements for each key space (prop composition, lighting notes, spatial arrangement). Define tone palette and cinematic direction for any cutscenes or scripted sequences.

**Phase gate:** collect all three Phase 2 outputs, then apply the Decision Points
rule before starting Phase 3 — present the lore, dialogue, and visual direction
summaries and capture approval via `available user-question tool (or ask in plain text and wait)` in `collaborative` mode
(auto-advance in `guided` unless a result is BLOCKED; `log_decision` in
`autonomous`).

### Phase 3: Level Narrative Integration
Delegate to **level-designer**:
- Review the narrative brief and lore foundation
- Design environmental storytelling elements in the level
- Place narrative triggers, dialogue zones, and discovery points
- Ensure pacing serves both gameplay and story

### Phase 4: Review and Consistency
Spawn `narrative-director` using available authorized native delegation using gate **ND-CONSISTENCY**
(`.agents/docs/director-gates/nd-consistency.md`). This phase runs in every review
mode — it is this pipeline's own review, not an optional director gate. Pass the
context that gate lists (the Phase 2–3 draft paths, the narrative bible or tone
guide, the world rules, the affected character and faction profiles) — named
here, so do not read the gate file in this session — and add:
- Confirm narrative pacing aligns with level design
- Check that all mysteries have documented "true answers"

Act on the verdict: **APPROVE** → Phase 5. **CONCERNS** → show the listed
inconsistencies and ask via `available user-question tool (or ask in plain text and wait)` whether to revise them (re-spawn the
agent that owns each) or accept them. **REJECT** → do not start Phase 5; the
contradictions are fixed first. **NOT ASSESSED [missing input]** → name the
missing input, then supply it and re-run the gate, or carry
`ND-CONSISTENCY: NOT ASSESSED — [input]` into the report's consistency review
results; it is never read as APPROVE (`.agents/docs/director-gates.md`).

**At `team.size: individual`** narrative-director is not in the active set, so the
gate is not spawned. The writer checks the drafts against the same criteria, and
the output says so by name: "ND-CONSISTENCY not run — narrative-director is not
active at `team.size: individual`; consistency self-checked by writer." A
self-check is not the gate's verdict, and the report must not present it as one.

### Phase 5: Polish (parallel)
When authorized native delegation is available, delegate independent work in parallel and collect all results; otherwise use the disclosed in-session fallback or report PENDING:
- **writer**: Final self-review — verify no line exceeds dialogue box constraints, all text uses string keys (not raw strings), placeholder variable names are consistent
- **localization-lead**: Validate i18n compliance — check string key naming conventions, flag any strings with hardcoded formatting that won't survive translation, verify character limit headroom for languages that expand (German/Finnish typically +30%), confirm no cultural assumptions in text that would need locale-specific variants
- **world-builder**: Finalize canon levels for all new lore entries

### Write the finals
You hold every draft. List the final documents from the table above, then ask once
via `available user-question tool (or ask in plain text and wait)` — "May I write these [N] narrative documents to
`design/narrative/`?" — and write them on approval. The drafts under
`production/narrative/[content-slug]/` stay as the working record.

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

A summary report covering: narrative brief status, lore entries created/updated, dialogue lines written, level narrative integration points, consistency review results, and any unresolved contradictions — including any localization issue the user chose to leave unfixed, by string key.

Verdict: **COMPLETE** — narrative content delivered.

If ND-CONSISTENCY answered NOT ASSESSED and that was carried into the report
(Phase 4), the verdict says so — never a plain COMPLETE:

Verdict: **COMPLETE — consistency NOT ASSESSED ([input])** — narrative content delivered; the consistency review could not run for want of [input].

If the pipeline stops because a dependency is unresolved (e.g., lore contradiction or missing prerequisite not resolved by the user):

Verdict: **BLOCKED** — [reason]

## Next Steps

- Run `$design-review` on the narrative documents for consistency validation.
- Run `$localize extract` to extract new strings for translation after dialogue is finalized.
- Run `$dev-story` to implement dialogue triggers and narrative events in-engine.
