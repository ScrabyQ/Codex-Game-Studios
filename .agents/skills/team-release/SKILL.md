---
name: team-release
description: "Orchestrate the release team — release-manager, qa-lead, devops-engineer, producer — to execute a release from candidate to deployment."
---

## Codex execution contract

**CGS-22 Codex team and authority contract:** Preserve this skill's exact argument/default discovery and bootstrap order: release may infer then confirm a version, QA may infer scope, and narrative/live-ops show usage when missing their required argument. Execute configuration resolution; never assume shell interpolation or source model metadata executes. Announce the actual team.size active set and routed roles, retaining phase-gate-only and review-mode exceptions. Claude Agent/subagent_type and TaskCreate/TaskGet/TaskList/TaskUpdate are source API names: use actual supported native delegation/local task facilities, or a scoped assignment ledger. Do not create external tasks without authorization.

Delegate only when supported, authorized and justified. A supported generic child can receive the complete relevant role brief, but report the actual mechanism and handle. Otherwise use **sequential in-session role execution; not independent review**: read the relevant adapted role and gate criteria, including gate files in-session when needed for this disclosed fallback, and perform the same bounded assignment/output/review contract. Source child-only writes map to the assigned role's authorized work, not permission to skip that role or grant the coordinator unrestricted writes. Keep the source's final compilation ownership and qa-lead reply-only sign-off return. A self-check or in-session opinion is never a fresh independent sign-off. Missing capability remains named PENDING/NOT ASSESSED; do not silently substitute a role or invent an executed review.

Each assignment carries phase, role, exact owned paths, inputs, dependencies, permission scope, expected artifact and return status. One active writer per canonical file; resolve case/alias/directory overlap before scheduling. Independent reviews write separate files and integration waits for every required artifact. A missing artifact or incomplete return fails the phase: resume the same role with the unmet contract, preserve partial outputs, and stop dependent phases if still blocked. Never fill a skipped department's section with invented findings. Named paths define ownership, not permission. All work follows inherited authorization and host permissions.

Preserve the decision hierarchy: peers consult without binding decisions outside their domain; unresolved conflicts go to their shared parent. If none exists, use creative-director for design conflicts or technical-director for technical conflicts. Narrative-director settles writer/world-builder canon disagreements by presenting reconciliation options for the user to confirm; do not automatically escalate a shared-parent canon dispute further. Producer coordinates schedules and propagation. Directors and producer offer domain recommendations/verdicts, **never user permission**. Prior authorization persists; do not ask again for an already authorized exact action. For an unresolved decision use an available native question tool or equivalent plain-text choices and wait; a skipped/empty answer is not consent.

Collaborative, guided and autonomous alter routine decision flow only. None grants write, commit/tag/push, deployment, publication, messaging, storefront, external-service or risk-override authority. Preserve all source unconditional approvals even when automation_always_ask omits their category. Log autonomous routine decisions with the real log_decision helper (or disclose a bounded local record fallback); logging cannot turn an unapproved action into an approved one. Do not turn leadership roles into a hidden permission service. A recommended handoff or monitoring plan is not an executed task, sent message, scheduled automation or published artifact.

