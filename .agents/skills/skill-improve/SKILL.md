---
name: skill-improve
description: "Improve a skill via a test-fix-retest loop — static checks, targeted fixes, keep or revert on score change."
---

## Codex execution contract

**CGS-18 studio-testing and evidence contract:** Use available native tools rather than assuming Claude-specific execution. Preserve current host permissions and prior explicit user authorization; unavailable questions use plain conversation and unanswered decisions are not consent. Native delegation is independent only when a child actually runs; otherwise disclose an in-session fallback. Work on one bounded candidate and preserve the exact pre-edit bytes, including pre-existing user changes. Show the specific before/after diff and obtain any still-required authorization. Retest actually available checks; unknown is NOT ASSESSED, not a fabricated score. Restore only the exact candidate change when authorized, without git checkout/reset, overwriting unrelated edits or cycling auto-optimization. Structural counts do not prove behavior improved.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Bash(bash "*/.agents/skills/skill-improve/../../hooks/yaml-helper.sh" resolve_config *)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[skill-name]". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys automation`. If unavailable, report the missing dependency and do not invent results.

**Automation mode**: Resolve `modes.automation` (`project.local.yaml` →
`project.yaml` → default `collaborative`). Every `available user-question tool (or ask in plain text and wait)` call and
every file write follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

# Skill Improve

Runs an improvement loop on a single skill:
test → fix → retest → keep or revert.

Its score comes from `$skill-test` static and category checks, which read the
skill rather than run it: a better score means a better-written skill, not proof
that it behaves better. To check behaviour, run the skill on a real request
before and after the change.

---

## Phase 1: Parse Argument

Read the skill name from the first argument. If missing, output usage and stop:

```
Usage: $skill-improve [skill-name]
Example: $skill-improve tech-debt
```

Verify `.agents/skills/[name]/SKILL.md` exists. If not, stop with:
"Skill '[name]' not found."

Glob `CCGS Skill Testing Framework/catalog.yaml`. When it exists, say so first:
"`CCGS Skill Testing Framework/` was renamed `studio-tests/` in 1.2.0, and this
skill reads only `studio-tests/`. Move any specs you wrote there; UPGRADING.md
(v1.1.3 → v1.2.0, `studio-tests/`) says how." Then go on.

---

## Phase 2: Baseline Test

Run `$skill-test static [name]` and record the baseline score:
- Count of FAILs
- Count of WARNs
- Which specific checks failed (Check 1–7)

Display to the user:
```
Static baseline:   [N] failures, [M] warnings
Failing: Check 4 (authorization conflict), Check 5 (no handoff)
```

If the static result is **NOT ASSESSED** (the skill file could not be read or
parsed), stop and report it with its reason: there is no score to improve, and
0 FAILs from a file nobody could read is not a clean result.

If baseline is 0 FAILs and 0 WARNs, note it and proceed to Phase 2b.

### Phase 2b: Category Baseline

Look up the skill category in the read-only studio-tests/catalog.yaml. Report run results in conversation or, when authorized, use ignored production/session-logs/studio-tests/ or host temporary storage; keep any catalog-results.yaml execution overlay there, never update the tracked catalog as a run log.

If no `category:` field is found, display:
"Category: not yet assigned — skipping category checks."
and skip to Phase 3.

If category is found, run `$skill-test category [name]` and record the category baseline:
- Count of FAILs
- Count of WARNs
- Which specific category rubric metrics failed

Display to the user:
```
Category baseline: [N] failures, [M] warnings  ([category] rubric)
```

A category result of **NOT ASSESSED** (a rubric section the skill-test could not
find or apply) is reported with its reason and is not a zero: the category
dimension is then excluded from "already passes" below.

If BOTH static and category baselines are 0 FAILs and 0 WARNs — and neither is
NOT ASSESSED — stop:
"This skill already passes all static and category checks. No improvements needed."

---

## Phase 3: Diagnose

Read the full skill: `.agents/skills/[name]/SKILL.md` and every file in its `references/` folder,
if it has one — the longest skills keep each phase there. Name the file each
gap is in.

For each failing or warning **static** check, identify the exact gap:

- **Check 1 fail** → which frontmatter field is missing
- **Check 2 fail** → how many phases found vs. minimum required
- **Check 3 fail** → no verdict keywords anywhere in the skill body
- **Check 4 fail** → Correct the specific authorization conflict; preserve prior user authorization and host permissions.
- **Check 5 warn** → no follow-up or next-step section at the end
- **Check 6 warn** → A skill requiring separate delegated or isolated phases has fewer than five phase headings; clarify its actual phase structure.
- **Check 7 warn** → Invocation or documented modes are unclear; clarify them without requiring legacy argument-hint metadata.

For each failing or warning **category** check (if category was assigned in Phase 2b),
identify the exact gap in the skill's text. For example:
- If G2 fails (gate mode, director panel width): skill body does not size the
  PHASE-GATE panel from `modes.workflow` (PR at `minimal`, TD + PR at `standard`,
  all 4 at `full`)
- If A2 fails (authoring, no per-section May-I-write): skill asks once at the end, not
  before each section write
- If T3 fails (team, BLOCKED not surfaced): skill doesn't halt dependent work on blocked agent

Show the full combined diagnosis to the user before proposing any changes.

---

## Phase 4: Propose Fix

Write a targeted fix for each failure and warning. Show the proposed changes
as clearly marked before/after blocks. Only change what is failing — do not
rewrite sections that are passing. In a skill with a `references/` folder, a
fix to a phase's steps goes in that phase's `references/` file, not back into
`SKILL.md`; the question below then names each file the fix changes.

Ask: "May I write this improved version to `.agents/skills/[name]/SKILL.md`?"

If the user says no, stop here.

---

## Phase 5: Write and Retest

Record the current content of each file the fix changes — the exact text, kept
in this conversation — so Phase 6 can restore it.

Write the improved skill to `.agents/skills/[name]/SKILL.md`, and to each
`references/` file the fix changes.

Re-run `$skill-test static [name]` and record the new static score — measured by that run, never stated from the edit.
If a category was assigned, also re-run `$skill-test category [name]` and record the new category score.

Display the comparison:
```
Static:   Before [N] failures, [M] warnings  →  After [N'] failures, [M'] warnings
Category: Before [N] failures, [M] warnings  →  After [N'] failures, [M'] warnings  (if applicable)
Combined: [before] → [after] (improved / no change / worse)
```

`[before]` and `[after]` are the Phase 6 combined counts — failures plus
warnings, both dimensions — e.g. `Combined: 3 → 0 (improved)`.

---

## Phase 6: Verdict

Count the combined failure total: static FAILs + category FAILs + static WARNs + category WARNs.
**A re-test that comes back NOT ASSESSED** (for example, the edit broke the
frontmatter so the file no longer parses) is never an improvement, whatever its
counts: take the "did not improve" branch below.

**If combined score improved (combined failure count is lower than baseline):**
Report: "Score improved. Changes kept."
Show a summary of what was fixed in each dimension.

**If combined score is the same or worse:**
Report: "Combined score did not improve."
Show what changed and why it may not have helped.
Ask: "May I restore `.agents/skills/[name]/SKILL.md` to the content it had before this run?"
— naming every file Phase 5 wrote.
If yes: write the content recorded in Phase 5 back to each file with Write; if no, leave the files as written. Never
`git checkout` it — that returns the last *committed* version and discards any edits
made before this run that were not yet committed.

---

## Phase 7: Next Steps

- Run `$skill-test static all` to find the next skill with failures.
- Run `$skill-improve [next-name]` to continue the loop on another skill.
- Run `$skill-test audit` to see overall coverage progress.
