---
name: team-polish
description: "Orchestrate the polish team — performance-analyst, technical-artist, sound-designer, qa-tester — to optimize and harden a feature or area."
---

## Codex execution contract

**CGS-21 Codex team execution contract:** Check the required argument before bootstrap, project reads, task creation or delegation. Then execute the explicit config bootstrap and announce the resolved team.size active set and every routed/not-spawned role. Team size, workflow and review depth are separate; these pipelines have their own decision points, not invented director phase gates. Do not assume shell interpolation, Claude Agent, subagent_type, or TaskCreate/TaskGet/TaskList/TaskUpdate are Codex APIs. Use native supported delegation and an available plan/task facility, or a local assignment ledger within the already authorized scope. Do not create external tracker tasks without authorization. Never infer model availability from source model metadata.

Choose actual subagents only when supported, authorized, and justified by independent work or a required independent view. Keep source department roles and active-set restrictions. A generic native child with the complete relevant adapted role brief can perform that role if actually spawned; report the mechanism and actual child handle. If unavailable or unnecessary, explicitly select **sequential in-session role execution; not independent review**, read the relevant role instructions, and perform each assigned role's phase in order. In this fallback the current Codex performs writes as the assigned role under that role's exact ownership and authorization; source wording requiring child-only writes is a source-runtime mechanism, not a reason to omit the fallback. Keep the source's special final-compilation ownership. A deliberately skipped or failed role is not the same as a completed sequential role: never silently fill its missing section or claim a fresh independent review.

Before any write, make an assignment with phase, role, mechanism, distilled inputs, exact owned paths, dependencies, allowed actions, expected artifact/return contract, and escalation. Resolve each path against the project root and account for aliases/case and ancestor-directory overlap. There is one active writer per file. If assignments overlap, do not launch them simultaneously: appoint one owner or serialize an explicit handoff after the first owner returns and the coordinator verifies the artifact. Reviewers read shared inputs and write separate review-[role] files. All required outputs must exist and be inspected before integration; integrate through one assigned owner. Read shared inputs once, pass relevant content rather than asking each role to reread everything, and preserve the source's summary/concerns return shape.

Existing user authorization persists, including explicit synthetic fixture choices. A named path or phase gate defines scope but does not itself grant permission. For implementation, propose and obtain authorization for the whole exact file set before editing unless that set is already authorized; normal phase approval alone does not supply missing write authorization. Available native questions or the same numbered plain-text choices replace widgets; wait for any required unanswered decision. Automation never grants permission or silently accepts an always-ask risk.

After each role, verify the named artifact, report actual status and evidence, and preserve outputs already completed. Missing artifact or incomplete response is a failed phase: surface it immediately, resume the same child or same sequential role with the unmet contract, then record BLOCKED if it still cannot complete. Offer the source retry/skip/stop choices and halt dependent phases. A chosen skip retains the gap and the source's blocked/unknown verdict precedence. Do not fabricate tests, engine validation, screenshots, profiling, assets, accessibility compliance or independent review. Pipeline parallel directives below mean issue independent calls together only when real delegation is available and paths do not conflict; the disclosed sequential fallback retains the same phase dependencies, artifacts, review criteria and output format.