Preserve stage-before-spawn and explicit stage override with written reason, without changing project.stage. Unknown online/multiplayer/player-data flags are not false. S1 blocks every tier; S2/S3 also block full. Technical-director sign-off runs only at full review and is otherwise named not run; absent review is not approval. NO-GO skips all Phase 6 actions unless the user supplies the source-required written override; even then tagging/deployment needs separate explicit approval in every automation mode. Staging-only never authorizes production, announcements, pushes or storefront writes. Release remains a candidate/tag on main, with stabilization branches only when justified; no automatic Git action.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, TaskCreate, TaskGet, TaskList, TaskUpdate, Bash(bash "*/.agents/skills/team-release/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[version number or 'next'] [--review full|lean|solo]". 

# Team Release

**Argument check:** If no version number is provided:
1. Read `production/session-state/active.md` and the most recent file in `production/milestones/` (if they exist) to infer the target version.
2. If a version is found: report "No version argument provided — inferred [version] from milestone data. Proceeding." Then confirm with `available user-question tool (or ask in plain text and wait)`: "Releasing [version]. Is this correct?"
3. If no version is discoverable: use `available user-question tool (or ask in plain text and wait)` to ask "What version number should be released? (e.g., v1.0.0)" and wait for user input before proceeding. Do NOT default to a hardcoded version string.

When this skill is invoked, orchestrate the release team through a structured pipeline.

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

**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,team.size,workflow,project.stage`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

**Stage check — before anything is spawned.** This skill ships a release, and
`$gate-check release` is the readiness gate that must pass first; only its PASS
sets `project.stage` to `Release`. If the resolved `project.stage` is anything
else — `Polish`, an earlier stage, or not set — stop before Phase 1 and spawn
nothing:

> "The release readiness gate has not passed (project.stage: [stage]) — run
> `$gate-check release` first."

Then ask with `available user-question tool (or ask in plain text and wait)`, in every `automation` mode — an override is never
taken on the user's behalf: `[A] Stop — I'll run $gate-check release (recommended)`
/ `[B] Proceed anyway — override the stage check`. On `[A]`, end the run: Verdict
**BLOCKED** — release gate not passed. On `[B]`, ask (plain text) why, then record
the override as `Stage override: project.stage was [stage] — release gate not
passed; the user chose to proceed: [reason]` in the Phase 1 brief, in the go/no-go
record (`go-no-go-[version].md`) and in the final report. An override never
changes the stage itself.

`review_mode` sets director-gate depth, and this pipeline has no director gate:
no phase below spawns CD-, TD-, PR- or AD-PHASE-GATE, at any `review_mode`. Its
phase gates are the pipeline's own decision points (defined under `team.size`
below), and the agents that work at them are team members, not director gates.

`automation` drives the Decision Points note above. See the Decision Points note above and
`.agents/docs/automation-modes.md` for how each mode changes pipeline behavior.

**`team.size`**: which agents are active (orthogonal to review_mode gate-depth and workflow docs).
- **`individual`** (default): `release-manager` only. Other agents consulted via the release-manager, not spawned separately.
- **`small`**: + `producer` + `devops-engineer` + `qa-lead` + `community-manager`.
- **`studio`**: + `security-engineer` + `analytics-engineer` + `localization-lead` + `performance-analyst`, and `network-programmer` when the game is multiplayer (the full pipeline as documented).
A non-core agent needed at `individual` routes through the nearest active core agent with an informational note. **"Phase gate" means any phase that ends in an `available user-question tool (or ask in plain text and wait)` decision point this pipeline itself lists** — a transition under Decision Points above, the stage check, or the Phase 6 deploy question — **whatever the `automation` mode.** `guided` and `autonomous` change how a gate is passed (it auto-advances, or is recorded with `log_decision`), not whether it is one, so bounded-exception condition (3) below holds at it in every mode. An agent restricted to "phase gates only" is spawned at those points and no others. This active-set scoping applies throughout the pipeline below: any phase that names an agent outside the active set routes through the nearest core agent rather than spawning it.

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
- **release-manager** — Release tag, versioning, changelog, patch notes, deployment
- **qa-lead** — Test sign-off, regression suite, release quality gate
- **devops-engineer** — Build pipeline, artifacts, deployment automation
- **security-engineer** — Pre-release security audit (invoke if game has online/multiplayer features or player data)
- **network-programmer** — Netcode stability sign-off (invoke if game has multiplayer)
- **analytics-engineer** — Verify telemetry events fire correctly and dashboards are live
- **localization-lead** — Verify every shipped string is translated
- **performance-analyst** — Benchmark the release build against its performance targets
- **community-manager** — Launch announcement and player-facing messaging, written from the patch notes
- **producer** — Go/no-go decision, stakeholder communication, scheduling

