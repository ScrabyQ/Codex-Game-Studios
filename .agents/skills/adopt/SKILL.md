---
name: adopt
description: "Brownfield audit — do existing artifacts actually work? Numbered migration plan. Unlike $project-stage-detect, checks compliance not existence."
---

## Codex execution contract

**CGS-10 runtime and consent contract:** Treat subsequent Claude-specific tool syntax as source procedure, not automatic execution. Resolve the selected project root explicitly; use the registered helper dispatcher with `--root <project-root>` when available. Observe real files and diagnostics; never turn a failed probe or unknown code root into an empty project. If a required helper cannot run, use an explicitly documented factual fallback only where the needed facts and precedence can be established; otherwise report NOT ASSESSED and stop that dependent step. Use native question support when available or ask in plain text and wait. A skipped or dismissed required decision is not consent; preserve prior explicit user authorization and active host permissions. Never auto-run another skill or phase after a recommendation.

Preserve all seven audit and planning phases and tier-based severity; at minimal do not treat absent GDDs or ADRs as required gaps. Plan creation, moves, converter execution and any edits require the applicable user authorization and explicit required decisions. Offer the next action without executing a new skill; do not silently move, delete, overwrite or finalize legacy files. If an audit helper cannot run, report the specific portion NOT ASSESSED, rather than declaring compliance.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, user-question facility, Bash(bash "*/.agents/skills/adopt/../../hooks/yaml-helper.sh" resolve_config *), Bash(bash .agents/scripts/gdd-structure-check.sh *), Bash(bash .agents/scripts/migrate-v1-config.sh --dry-run*)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[focus: full | gdds | adrs | stories | infra]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,automation_always_ask,workflow`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is. `$adopt` also inspects `project.yaml` and the legacy
config files directly when reporting and writing migration state; that raw
inspection is deliberate and separate from the resolved values above.

# Adopt — Brownfield Template Adoption

This skill audits an existing project's artifacts for **format compliance** with
the template's skill pipeline, then produces a prioritised migration plan.

**This is not `$project-stage-detect`.**
`$project-stage-detect` answers: *what exists?*
`$adopt` answers: *will what exists actually work with the template's skills?*

A project can have GDDs, ADRs, and stories — and every format-sensitive skill
will still fail silently or produce wrong results if those artifacts are in the
wrong internal format.

**Output:** `docs/adoption-plan-[date].md` — a persistent, checkable migration plan.

**Argument modes:**

**Audit mode:** `$ARGUMENTS` (blank = `full`)

- **No argument / `full`**: Complete audit — all artifact types
- **`gdds`**: GDD format compliance only
- **`adrs`**: ADR format compliance only
- **`stories`**: Story format compliance only
- **`infra`**: Infrastructure artifact gaps only (registry, manifest, sprint-status, stage.txt)

---

**Automation mode**: Resolve `modes.automation` (`project.local.yaml` →
`project.yaml` → default `collaborative`). Every `available user-question tool (or ask in plain text and wait)` call follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

**`workflow`** (per `.agents/docs/workflow-modes.md`). It scopes the Phase 2 audit and
Phase 3 severity: `full` audits all doc types at full structure; `standard` audits
only the required docs/sections (optional sections are informational, not gaps);
`minimal` is a `design/game-brief.md` format check — GDDs/ADRs/UX are not expected. See Phase 2.

## Phase 1: Detect Project State

**Read `references/1-detect.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 2: Format Audit

**Read `references/2-format-audit.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 3: Classify and Prioritise Gaps

**Read `references/3-classify.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 4: Build the Migration Plan

**Read `references/4-migration-plan.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 5: Present Summary and Ask to Write

**Read `references/5-summary.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 6: Write the Adoption Plan

**Read `references/6-write.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 7: Offer First Action

**Read `references/7-first-action.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Collaborative Protocol

**Applies in `collaborative` mode (the default).** For `guided` and
`autonomous` modes, see `.agents/docs/automation-modes.md` — the rules below
describe what collaborative mode requires, not universal behavior.

1. **Read silently** — complete the full audit before presenting anything
2. **Show the summary first** — let the user see scope before asking to write
3. **Ask before writing** — always confirm before creating the adoption plan file
4. **Offer, don't force** — the plan is advisory; the user decides what to fix and when
5. **One action at a time** — after handing off the plan, offer one specific next step,
   not a list of six things to do simultaneously
6. **Never regenerate existing artifacts** — only fill gaps in what exists;
   do not rewrite GDDs, ADRs, or stories that already have content
