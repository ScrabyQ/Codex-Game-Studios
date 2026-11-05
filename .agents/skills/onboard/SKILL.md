---
name: onboard
description: "Onboarding doc for a new contributor or agent — project state, conventions, priorities relevant to the specified role."
---

## Codex execution contract

**CGS-19 execution contract:** Work from the explicitly selected project root and real source artifacts. A missing, unreadable, incomplete or unrun input is NOT ASSESSED for the affected claim; never turn unknown into zero, approval or a measurement. Use supported user-question facilities or ask in plain text and wait; prior authorization and host permissions remain authoritative. Do not automatically start another workflow. An in-session role review is not independent; disclose it and leave any required independent review NOT ASSESSED.

This skill onboards a new project contributor or agent, not a game player. Resolve project instructions from AGENTS.md/project.yaml and applicable native role definitions; report missing role/context as NOT ASSESSED. Describe only observed role-relevant files and conventions. A request for player tutorial/onboarding is a separate UX/player-journey workflow and remains unassessed here unless separately performed; never claim a playtest or invent player observations.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Bash(bash "*/.agents/skills/onboard/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[role|area]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys automation`. If unavailable, report the missing dependency and do not invent results.

**Automation mode**: Resolve `modes.automation` (`project.local.yaml` →
`project.yaml` → default `collaborative`). Every `available user-question tool (or ask in plain text and wait)` call and
every file write follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

# Onboard

## Insufficient input — check this before producing any report

**If the inputs this skill needs do not exist, the answer is "could not run" —
not a filled-in report.** Check first, and stop if the check fails.

1. List the inputs this skill reads (data files, prior reports, profiler output,
   test results, registries, source code).
2. For each, record `FOUND` or `ABSENT` — not "assumed present".
3. If any input required for a section is ABSENT, that section is
   **`NOT ASSESSED — NO DATA`**. Do not estimate it, do not infer it from an
   adjacent artifact, and do not leave a mandated cell to be filled by whoever
   reads the template next.
4. If **every** required input is ABSENT, stop and report
   **`NOT ASSESSED — NO DATA`** as the whole verdict, naming what was missing and
   which skill produces it.

**A verdict of `NOT ASSESSED` is a success.** It is the correct, useful answer to
"what does the data say?" when there is no data. The failure mode this prevents is
specific: a report whose verdict enum has no "could not run" state produces
**false clean passes** — an asset audit returning COMPLIANT on a project with no
assets and no standards, or a performance profile reporting ">99% headroom against
a 16.67ms budget" with zero profiler data and no budget ever set.

**Absence of evidence is never evidence of absence.** A scan that finds no
matches because there are no files to scan has not verified anything. Say which of
the two happened — a reader cannot tell from a green result.

---

## Phase 1: Load Project Context

Read AGENTS.md and project.yaml for project overview and standards; select relevant path policies on demand.

Read the relevant native role definition from `.codex/agents/<role>.toml` if a specific role is specified; if unavailable, report that role input NOT ASSESSED.

If AGENTS.md, project.yaml, or the requested native role definition is missing, report that input as missing rather than inferring it.

---

## Phase 2: Scan Relevant Area

- For programmers: scan the code root (resolve per `.agents/docs/code-root-resolution.md`) for architecture, patterns, key files. An unresolved root means the scan did not run: the sections it feeds read `NOT ASSESSED — code root unresolved`, never a guess at `src/`
- For designers: scan `design/` for existing design documents
- For narrative: scan `design/narrative/` for world-building and story docs
- For QA: scan `tests/` for existing test coverage (`$test-setup` creates it)
- For production: scan `production/` for current sprint and milestone
- **No role or area given**: a general orientation — list the top level of `design/`,
  `docs/architecture/`, `production/` and the code root, read
  `production/session-state/active.md` if it exists, and say that a role would
  focus the next pass (e.g. `$onboard programmer`)

Read recent changes (git log if available) to understand current momentum.

---

## Phase 3: Generate Onboarding Document

```markdown
# Onboarding: [Role/Area]

## Project Summary
[2-3 sentence summary of what this game is and its current state]

## Your Role
[What this role does on this project, key responsibilities, who you report to]

## Project Architecture
[Relevant architectural overview for this role]

### Key Directories
| Directory | Contents | Your Interaction |
|-----------|----------|-----------------|

### Key Files
| File | Purpose | Read Priority |
|------|---------|--------------|

## Current Standards and Conventions
[Summary of conventions relevant to this role from AGENTS.md, applicable .agents guidance and the native role definition]

## Current State of Your Area
[What has been built, what is in progress, what is planned next. Name what
Phase 2 found by path — for a designer, each existing GDD and design doc — or
say it found none]

## Current Sprint Context
[What the team is working on now and what is expected of this role]

## Key Dependencies
[What other roles/systems this role interacts with most]

## Common Pitfalls
[Things that trip up new contributors in this area]

## First Tasks
[Suggested first tasks to get oriented and productive]

1. [Read these documents first]
2. [Review this code/content]
3. [Start with this small task]

## Questions to Ask
[Questions the new contributor should ask to get fully oriented]
```

---

## Phase 4: Save Document

Present the onboarding document to the user.

Ask: "May I write this to `production/onboarding/onboard-[role]-[date].md`?"

If yes, write the file, creating the directory if needed.

---

## Phase 5: Next Steps

Verdict: **COMPLETE** — onboarding document generated.

- Share the onboarding doc with the new contributor before their first session.
- Run `$sprint-status` to show the new contributor current progress.
- Run `$help` if the contributor needs guidance on what to work on next.