## How to Delegate

Use authorized native delegation when available for the following roles; otherwise use the disclosed in-session fallback or report PENDING:
- `release-manager` — Release tag, versioning, changelog, patch notes, deployment
- `qa-lead` — Test sign-off, regression suite, release quality gate
- `devops-engineer` — Build pipeline, artifacts, deployment automation
- `security-engineer` — Security audit for online/multiplayer/data features
- `analytics-engineer` — Telemetry event verification and dashboard readiness
- `community-manager` — Launch communication, written from the patch notes
- `producer` — Go/no-go decision, stakeholder communication
- `network-programmer` — Netcode stability sign-off (invoke if game has multiplayer)
- `localization-lead` — Translation completeness sign-off (Phase 4)
- `performance-analyst` — Performance benchmarks against targets (Phase 4)

**Brief each agent — do not dump context.** Read the shared inputs **once** and pass a distilled brief inline: the lines each agent actually needs, never a file path for a document you have already read (an agent handed a path re-reads the whole file). Pass a path only for a document you have not read and only that agent needs.

**End every agent prompt with a return contract:** "Write your full output to `[path]` — observe inherited authorization and the assigned path boundary. Return **only** (1) the path written, (2) a ≤5-bullet summary of decisions, (3) any BLOCKED/CONCERNS items, one line each. Do not restate the documents you read." Without it, an agent returns everything it read back into this session.

**Substitute a real path for `[path]`.** One file per agent under
`production/releases/`, except the two whose homes are fixed elsewhere. An active
agent standing in for one outside the active set writes that agent's file:

| Phase / agent | Writes to | Destination fixed by |
|---|---|---|
| 1 producer | `production/releases/release-plan-[version].md` | this skill |
| 2 release-manager | `production/releases/release-checklist-[version].md` | `$release-checklist` |
| 3 qa-lead | `production/releases/qa-gate-[version].md` | this skill |
| 3 devops-engineer | `production/releases/build-[version].md` | this skill |
| 3 security-engineer | `production/releases/security-signoff-[version].md` | this skill |
| 3 network-programmer | `production/releases/netcode-signoff-[version].md` | this skill |
| 4 localization-lead | `production/releases/localization-signoff-[version].md` | this skill |
| 4 performance-analyst | `production/releases/performance-signoff-[version].md` | this skill |
| 4 analytics-engineer | `production/releases/analytics-signoff-[version].md` | this skill |
| 5 go/no-go | `production/releases/go-no-go-[version].md` | this skill |
| 6 release-manager | `docs/patch-notes/[version].md` | `$patch-notes` |
| 6 community-manager | `production/releases/announcement-[version].md` | this skill |
| 7 release-manager | `production/releases/release-report-[version].md` | this skill |

> **Every one of those thirteen outputs needs a stated destination.**
> `production/releases/` is where `$release-checklist` already writes, and
> `docs/patch-notes/[version].md` is where `$patch-notes` already writes, so the
> release record lands in one place regardless of which skill produced it.
>
> **A separate file per agent, not one appended record.** Phase 3 and Phase 4
> spawn agents in parallel; two agents appending to one file race, and the loser's
> section vanishes silently.

> Named paths define assignment boundaries, not permission. Apply existing user authorization and host permissions; obtain a decision only for an unresolved choice or action outside that authorization.

Launch independent agents in parallel where the pipeline allows it (e.g., Phase 3 agents can run simultaneously).

## Pipeline

### Phase 1: Release Planning
Delegate to **producer**:
- Confirm all milestone acceptance criteria are met
- Identify any scope items deferred from this release
- Set the target release date and communicate to team
- Output: release authorization with scope confirmation

