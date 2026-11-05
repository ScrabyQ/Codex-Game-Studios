---
name: architecture-review
description: "Traceability matrix mapping GDD requirements to ADRs. Finds gaps, cross-ADR conflicts, engine compatibility. PASS/CONCERNS/NOT ASSESSED/FAIL."
---

## Codex execution contract

**CGS-13 Codex architecture contract:** Resolve configuration with the explicit bootstrap before applying workflow or review gates. Source Read/Glob/Grep/Write/Edit examples describe operations: use available file tools, rg, and approved shell/Node helpers with the same path/range semantics. Source Agent/subagent_type examples are role briefs, not an assumed Codex API. Prefer an available authorized native role; otherwise an actual generic child may receive the complete adapted role and gate brief. If only an in-session role review is possible, read those instructions and label it "not independent"; never count it as a fresh independent review. Gate files can be read in-session for that disclosed fallback, despite source wording assigning the read to a child. Report unperformed required assessment as NOT ASSESSED. Do not invent engine execution or an unavailable specialist verdict.

Use available question tools, or present the same numbered options in plain text and wait; source widget-only wording cannot make an unavailable tool mandatory. Previously authorized writes and explicit scripted fixture choices remain authorized. An unanswered required choice, ADR acceptance, registry update, or supersession is never inferred from automation. Show actual effects and preserve authorization scope. Commands and helpers emit observations; missing/failed helpers are not clean results. Direct file-reading fallback is valid only when it establishes the same facts. Dependency graph computation and receipt hashing must actually run, or that subcheck is NOT ASSESSED. Native skill names use $name; merely recommending a skill never runs it.

Preserve denominators, stable TR IDs, source-derived layer scope, the graph helper, receipt scope/freshness, and PASS < NOT ASSESSED < CONCERNS < FAIL severity. Proposed coverage is never accepted coverage. No mandatory independent or engine assessment may silently pass through an in-session fallback. A file existing in an RTM proves file linkage, not a passing test execution. Single-system updates preserve other systems and never deprecate their unread requirements. A required fresh review after authoring must run in a separate session/context; an in-session diagnostic is explicitly not that release-quality sign-off.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, Bash(bash "*/.agents/skills/architecture-review/../../hooks/yaml-helper.sh" resolve_config *), Bash(bash .agents/scripts/review-receipts.sh check *), Bash(bash .agents/scripts/review-receipts.sh hash *), Bash(bash .agents/scripts/adr-dep-graph.sh*), Bash(bash .agents/scripts/registry.sh validate*)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[focus: full | coverage | consistency | engine | rtm | single-gdd path/to/gdd.md]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys automation,workflow`. If unavailable, report the missing dependency and do not invent results.

# Architecture Review

The architecture review validates that the complete body of architectural decisions
covers all game design requirements, is internally consistent, and correctly targets
the project's pinned engine version. It is the quality gate between Technical Setup
and Pre-Production.

**Argument modes:**
- **No argument / `full`**: Full review — all phases
- **`coverage`**: Traceability only — which GDD requirements have no ADR
- **`consistency`**: Cross-ADR conflict detection only
- **`engine`**: Engine compatibility audit only
- **`single-gdd [path]`**: Review architecture coverage for one specific GDD
- **`rtm`**: Requirements Traceability Matrix — extends the standard matrix
  to include story file paths and test file paths; outputs
  `docs/architecture/requirements-traceability.md` with the full
  GDD requirement → ADR → Story → Test chain. Use in Production phase when
  stories and tests exist.

---

Every `available user-question tool (or ask in plain text and wait)` call follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

**`workflow`** (see `.agents/docs/workflow-modes.md`):
- `full` — full traceability matrix across all GDDs and all ADRs.
- `standard` — reduced scope: architecture doc + critical ADRs only.
- `minimal` — not applicable (no architecture doc required).

## Phase 1: Load Everything

**Read `references/1-load.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 2: Extract Technical Requirements from Every GDD

**Read `references/2-extract-requirements.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 3: Build the Traceability Matrix

**Read `references/3-traceability.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 4: Cross-ADR Conflict Detection

**Read `references/4-conflicts.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 5: Engine Compatibility Cross-Check

**Read `references/5-engine.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 6: Architecture Document Coverage

**Read `references/6-document-coverage.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 7: Output the Review Report

**Read `references/7-report.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 8: Write and Update Traceability Index

**Read `references/8-write.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 9: Handoff

**Read `references/9-handoff.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Error Recovery Protocol

**First, verify the artifact.** If the return contract named a path, check the
path exists before treating the phase as done — **a named artifact that is not
on disk is a failed phase, however fluent the response reads.** An agent can
burn a full phase and return a plausible preamble having written nothing, which
is neither BLOCKED nor an error nor "fails to complete", so the trigger below
never fires. Resume it naming the unmet contract; the context is
usually still there.

If any spawned agent returns BLOCKED, errors, or fails to complete: **surface it
immediately, don't proceed past a dependency it blocks, and always produce a
partial report** (retry scope here = fewer GDDs / single-system). Full procedure:
`.agents/docs/error-recovery-protocol.md`.

---

## Collaborative Protocol

**Applies in `collaborative` mode (the default).** For `guided` and
`autonomous` modes, see `.agents/docs/automation-modes.md` — the rules below
describe what collaborative mode requires, not universal behavior.

1. **Read silently** — do not narrate every file read
2. **Show the matrix** — present the full traceability matrix before any write
   approval; let the user see the state
3. **Don't guess** — if a requirement is ambiguous, ask: "Is [X] a technical
   requirement or a design preference?"
4. **Draft before approval** — always show the content that will be written (the
   report, the updated ADR section, the systems-index row) inline in the conversation
   before requesting approval. Never ask to write something the user has not yet seen.
5. **Use `available user-question tool (or ask in plain text and wait)` for write approvals** — when the structured question tool is available, use it; otherwise present numbered options in plain text and wait. Use labeled options [A]/[B]/[C] so the
   user can choose between "write now", "show full draft first", and "not yet".
   Multi-file changesets must list every file and what changes, then ask once
   with grouped options — not a separate plain-text question per file.
6. **Non-blocking** — the verdict is advisory; the user decides whether to continue
   despite CONCERNS or even FAIL findings
