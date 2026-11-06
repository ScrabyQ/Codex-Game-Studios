---
name: prototype
description: "Concept prototype before GDDs — throwaway HTML, Engine or Paper build, PROCEED/PIVOT/KILL/NOT ASSESSED. After $brainstorm and $setup-engine."
---

## Codex execution contract

**CGS-12 Codex workflow contract:** Use the explicit configuration bootstrap and the current project root. Translate source Agent and specialist calls to authorized available native delegation; otherwise read the role and gate material and perform a clearly labeled in-session assessment, not an independent review. Preserve unavailable mandatory reviews as NOT ASSESSED. Use available question facilities or plain text, preserve existing authorization, and wait for unanswered required decisions. Source tools and automation do not grant permissions. Keep proposed drafts and decisions distinct from approved writes; do not infer approval. Read source templates and linked resources in the active phase.

The source prototyper role requires an actual isolated Git worktree, not a fictitious native flag or a mere prototypes directory. Before assigning its implementation, establish a separate worktree and branch with host-authorized Git operations; inspect its root and branch, locate the user checkout with `git worktree list --porcelain`, inspect its status, and stop if needed uncommitted or ignored inputs are unavailable. Check LFS requirements and disclose skipped checks. Do not build against stale inputs. If isolation cannot be established, report the implementation PENDING; do not silently run the prototyper in the main checkout. Hand back the actual worktree path and branch. Preserve the no-production-import boundary, headers, disposable code, and rewrite-from-scratch rule.

Preserve one hypothesis, scope approval, path choice, timeboxes, debrief and report; spike yields YES/NO/PARTIAL, not a concept gate verdict. A playable result and actual observations are required for a substantive verdict.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, Agent, user-question facility, Bash(bash "*/.agents/skills/prototype/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[concept-description] [--path html|engine|paper] [--review full|lean|solo] [--spike]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys review_mode,automation,workflow`. If unavailable, report the missing dependency and do not invent results.

Resolved above — use as-is; `--review` overrides `review_mode` for this run. No
block → defaults in `.agents/docs/config-resolution.md`.

# Prototype

## Purpose

This is the **concept prototype** — a fast, throwaway build that answers one question:
*"Is this core idea actually fun to interact with?"*

**Default use** — run right after `$brainstorm` and `$setup-engine`, before writing
GDDs or architecture docs. Its verdict determines whether the concept is worth the
investment of full design documentation.

**Mid-production?** You can also run this at any stage to test a specific mechanic,
design change, or technical question. Pass `--spike` to activate spike mode: a
lightweight ~4-hour build with no GDD prerequisites and no phase gate implications.

**Already have GDDs and architecture complete?** To validate the full game loop
before committing to Production, run `$vertical-slice` instead.

---

## Phase 1: Define the Question

**Read `references/1-question.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 2: Load Concept Context

**Read `references/2-load-context.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 3: Choose the Prototype Path

**Read `references/3-choose-path.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 4: Plan the Prototype

**Read `references/4-plan.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 5: Implement

**Read `references/5-implement.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 6: Playtest Debrief

**Read `references/6-debrief.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 7: Generate Prototype Report

**Read `references/7-report.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 8: Creative Director Review

**Read `references/8-cd-review.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Phase 9: Summary and Next Steps

**Read `references/9-summary.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Spike Mode

**Triggered by:** `--spike` flag OR "Mid-production spike" entry choice in Phase 1.

**Read `references/spike-mode.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

### Important Constraints

- Prototype code must NEVER import from production source files
- Production code must NEVER import from prototype directories
- If the recommendation is PROCEED, production implementation is written from
  scratch — prototype code is never refactored into production
- Total effort is hard-capped at 1 day (concept prototypes test one mechanic)
- Test ONE mechanic — if scope grows, stop and simplify the question
- No polish. No menus, no game over, no music, no UI unless it IS the mechanic
- If stuck after 2 hours of engine iteration, reframe the question or switch paths
- **3 PIVOT iterations → force a KILL decision.** If this is the third time the
  same concept has produced a PIVOT verdict, the concept likely doesn't work.
  Ask: "Is this the right idea, or am I in the sunk cost trap?" A new concept
  prototyped fresh will almost always beat a fourth iteration of a struggling one.
- Building 2-3 different concept variants and picking the best one is a healthier
  strategy than iterating one concept to death. Natural selection between prototypes
  beats willpower.
- **Networked/multiplayer games:** A local prototype cannot validate the feel of a
  networked mechanic. Latency fundamentally changes how combat, movement, and
  prediction feel — a prototype running at 0ms local will feel entirely different at
  80ms network delay. Use a local prototype to validate that the mechanic is
  *interesting*. Do not use it as evidence that it *feels good* under real network
  conditions. Network feel requires real peers or simulated latency (e.g., throttle
  tools, network condition simulators).