The performance-analyst recommends and assigns; it does not edit game code. Only activate engine-programmer for measured engine-level causes and tools-programmer for tool causes; inactive programmer items go to $dev-story. Preserve NEEDS MORE WORK > NOT ASSESSED > READY FOR RELEASE. An unset budget or unrun phase cannot pass; a known overrun/regression still wins. Keep the production/polish record-only path, measured before/after provenance, and minimal-workflow build-order handoff instead of sprints.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, TaskCreate, TaskGet, TaskList, TaskUpdate, Bash(bash "*/.agents/skills/team-polish/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[feature or area to polish] [--review full|lean|solo]". 

# Team Polish

If no argument is provided, output usage guidance and exit without spawning any agents:
> Usage: `$team-polish [feature or area to polish] [--review full|lean|solo]` — specify the feature or area to polish (e.g., `combat`, `main menu`, `inventory system`, `level-1`). Do not use `available user-question tool (or ask in plain text and wait)` here; output the guidance directly.

When this skill is invoked with an argument, orchestrate the polish team through a structured pipeline.

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

**`team.size`**: which agents are active (orthogonal to review_mode gate-depth and workflow docs).
- **`individual`** (default): `performance-analyst` + `technical-artist`. Other agents consulted via these two, not spawned separately. No programmer is active, so the optimisation list's programmer items are not implemented in this run — the report names the list as handed to `$dev-story` (Phase 2).
- **`small`**: + `sound-designer` + `qa-tester` + `engine-programmer`, and `tools-programmer` when Phase 1 traces a cause to a content authoring tool (the full pipeline as documented).
- **`studio`**: the `small` set, `engine-programmer` included, + an adversarial review pass: Phase 5's qa-tester is told "your job is not to confirm this holds — find how it breaks", and the report says the pass ran. This pipeline has no engine specialist to widen; engine-level work stays with `engine-programmer`.
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
- **performance-analyst** — Profiling, memory analysis, frame budget, and the optimisation list — it writes no game code
- **engine-programmer** — Implements the optimisation list's engine-level items: rendering pipeline, memory, resource loading, hot paths (invoke when performance-analyst identifies low-level root causes)
- **technical-artist** — VFX polish, shader optimization, visual quality
- **sound-designer** — Audio polish, mixing, ambient layers, feedback sounds
- **tools-programmer** — Content pipeline tool verification, editor tool stability, automation fixes (Phase 2, when Phase 1 traces a cause to a content authoring tool)
- **qa-tester** — Edge case testing, regression testing, soak testing

## How to Delegate

Use authorized native delegation when available for the following roles; otherwise use the disclosed in-session fallback or report PENDING:
- `performance-analyst` — Profiling, memory analysis, the optimisation list
- `engine-programmer` — Engine-level fixes from the optimisation list: rendering, memory, resource loading
- `technical-artist` — VFX polish, shader optimization, visual quality
- `sound-designer` — Audio polish, mixing, ambient layers
- `tools-programmer` — Content pipeline and editor tool fixes from the optimisation list
- `qa-tester` — Edge case testing, regression testing, soak testing

**Brief each agent — do not dump context.** Read the shared inputs **once** and pass a distilled brief inline: the lines each agent actually needs, never a file path for a document you have already read (an agent handed a path re-reads the whole file). Pass a path only for a document you have not read and only that agent needs.

**End every agent prompt with a return contract:** "Write your full output to `[path]` — observe inherited authorization and the assigned path boundary. Return **only** (1) the path written, (2) a ≤5-bullet summary of decisions, (3) any BLOCKED/CONCERNS items, one line each. Do not restate the documents you read." Without it, an agent returns everything it read back into this session. Implementation assignments must specify the affected files and respect existing authorization; ask only if an unresolved decision or authorization remains.

**Substitute a real path for `[path]` — this skill's destination is
`production/polish/`.** Name it per agent, one file each:

| Agent | Writes to |
|---|---|
| performance-analyst | `production/polish/[area]-report-[date].md` |
| technical-artist | `production/polish/[area]-render-notes-[date].md` |
| engine-programmer | `production/polish/[area]-engine-fixes-[date].md` |
| tools-programmer | `production/polish/[area]-tool-fixes-[date].md` |
| sound-designer | `production/polish/[area]-audio-notes-[date].md` |
| qa-tester | `production/polish/[area]-verification-[date].md` |

> **Why `production/` and not `docs/`.** These are date-stamped measurements of
> one run, the same shape as `production/qa/smoke-[date].md` — not durable
> specifications like `docs/architecture/`. Keeping them beside the other
> point-in-time process artifacts is what makes a later comparison possible.
>
> The `[path]` contract above has a precondition: the path is one *you* named, so
> a concrete destination must be stated here or every run invents one. Unlike
> `$team-qa` and `$team-narrative`, whose destinations are fixed by their
> consumers, this location has no reader in the repo and was chosen deliberately.
> **Nothing reads `production/polish/` yet** — say so when reporting, so the user
> knows the report is a record rather than an input to a later gate.

> Named paths define assignment boundaries, not permission. Apply existing user authorization and host permissions; obtain a decision only for an unresolved choice or action outside that authorization.

Launch independent agents in parallel where the pipeline allows it (e.g., Phases 3 and 4 can run simultaneously).

## Pipeline

### Phase 1: Assessment
Delegate to **performance-analyst**:
- Profile the target feature/area using `$perf-profile`
- Identify performance bottlenecks and frame budget violations
- Measure memory usage and check for leaks
- Benchmark against target hardware specs
- Output: performance report with the prioritized **optimisation list** — for each item, the change, its expected gain against the budget, and its owner (technical-artist for rendering-side changes, engine-programmer for engine systems and hot paths, tools-programmer for a content authoring tool, otherwise the programmer who owns the system)

### Phase 2: Optimization
performance-analyst writes no game code ("recommend and assign", its agent file),
so Phase 2 implements its Phase 1 list through the owners in the active set:
- **engine-programmer** — spawned only when Phase 1 identified engine-level root causes (rendering pipeline, resource loading, memory allocator, hot paths in core loops): implement those items, fix allocation pressure, verify gameplay behavior is unchanged. Output: engine-level fixes with before/after metrics and profiler validation
- **tools-programmer** — only when Phase 1 traced a cause to a content authoring tool: fix the tool. Output: tool fixes with before/after metrics
- **technical-artist** — rendering-side items (draw calls, overdraw, particles, shaders, LOD) join its Phase 3 brief

Every implementing agent in Phases 2–4 first returns the files it will create or
change, and you ask once for the whole Phase 2–4 set before any is edited (File
Write Protocol).

**An item whose owner is not in the active set is not implemented in this run.**
At `team.size: individual` that is every programmer item, since no programmer is
active; at any size it includes an item owned by a programmer this pipeline does
not name (e.g. gameplay-programmer for a gameplay-script hot spot). The report
lists those items with their owners under
"Optimisation list handed to `$dev-story`: `production/polish/[area]-report-[date].md`".
A metric they target that is over budget stays a known problem at Phase 6.

### Phase 3: Visual Polish (parallel with Phase 2)
Delegate to **technical-artist**:
- Review VFX for quality and consistency with art bible
- Optimize particle systems and shader effects
- Add screen shake, camera effects, and visual juice where appropriate
- Ensure effects degrade gracefully on lower settings
- Output: polished visual effects

### Phase 4: Audio Polish (parallel with Phase 2)
Delegate to **sound-designer**:
- Review audio events for completeness (are any actions missing sound feedback?)
- Check audio mix levels — nothing too loud or too quiet relative to the mix
- Add ambient audio layers for atmosphere
- Verify audio plays correctly with spatial positioning
- Output: audio polish list and mixing notes

### Phase 5: Hardening
Delegate to **qa-tester**:
- Test all edge cases: boundary conditions, rapid inputs, unusual sequences
- Soak test: run the feature for extended periods checking for degradation
- Stress test: maximum entities, worst-case scenarios
- Regression test: verify polish changes haven't broken existing functionality — each Phase 2–4 change by name, engine-level fixes included
- Test on minimum spec hardware (if available)
- Output: test results with any remaining issues

### Phase 6: Sign-off
- Collect results from all team members
- Compare performance metrics against budgets
- Report: READY FOR RELEASE / NOT ASSESSED / NEEDS MORE WORK
- List every remaining issue with its severity (S1–S4), the measured gap where there is one (e.g. "9 ms against a 6 ms budget — 3 ms over"), and a recommendation; a regression also names the broken behavior and the polish change that caused it

**NOT ASSESSED ranks above READY FOR RELEASE and below NEEDS MORE WORK.** A known
problem — a metric over budget, an unresolved regression — makes it NEEDS MORE
WORK whatever else went unchecked. Otherwise, if any part of the scope could not
be checked, the result is NOT ASSESSED, never READY FOR RELEASE, and the report
names each gap:
- A metric with no committed budget. `performance.target_framerate`,
  `performance.frame_budget_ms`, `performance.draw_call_limit` and
  `performance.memory_ceiling_mb` have no default, and `$perf-profile` reports an
  unset one as NOT ASSESSED — nothing was compared, so no budget was met.
- A phase that did not run: BLOCKED, skipped, or its agent outside the active set.
  At `team.size: individual`, sound-designer's audio polish and qa-tester's
  hardening are only consulted through the active agents, not run, and Phase 2's
  programmer items are handed to `$dev-story` rather than implemented.

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

A summary report covering: performance before/after metrics, visual polish changes, audio polish changes, test results, any optimisation list handed to `$dev-story`, and release readiness assessment.

## Next Steps

- If READY FOR RELEASE: run `$release-checklist` for the final pre-release validation.
- If NEEDS MORE WORK: schedule remaining issues in `$sprint-plan update` (at `workflow: minimal`, which has no sprints, add them to the brief's build order) and re-run `$team-polish` after fixes.
- If NOT ASSESSED: supply what was missing — commit the unset `performance.*` budgets in `project.yaml` (`$settings`), or run the phases that did not run (raise `team.size`) — then re-run `$team-polish`. Do not treat the area as release-ready.
- If the report handed an optimisation list to `$dev-story`: implement those items there, then re-run `$team-polish` to measure the gain.
- Run `$gate-check` for a formal phase gate verdict before handing off to release.