### Phase 2: Release Candidate
Delegate to **release-manager**:
- Bump version numbers in all relevant files on `main`; the commit carrying the bump is the release candidate. Development is trunk-based — a release is a tag on `main` (applied in Phase 6), not a branch
- Confirm the release checklist from Polish (`$release-checklist`, run before `$gate-check release`) is complete for this candidate; run it now only if none exists
- Cut a `release/[version]` branch from the candidate only if this release needs stabilising (a freeze, platform certification) — bug fixes only there, and every fix lands on `main` as well
- Output: release candidate commit (plus the `release/*` branch, if one was cut) and checklist

### Phase 3: Quality Gate (parallel)
Delegate in parallel:
- **qa-lead**: Execute full regression test suite. Test all critical paths. Verify no open bugs at the severities `$gate-check release` blocks for this `workflow`: S1 at every tier, S2 and S3 too at `full`. Sign off on quality.
- **devops-engineer**: Build release artifacts for all target platforms. Verify builds are clean and reproducible. Run automated tests in CI.
- **security-engineer** *(if game has online features, multiplayer, or player data)*: Conduct pre-release security audit. Review authentication, anti-cheat, data privacy compliance. Sign off on security posture.
- **network-programmer** *(if game has multiplayer)*: Sign off on netcode stability. Verify lag compensation, reconnect handling, and bandwidth usage under load.

When either agent is in the active set, decide its condition from `platform.online` and `platform.multiplayer` in `project.yaml`, plus whether the game stores player data. A key that is absent is not a `false`: ask the user rather than assume an offline game. An agent skipped on these grounds says so by name in the Phase 3 output — e.g. `security-engineer: not spawned — platform.online: false, platform.multiplayer: false, no player data`.

### Phase 4: Localization, Performance, and Analytics
Delegate (can run in parallel with Phase 3 if resources available):
- Verify all strings are translated (delegate to **localization-lead** if available)
- Run performance benchmarks against targets (delegate to **performance-analyst** if available)
- **analytics-engineer**: Verify all telemetry events fire correctly on release build. Confirm dashboards are receiving data. Check that critical funnels (onboarding, progression, monetization if applicable) are instrumented.
- Output: localization, performance, and analytics sign-off — one file per agent (table above)

### Phase 5: Go/No-Go
Before delegating, get the **technical-director** release sign-off. The producer
cannot spawn agents, so the orchestrator does: spawn `technical-director` at
`review_mode: full` only — this is a director review, not a PHASE-GATE, so `lean`
and `solo` skip it. Ask for GO, CONCERNS or NO-GO on the release candidate's
technical state, or NOT ASSESSED naming what it could not read. When it is not
spawned, the go/no-go record says `technical-director sign-off: not run
(review_mode: <mode>)` instead of listing it as given; a NOT ASSESSED answer is
recorded as such and never counted as a sign-off.

Delegate to **producer**, passing every sign-off collected so far:
- Collect sign-off from: qa-lead, release-manager, devops-engineer, security-engineer (if spawned in Phase 3), network-programmer (if spawned in Phase 3), and technical-director (if spawned above)
- Carry a stage-check override, if there was one, into the go/no-go record as its `Stage override:` line
- Evaluate any open issues — are they blocking or can they ship?
- Make the go/no-go call
- Output: release decision with rationale

**If producer declares NO-GO:**
- Surface the decision immediately: "PRODUCER: NO-GO — [rationale, e.g., S1 bug found in Phase 3]."
- Use `available user-question tool (or ask in plain text and wait)` with options:
  - Fix the blocker and re-run the affected phase
  - Defer the release to a later date
  - Override NO-GO with documented rationale (user must provide written justification)
- **Skip Phase 6 entirely** — do not tag, deploy to staging, deploy to production, or spawn community-manager.
- Produce a partial report summarizing Phases 1–5 and what was skipped (Phase 6) and why.
- Verdict: **BLOCKED** — release not deployed.

