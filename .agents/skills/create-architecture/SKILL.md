---
name: create-architecture
description: "Author the architecture blueprint before code is written. Validates decisions against the pinned engine, flags knowledge gaps."
---

## Codex execution contract

**CGS-13 Codex architecture contract:** Resolve configuration with the explicit bootstrap before applying workflow or review gates. Source Read/Glob/Grep/Write/Edit examples describe operations: use available file tools, rg, and approved shell/Node helpers with the same path/range semantics. Source Agent/subagent_type examples are role briefs, not an assumed Codex API. Prefer an available authorized native role; otherwise an actual generic child may receive the complete adapted role and gate brief. If only an in-session role review is possible, read those instructions and label it "not independent"; never count it as a fresh independent review. Gate files can be read in-session for that disclosed fallback, despite source wording assigning the read to a child. Report unperformed required assessment as NOT ASSESSED. Do not invent engine execution or an unavailable specialist verdict.

Use available question tools, or present the same numbered options in plain text and wait; source widget-only wording cannot make an unavailable tool mandatory. Previously authorized writes and explicit scripted fixture choices remain authorized. An unanswered required choice, ADR acceptance, registry update, or supersession is never inferred from automation. Show actual effects and preserve authorization scope. Commands and helpers emit observations; missing/failed helpers are not clean results. Direct file-reading fallback is valid only when it establishes the same facts. Dependency graph computation and receipt hashing must actually run, or that subcheck is NOT ASSESSED. Native skill names use $name; merely recommending a skill never runs it.

Preserve engine/design prerequisite stops, all applicable layer boundaries, provisional-versus-registered TR IDs, section approvals, and the single final write. On a chosen-section update preserve every other section and increment Version. At standard use the layer map and critical ADR list; at minimal do not invent a mandatory full architecture. Platform is not a project-owned system layer. Keep real review outcomes and named skips in Document Status, never convert a fallback or rejection into APPROVE.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, user-question facility, Agent, Bash(bash "*/.agents/skills/create-architecture/../../hooks/yaml-helper.sh" resolve_config *), Bash(bash .agents/scripts/registry.sh *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[focus-area: full | layers | data-flow | api-boundaries | adr-audit] [--review full|lean|solo]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,workflow,docs.density`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

# Create Architecture

This skill produces `docs/architecture/architecture.md` — the master architecture
document that translates all approved GDDs into a concrete technical blueprint.
It sits between design and implementation, and must exist before sprint planning begins.

**Distinct from `$architecture-decision`**: ADRs record individual point decisions.
This skill creates the whole-system blueprint that gives ADRs their context.

See `.agents/docs/director-gates.md` for the full check pattern. Individual gate definitions live in `.agents/docs/director-gates/[gate-id].md` — the spawned agent reads its own gate file; do not read it in the parent session.

Every `available user-question tool (or ask in plain text and wait)` call follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

**`docs.density`** — it controls per-section *depth*, where `workflow`
controls which sections exist. `modes.rigor` sets both together; set
`docs.density` explicitly to vary depth alone: `terse` (the default, via `rigor: minimal`) = layer diagrams + decision bullets,
no essays; `balanced` = diagrams + paragraph explanations of layer choices
(`rigor: standard`); `thorough` = full prose with rationale, trade-offs, and alternatives
considered per layer. Apply it to every section you author.

**`workflow`** (see `.agents/docs/workflow-modes.md`):
- `full` — full architecture: all layers, module ownership, data flow, API
  boundaries, full ADR audit.
- `standard` — simplified: system layer map + critical ADR list only.
- `minimal` — not required. Can still be run voluntarily.

**Argument modes:**
- **No argument / `full`**: Full guided walkthrough — all sections, start to finish
- **`layers`**: Focus on the system layer diagram only
- **`data-flow`**: Focus on data flow between modules only
- **`api-boundaries`**: Focus on API boundary definitions only
- **`adr-audit`**: Audit existing ADRs for engine compatibility gaps only

---

## Phase 0: Load All Context

**Read `references/0-load-context.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 1: System Layer Mapping

**Read `references/1-layers.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 2: Module Ownership Map

**Read `references/2-module-ownership.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 3: Data Flow

**Read `references/3-data-flow.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 4: API Boundaries

**Read `references/4-api-boundaries.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 5: ADR Audit + Traceability Check

**Read `references/5-adr-audit.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 6: Missing ADR List

**Read `references/6-missing-adrs.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 7: Write the Master Architecture Document

**Read `references/7-write.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 8: Handoff

**Read `references/8-handoff.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Collaborative Protocol

**Applies in `collaborative` mode (the default).** For `guided` and
`autonomous` modes, see `.agents/docs/automation-modes.md` — the rules below
describe what collaborative mode requires, not universal behavior.

This skill follows the collaborative design principle at every phase:

1. **Load context silently** — do not narrate file reads
2. **Present findings** — show the knowledge gap inventory and layer proposals
3. **Ask before deciding** — present options for each architectural choice
4. **Draft before approval** — show the content inline before asking to write it.
   Never ask approval for a section the user has not yet seen.
5. **Use `available user-question tool (or ask in plain text and wait)` for write approvals** — when the structured question tool is available, use it; otherwise present numbered options in plain text and wait. Use labeled options [A]/[B]/[C] (write now /
   show full draft first / not yet). For multi-file changesets, list every file
   and what changes, then ask once grouped — not separate plain-text asks per file.
6. **One write, after every section is approved** — the document is written once,
   at Phase 7; Phase 7b's Step 4 only updates its Document Status, after its own
   ask. Record each approved section's decisions in
   `production/session-state/active.md` as you go, so a crash loses no decision.
   A revision that Phase 7b forces is written the same way — once, after its
   re-drafted sections are approved — and an update (Phase 0e) writes only the
   sections it chose.

Never make a binding architectural decision without user input. If the user is
unsure, present 2-4 options with pros/cons before asking them to decide.

---

## Recommended Next Steps

- Run `$architecture-decision [title]` for each required ADR listed in Phase 6 — Foundation layer ADRs first
- Run `$architecture-review` — bootstraps the Requirements Traceability Matrix and TR registry from the ADRs just written, and gives each provisional TR-ID its permanent one. Required before the Pre-Production gate.
- Run `$test-setup` to scaffold `tests/unit/`, `tests/integration/`, CI workflow, and an example test (required for gate-check)
- Run `$ux-design` to initialize `design/ux/interaction-patterns.md` and `design/accessibility-requirements.md` (required for gate-check)
- Run `$create-control-manifest` once the required ADRs are written to produce the layer rules manifest
- Run `$gate-check pre-production` when all required ADRs, `$test-setup`, and `$ux-design` are complete
