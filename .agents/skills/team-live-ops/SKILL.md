---
name: team-live-ops
description: "Orchestrate the live-ops team — live-ops-designer, economy-designer, analytics-engineer, community-manager, writer — for a season or live event."
---

## Codex execution contract

**CGS-22 Codex team and authority contract:** Preserve this skill's exact argument/default discovery and bootstrap order: release may infer then confirm a version, QA may infer scope, and narrative/live-ops show usage when missing their required argument. Execute configuration resolution; never assume shell interpolation or source model metadata executes. Announce the actual team.size active set and routed roles, retaining phase-gate-only and review-mode exceptions. Claude Agent/subagent_type and TaskCreate/TaskGet/TaskList/TaskUpdate are source API names: use actual supported native delegation/local task facilities, or a scoped assignment ledger. Do not create external tasks without authorization.

Delegate only when supported, authorized and justified. A supported generic child can receive the complete relevant role brief, but report the actual mechanism and handle. Otherwise use **sequential in-session role execution; not independent review**: read the relevant adapted role and gate criteria, including gate files in-session when needed for this disclosed fallback, and perform the same bounded assignment/output/review contract. Source child-only writes map to the assigned role's authorized work, not permission to skip that role or grant the coordinator unrestricted writes. Keep the source's final compilation ownership and qa-lead reply-only sign-off return. A self-check or in-session opinion is never a fresh independent sign-off. Missing capability remains named PENDING/NOT ASSESSED; do not silently substitute a role or invent an executed review.

Each assignment carries phase, role, exact owned paths, inputs, dependencies, permission scope, expected artifact and return status. One active writer per canonical file; resolve case/alias/directory overlap before scheduling. Independent reviews write separate files and integration waits for every required artifact. A missing artifact or incomplete return fails the phase: resume the same role with the unmet contract, preserve partial outputs, and stop dependent phases if still blocked. Never fill a skipped department's section with invented findings. Named paths define ownership, not permission. All work follows inherited authorization and host permissions.

Preserve the decision hierarchy: peers consult without binding decisions outside their domain; unresolved conflicts go to their shared parent. If none exists, use creative-director for design conflicts or technical-director for technical conflicts. Narrative-director settles writer/world-builder canon disagreements by presenting reconciliation options for the user to confirm; do not automatically escalate a shared-parent canon dispute further. Producer coordinates schedules and propagation. Directors and producer offer domain recommendations/verdicts, **never user permission**. Prior authorization persists; do not ask again for an already authorized exact action. For an unresolved decision use an available native question tool or equivalent plain-text choices and wait; a skipped/empty answer is not consent.

Collaborative, guided and autonomous alter routine decision flow only. None grants write, commit/tag/push, deployment, publication, messaging, storefront, external-service or risk-override authority. Preserve all source unconditional approvals even when automation_always_ask omits their category. Log autonomous routine decisions with the real log_decision helper (or disclose a bounded local record fallback); logging cannot turn an unapproved action into an approved one. Do not turn leadership roles into a hidden permission service. A recommended handoff or monitoring plan is not an executed task, sent message, scheduled automation or published artifact.