After the user selects "Override NO-GO with documented rationale":
- Ask (plain text, not widget): "Please describe the justification for overriding the NO-GO verdict. This will be embedded in the release record."
- Wait for the user's written justification.
- Embed the justification text in the partial approval record before Phase 6: append a "⚠️ Override Justification: [user's text]" field.
- Only then proceed to Phase 6.

### Phase 6: Deployment (if GO)

**This phase always requires explicit user approval regardless of
`modes.automation` — including `autonomous` mode.** Production deployment is
irreversible and high-stakes; it is NOT covered by the configurable
`automation_always_ask` categories, so this skill guards it unconditionally.
Before tagging or deploying, use `available user-question tool (or ask in plain text and wait)`:
- Prompt: "Producer verdict is GO. Execute Phase 6 — tag, deploy to staging,
  deploy to production?"
- Options: `[A] Yes, deploy` / `[B] Staging only — hold production` / `[C] Stop here`

Only after explicit approval, delegate to **release-manager** + **devops-engineer**:
- Tag the release in version control
- Finalize the changelog drafted in Polish (`$changelog`), adding what changed since the gate
- Deploy to staging for final smoke test
- Deploy to production (only if the user approved production above)
- Human team action: Monitor dashboards and error rates for 48 hours post-release. Schedule a follow-up retrospective using `$retrospective` at the 48-hour mark.

In parallel with deployment, delegate to **release-manager**:
- Finalize the patch notes drafted in Polish using `$patch-notes [version]` — release-manager carries that skill and the Bash access its `git log` step needs; `community-manager` has neither

Then hand those patch notes to **community-manager**:
- Prepare launch announcement (store page updates, social media, community post)
- Draft known issues post if any S3+ issues shipped
- Output: all player-facing release communication, ready to publish on deploy confirmation

### Phase 7: Post-Release
- **release-manager**: Generate release report (what shipped, what was deferred, metrics)
- **producer**: Update milestone tracking, communicate to stakeholders
- **qa-lead**: Monitor incoming bug reports for regressions
- **community-manager**: Publish all player-facing communication, monitor community sentiment
- **analytics-engineer**: Confirm live dashboards are healthy; alert if any critical events are missing
- Keep the 48-hour monitoring window from Phase 6: bugs, dashboards and community sentiment are watched for 48 hours after release (release-manager's own watch runs to its 72h report)
- Schedule post-release retrospective if issues occurred

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
partial report.** Full procedure: `.agents/docs/error-recovery-protocol.md`.

Common blockers:
- Input file missing (story not found, GDD absent) → redirect to the skill that creates it
- ADR status is Proposed → do not implement; accept it with `$architecture-decision accept ADR-NNNN` once decided
- Scope too large → split into two stories via `$create-stories`
- Conflicting instructions between ADR and story → surface the conflict, do not guess

## File Write Protocol

Assign each role or sub-skill its bounded work and path ownership. Apply existing user authorization and host permissions to all writes; a named path or phase gate does not itself grant permission. When delegation is unavailable, use the disclosed in-session fallback or report PENDING. Prepare a reviewable draft only for an unresolved decision or action outside authorization. External and irreversible actions require their applicable authorization.

## Output

A summary report covering: release version, scope, quality gate results, go/no-go decision, deployment status, and monitoring plan.

Verdict: **COMPLETE** — release executed and deployed.
Verdict: **BLOCKED** — release halted; the stage check stopped it, go/no-go was NO, or a hard blocker is unresolved.

## Next Steps

- Monitor post-release dashboards for 48 hours.
- Run `$retrospective` if significant issues occurred during the release.
- `project.stage` reads `Release` unless the stage check was overridden: `$gate-check release` is the Polish → Release readiness gate, run before this skill. After an override the stage still reads what it did. Only `$gate-check` changes `project.stage` (on a PASS, or a CONCERNS whose risks the user accepted), so this skill never writes it or `production/stage.txt`. `Release` is the terminal stage in the `project.stage` enum — there is no post-launch stage value. Record live/post-launch status in the release report, not in `project.stage`.
