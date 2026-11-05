---
name: gate-check
description: "Ready to advance between development phases? PASS/CONCERNS/NOT ASSESSED/FAIL with blockers and required artifacts. 'Can we move to production?'"
---

## Codex execution contract

**CGS-14 execution contract:** Resolve the explicitly selected project root and current project settings; use actual artifact content and status, not file existence as proof of completion. Missing, unreadable, placeholder-only, failed or unrun checks are unknown/NOT ASSESSED when required, never a fabricated pass. Execute explicit bootstrap and helpers through available supported tools with the selected root. Use the dispatcher `--root <selected-root>` once for `story-status`, `story-facts`, and `artifact-check`; never pass a second positional root to the dispatcher. For `artifact-check`, require a catalog inside that root and confirm its emitted ROOT matches the selected project; report an unavailable helper and fall back only to directly verifiable facts. Keep prior user authorization and host permissions; unanswered or skipped required decisions are not consent. Do not invoke a suggested next skill automatically. When native role delegation is unavailable, an in-session review is not independent: disclose it and leave any required independent gate NOT ASSESSED.

Preserve FAIL > CONCERNS > NOT ASSESSED > PASS precedence, while any required unknown prevents advancement even where CONCERNS outranks it in the displayed verdict. Check actual artifact content and quality, not existence alone. Advance only after an actually assessed PASS plus authorization, or the source-defined explicit CONCERNS override with every risk accepted and no required check unassessed; FAIL/NOT ASSESSED never advance. Confirm and read back both project.stage and production/stage.txt through the stage helper; never silently fix a split stage. Minimal has the brief short path; full independent director gates cannot be replaced by claimed independent review in-session.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, Bash(bash "*/.agents/skills/gate-check/../../hooks/yaml-helper.sh" resolve_config *), Bash(bash .agents/scripts/artifact-check.sh *), Bash(bash .agents/scripts/gdd-structure-check.sh*), Bash(bash .agents/scripts/adr-dep-graph.sh*), Bash(bash .agents/scripts/set-stage.sh *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[target-phase: systems-design | technical-setup | pre-production | production | polish | release] [--review full|lean|solo]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,workflow,qa.level,testing.strict,performance.enforce,team.size,project.stage,system_overrides`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode`. No block →
defaults in `.agents/docs/config-resolution.md`.

# Phase Gate Validation

This skill validates whether the project is ready to advance to the next development
phase. It checks for required artifacts, quality standards, and blockers.

**Distinct from `$project-stage-detect`**: That skill is diagnostic ("where are we?").
This skill is prescriptive ("are we ready to advance?" with a formal verdict).

## Production Stages (7)

The project progresses through these stages:

1. **Concept** — Brainstorming, game concept document
2. **Systems Design** — Mapping systems, writing GDDs
3. **Technical Setup** — Engine config, architecture decisions
4. **Pre-Production** — Prototyping, vertical slice validation
5. **Production** — Feature development (Epic/Feature/Task tracking active)
6. **Polish** — Performance, playtesting, bug fixing
7. **Release** — Launch prep, certification

**When a gate passes** (or the user explicitly accepts a CONCERNS verdict's risks — Section 6), update the stage in both `project.yaml` (set `project.stage: <new-stage>`) AND write the new stage name to `production/stage.txt` (single line, e.g. `Production`). Dual-write keeps backward compatibility with hooks that haven't migrated yet. This updates the status line immediately.

---

## 1. Parse Arguments

**Target phase:** `$ARGUMENTS` with any `--review <mode>` pair removed (blank = auto-detect current stage, then validate next transition). `$gate-check --review full` names no phase.

Note: in `solo` mode, director spawns (CD-PHASE-GATE, TD-PHASE-GATE, PR-PHASE-GATE, AD-PHASE-GATE) are skipped — gate-check becomes artifact-existence checks only. In `lean` mode, the phase-gate directors still run (phase gates are the purpose of lean mode); how many of them run is set by `workflow` below.

**`workflow`** (per `.agents/docs/workflow-modes.md`):

`gate-check` runs project-wide, so it uses the project-level `workflow` for the
gate's overall artifact checklist (the loaded gate file), AND consults
`workflow_overrides.system_overrides.<system>` per-system when validating MVP
GDDs — a system pinned to a higher tier must meet that tier's section count
before the gate passes, regardless of the project-level workflow (see Section 2b,
"Per-system overrides").

> **gate-check honors `workflow` but is exempt from `automation`.** The artifact
> checklist changes per tier; the collaborative prompting protocol (the
> Collaborative Protocol section) always applies — a phase gate is a deliberate
> human checkpoint, never auto-run.

**`qa.level`**: controls test enforcement at phase gates, where `workflow`
controls which artifacts are required. `modes.rigor` sets both together; set
`qa.level` explicitly to vary enforcement alone. At `minimal`, no test gates apply — the
test-evidence and unit-test artifact items become non-required and the
Section 3 `testing.strict` check is a no-op; the smoke check is not relaxed (Section 2b) —
but at this level `$smoke-check` runs without game tests (its automated row reads
WAIVED), so the build check (`commands.smoke`, else `commands.build`, when set) and
the launch and critical-path checks are the floor — a build nobody launched is
NOT ASSESSED — and a project with no tests can still pass. At `standard`,
Logic + Integration tests must pass. At `full`, a full coverage check + regression suite are required
(coverage minimum from `qa.coverage_minimum` if set). The retained screenshots
UI and Visual/Feel stories need are not test items: no `qa.level` relaxes them
(Section 2b).

**`team.size`**: does not change how many directors spawn at a phase gate — panel
width is `workflow`'s axis (Section 4b). This value affects only the
**specialist depth within each director's review**.
`individual` uses the core specialist set; `small` the standard set; `studio`
adds engine sub-specialists. It never skips a director — skipping directors is
`review_mode`'s job. Both `review_mode` and `team.size` are set by
`modes.rigor` — one rigor choice sets both — and each still overrides that axis
when set explicitly (a full-rigor project gets the `studio` set; lighter tiers
get `individual`).

- **With argument**: `$gate-check production` — validate readiness for that specific phase
- **No argument**: Auto-detect current stage using the same heuristics as
  `$project-stage-detect`, then **confirm with the user before running**:

  Use `available user-question tool (or ask in plain text and wait)`:
  - Prompt: "Detected stage: **[current stage]**. Running gate for [Current] → [Next] transition. Is this correct?"
  - Options:
    - `[A] Yes — run this gate`
    - `[B] No — pick a different gate` (if selected, show a second widget listing all gate options: Concept → Systems Design, Systems Design → Technical Setup, Technical Setup → Pre-Production, Pre-Production → Production, Production → Polish, Polish → Release)
  
  Do not skip this confirmation step when no argument is provided.

---

## 2. Phase Gate Definitions

Each gate's checklist — required artifacts, quality checks, and its workflow-tier
reductions — lives in its own file. **Read only the row for the target phase
transition; never load the others.**

| Gate | Definition file |
|------|-----------------|
| Concept → Systems Design | `references/gate-systems-design.md` |
| Systems Design → Technical Setup | `references/gate-technical-setup.md` |
| Technical Setup → Pre-Production | `references/gate-pre-production.md` |
| Pre-Production → Production | `references/gate-production.md` |
| Production → Polish | `references/gate-polish.md` |
| Polish → Release | `references/gate-release.md` |

Each file states the `full` baseline first, then the `standard` and `minimal`
reductions for that gate. Apply the tier resolved in Section 1.

## 2b. Workflow Tier Adjustment

**Read `references/2b-workflow-tier.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 3. Run the Gate Check

**Read `references/3-run-gate-check.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 4. Collaborative Assessment

**Read `references/4-assessment.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 5. Output the Verdict

**Read `references/5-verdict.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 6. Update Stage on PASS

**Read `references/6-update-stage.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 7. Closing Next-Step Widget

**Read `references/7-next-steps.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Collaborative Protocol

This skill follows the collaborative design principle:

1. **Scan first**: Check all artifacts and quality gates
2. **Ask about unknowns**: Don't assume PASS for things you can't verify
3. **Present findings**: Show the full checklist with status
4. **User decides**: The verdict is a recommendation — the user makes the final call on
   what to do next; only the stage write is bound to it (Section 6)
5. **Get approval**: "May I write this gate check report to production/gate-checks/?"
6. **Never auto-fix**: If required artifacts are missing, report the FAIL verdict and
   name the skill to run (e.g. "run `$test-setup`"). Do NOT create missing files or
   re-run the gate automatically. Creating files to manufacture a PASS defeats the
   gate's purpose.

**Never** block a user from working — the verdict decides only whether this skill
writes the new stage. On CONCERNS the user may advance by explicitly accepting the
listed risks, which the report records (Section 6); on FAIL or NOT ASSESSED the
stage stays where it is until a re-run passes, and nothing stops the user working
on the blockers meanwhile.