Preserve cadence ownership by live-ops-designer, reward contents/pricing by economy-designer, and collection of both economy and analytics before content writing. Missing ethics policy is visibly skipped/unassessed, not clean; an actual policy violation blocks approval/final outputs pending resolution or the explicit documented user decision required by the source. A director cannot accept that risk for the user. Plans, draft communications and telemetry specifications are not deployment, publication or verified live instrumentation. Keep final season numbering/paths and minimal-workflow build-order handoff.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, TaskCreate, TaskGet, TaskList, TaskUpdate, Bash(bash "*/.agents/skills/team-live-ops/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[season name or event description] [--review full|lean|solo]". 

# Team Live Ops

**Argument check:** If no season name or event description is provided, output:
> "Usage: `$team-live-ops [season name or event description] [--review full|lean|solo]` — Provide the name or description of the season or live event to plan."
Then stop immediately without spawning any subagents or reading any files.

When this skill is invoked with a valid argument, orchestrate the live-ops team through a structured planning pipeline.

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
- **`individual`** (default): `live-ops-designer` + `economy-designer`. Other agents consulted via these two, not spawned separately.
- **`small`**: + `analytics-engineer` + `community-manager`.
- **`studio`**: + `writer` + `narrative-director` (the full pipeline as documented).
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
- **live-ops-designer** — Season structure, event cadence, retention mechanics, battle pass
- **economy-designer** — Live economy balance, store rotation contents and prices (live-ops-designer sets its cadence), currency pricing, pity timers
- **analytics-engineer** — Success metrics, A/B test design, event tracking, dashboard specs
- **community-manager** — Player-facing announcements, event descriptions, seasonal messaging
- **narrative-director** — Seasonal narrative theme, story arc, world event framing
- **writer** — Event descriptions, reward item names, seasonal flavor text, announcement copy

## How to Delegate

Use authorized native delegation when available for the following roles; otherwise use the disclosed in-session fallback or report PENDING:
- `live-ops-designer` — Season/event structure and retention mechanics
- `economy-designer` — Live economy balance and reward pricing
- `analytics-engineer` — Success metrics, A/B tests, event instrumentation
- `community-manager` — Player-facing communication and messaging
- `narrative-director` — Seasonal theme and narrative framing
- `writer` — All player-facing text: event descriptions, item names, copy

**Brief each agent — do not dump context.** Read the shared inputs **once** and pass a distilled brief inline: the lines each agent actually needs, never a file path for a document you have already read (an agent handed a path re-reads the whole file). Pass a path only for a document you have not read and only that agent needs.

**End every agent prompt with a return contract:** "Write your full output to `[path]` — observe inherited authorization and the assigned path boundary. Return **only** (1) the path written, (2) a ≤5-bullet summary of decisions, (3) any BLOCKED/CONCERNS items, one line each. Do not restate the documents you read." Without it, an agent returns everything it read back into this session.

**Substitute a real path for `[path]`.** Working artifacts go under
`production/live-ops/[season-slug]/`, where `[season-slug]` is the argument as a
slug — lowercase, spaces → hyphens. One file per agent, so the parallel phases
never share one:

| Phase / agent | Writes to |
|---|---|
| 1 live-ops-designer | `production/live-ops/[season-slug]/brief.md` |
| 2 narrative-director | `production/live-ops/[season-slug]/narrative.md` |
| 3 economy-designer | `production/live-ops/[season-slug]/economy.md` |
| 4 analytics-engineer | `production/live-ops/[season-slug]/analytics.md` |
| 5 narrative-director | `production/live-ops/[season-slug]/narrative-text.md` |
| 5 writer | `production/live-ops/[season-slug]/copy.md` |
| 6 community-manager | `production/live-ops/[season-slug]/comms.md` |

These are working drafts; the final documents under `design/live-ops/seasons/`
are compiled from them (Output Documents).

> Named paths define assignment boundaries, not permission. Apply existing user authorization and host permissions; obtain a decision only for an unresolved choice or action outside that authorization.

Launch independent agents in parallel where the pipeline allows it (Phases 3 and 4 can run simultaneously).

## Pipeline

### Phase 1: Season/Event Scoping
Delegate to **live-ops-designer**:
- Define the season or event: type (seasonal, limited-time event, challenge), duration, theme direction
- Outline the content list: what's new (modes, items, challenges, story beats)
- Define the retention hook: what brings players back daily/weekly during this season
- Identify resource budget: how much new content needs to be created vs. reused
- Output: season brief with scope, content list, and retention mechanic overview

### Phase 2: Narrative Theme
Delegate to **narrative-director**:
- Read the season brief from Phase 1
- Design the seasonal narrative theme: how does this event connect to the game world?
- Define the central story hook players will discover during the event
- Identify which existing lore threads this season can advance
- Output: narrative framing document (theme, story hook, lore connections)

### Phase 3: Economy Design (parallel with Phase 4)
Delegate to **economy-designer**:
- Read the season brief and existing economy rules from `design/live-ops/economy-rules.md`
- Design the reward track: free tier progression, premium tier value proposition
- Plan the in-season economy: seasonal currency, store rotation contents, pricing
- Define pity timer mechanics and bad-luck protection for any random elements
- Verify no pay-to-win items in premium track
- Output: economy design doc with reward tables, pricing, and currency flow

### Phase 4: Analytics and Success Metrics (parallel with Phase 3)
Delegate to **analytics-engineer**:
- Read the season brief
- Define success metrics: participation rate target, retention lift target, battle pass completion rate
- Design any A/B tests to run during the season (e.g., different reward cadences)
- Specify new telemetry events needed for this season's content
- Output: analytics plan with success criteria and instrumentation requirements

### Phase 5: Content Writing (parallel)
Start only after both Phase 3 and Phase 4 results are collected. Delegate in parallel:
- **narrative-director** (if needed): Write any in-game narrative text (cutscene scripts, NPC dialogue, world event descriptions) for the season
- **writer**: Write all player-facing text — event names, reward item descriptions, challenge objective text, seasonal flavor text
- Both should read the narrative framing doc from Phase 2

### Phase 6: Player Communication Plan
Delegate to **community-manager**:
- Read the season brief, economy design, and narrative framing
- Draft the season launch announcement (tone, key highlights, platform-specific versions)
- Plan the communication cadence: pre-launch teaser, launch day post, mid-season reminder, final week FOMO push
- Draft known-issues section placeholder for day-1 patch notes
- Output: communication calendar with draft copy for each touchpoint

### Phase 7: Review and Sign-off
Collect outputs from all phases and present a consolidated season plan:
- Season brief (Phase 1)
- Narrative framing (Phase 2)
- Economy design and reward tables (Phase 3)
- Analytics plan and success metrics (Phase 4)
- Written content inventory (Phase 5)
- Communication calendar (Phase 6)

Present a summary to the user with:
- **Content scope**: what is being created
- **Economy health check**: does the reward track feel fair and non-predatory?
- **Analytics readiness**: are success criteria defined and instrumented?
- **Ethics review**: check the Phase 3 economy design against `design/live-ops/ethics-policy.md`
  - If the file does not exist: flag "ETHICS REVIEW SKIPPED: `design/live-ops/ethics-policy.md` not found. Economy design was not reviewed against an ethics policy. Recommend creating one before production begins." Include this flag in the season design output document. Add to next steps: create `design/live-ops/ethics-policy.md`.
  - If the file exists and a violation is found: flag "ETHICS FLAG: [element] in Phase 3 economy design violates [policy rule]. Approval is blocked until this is resolved." Do NOT issue a COMPLETE verdict or write output documents. Use `available user-question tool (or ask in plain text and wait)` with options: revise economy design / override with documented rationale / cancel. If user chooses to revise: re-spawn economy-designer to produce a corrected design, then return to Phase 7 review. If user selects Cancel: end with Verdict: BLOCKED — "Live ops design cancelled due to unresolved ethics violation. Resolve the flagged issues and re-run $team-live-ops."
- **Open questions**: decisions still needed before production begins

Ask the user to approve the season plan before delegating to production teams. Issue the COMPLETE verdict only after the user approves and no unresolved ethics violations remain. If an ethics violation is unresolved, end with Verdict: **BLOCKED**.

## Output Documents

All documents save to `design/live-ops/` — **but the orchestrator asks before
writing them.** `design/` is NOT one of the three directories the bounded write
exception covers (`production/`, `docs/`, `tests/`), so a sub-agent handed one of
these paths must prompt. Do not widen the exception to silence that.
Follow `team-level`'s pattern instead: sub-agents write their working artifacts
under `production/`, where the exception does reach them; **you** compile the
final documents and ask via `available user-question tool (or ask in plain text and wait)` — "May I write the season plan to
`design/live-ops/…`?" — writing them only on approval.

Paths:
- `seasons/S[N]_[name].md` — Season design document (from Phase 1-3)
- `seasons/S[N]_[name]_analytics.md` — Analytics plan (from Phase 4)
- `seasons/S[N]_[name]_comms.md` — Communication calendar (from Phase 6)

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

If a BLOCKED state is unresolvable, end with Verdict: **BLOCKED** instead of COMPLETE.

## File Write Protocol

Assign each role its bounded work and paths. Existing user authorization and host permissions govern each write; a named path or phase gate does not itself grant permission. Preserve the pipeline’s final compilation ownership. When delegation is unavailable, disclose an in-session fallback or report PENDING. Prepare a reviewable draft only for unresolved decisions or actions outside authorization.

## Output

A summary covering: season theme and scope, economy design highlights, success metrics, content list, communication plan, and any open decisions needing user input before production.

Verdict: **COMPLETE** — season plan produced and handed off for production.

## Next Steps

- Run `$design-review` on the season design document for consistency validation.
- Run `$sprint-plan` to schedule content creation work for the season (at `workflow: minimal`, which has no sprints, add it to the brief's build order instead).
- Run `$team-release` when the season content is ready to deploy.
- If the run ended **BLOCKED** on an ethics flag: revise the economy design against
  `design/live-ops/ethics-policy.md` and re-run `$team-live-ops`; the three steps
  above wait for a COMPLETE plan.
