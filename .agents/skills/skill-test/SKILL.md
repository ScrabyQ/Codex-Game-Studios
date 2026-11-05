---
name: skill-test
description: "Validate skill files for structural compliance and behavioral correctness. Four modes: static linter, spec, category rubric, audit."
---

## Codex execution contract

**CGS-18 studio-testing and evidence contract:** Use available native tools rather than assuming Claude-specific execution. Preserve current host permissions and prior explicit user authorization; unavailable questions use plain conversation and unanswered decisions are not consent. Native delegation is independent only when a child actually runs; otherwise disclose an in-session fallback. For native Skills, validate supported Codex frontmatter and the installed SKILL.md, not Claude-only argument-hint, user-invocable or allowed-tools fields; absence of those legacy fields is not a native failure. Read docs/codex/studio-tests/native-criteria.md for the exact native/legacy mapping. Use the native structural helper, state its subset and report malformed or unreadable files accurately. Keep studio-tests catalog names, spec paths and category rubrics as legacy written specifications; spec and category assessments inspect documents and are not observed model execution. Unavailable or inapplicable checks are NOT ASSESSED, never zeros or claimed behavior.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Bash(bash "*/.agents/skills/skill-test/../../hooks/yaml-helper.sh" resolve_config *), Bash(bash .agents/scripts/agent-check.sh*), Bash(bash .agents/scripts/compat-inventory.sh*)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "static [skill-name | all] | spec [skill-or-agent-name] | category [skill-or-agent-name | all] | audit". 


**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys automation`. If unavailable, report the missing dependency and do not invent results.

**Automation mode**: Resolve `modes.automation` (`project.local.yaml` →
`project.yaml` → default `collaborative`). Every `available user-question tool (or ask in plain text and wait)` call and
every file write follows `.agents/docs/automation-modes.md`
(collaborative asks always · guided major-only · autonomous logs and proceeds;
`automation_always_ask` categories always prompt).

# Skill Test

Validates skills (`.agents/skills/*/SKILL.md`) and agents (`.codex/agents/*.toml`)
for structural compliance and behavioral correctness. No external dependencies —
runs entirely within the existing skill/hook/template architecture.

**Four modes:**

| Mode | Command | Purpose | Token Cost |
|------|---------|---------|------------|
| `static` | `$skill-test static [name\|all]` | Structural linter — 7 compliance checks per skill, plus agent, delegation and compatibility observations | Low (~1k/skill) |
| `spec` | `$skill-test spec [name]` | Behavioral verifier — evaluates assertions in a skill's or agent's test spec | Medium (~5k each) |
| `category` | `$skill-test category [name\|all]` | Category rubric — checks a skill or agent against its category-specific metrics | Low (~2k each) |
| `audit` | `$skill-test audit` | Coverage report — skills, agent specs, last test dates | Low (~3k total) |

**What a pass proves.** Every mode reads files; none runs the skill. `static`:
the file has the structure a skill needs, not that it behaves. `spec`: read
closely, the instructions cover each case, not that a model follows them when it
runs. `category`: the skill meets its category's rubric as written. `audit`:
which skills and agents have specs, and when each was last checked. What a skill
does shows only when it runs: a real request in a throwaway copy of the project,
on each model you use, with and without the skill (Anthropic's Agent Skills best
practices, "Build evaluations first").

---

## Phase 1: Parse Arguments

Determine mode from the first argument:

- `static [name]` → run 7 structural checks on one skill, or the agent observations on one agent
- `static all` → run 7 structural checks on all skills (Glob `.agents/skills/*/SKILL.md`), plus the observations for every agent
- `spec [name]` → read the skill or agent + its test spec, evaluate assertions
- `category [name]` → run category-specific rubric from `studio-tests/quality-rubric.md`
- `category all` → run category rubric for every skill and every agent that has a `category:` in catalog
- `audit` (or no argument) → read catalog, list all skills and agents, show coverage

If the argument is unrecognized, output usage and stop.

**The old spec folder.** Glob `CCGS Skill Testing Framework/catalog.yaml`. When
it exists, say so first: "`CCGS Skill Testing Framework/` was renamed
`studio-tests/` in 1.2.0, and this skill reads only `studio-tests/`. Move any
specs you wrote there; UPGRADING.md (v1.1.3 → v1.2.0, `studio-tests/`) says how."
Then go on with `studio-tests/`.

**Resolve the name before `spec` or `category`.** Look it up in
`studio-tests/catalog.yaml`: an entry under `skills:` is a skill
(`.agents/skills/[name]/SKILL.md`); an entry under `agents:` is an agent
(`.codex/agents/[name].toml`). With no catalog entry, use whichever of those two
files exists. Only when neither exists, report "'[name]' is neither a skill in
`.agents/skills/` nor an agent in `.codex/agents/`." and stop. A name that is
also an ordinary word is still a name: `$skill-test spec help` tests the `$help`
skill, never a request for this skill's usage.

The 7 checks lint SKILL.md structure, so they are skills-only. Given an agent
name, `static` runs only the observations below: an agent file has no
phases or verdict keywords to lint. Never report the agent as missing.

---

## Phase 2A: Static Mode — Structural Linter

For each skill being tested, read its `SKILL.md` and every file in its `references/` folder
fully, and run all 7 checks on them as one skill — the longest skills keep each
phase in `references/`. The frontmatter check 1 reads `SKILL.md`.

### Check 1 — Native Frontmatter
Require parseable native frontmatter with a name matching the directory and a nonempty description. Missing or malformed required fields FAIL. Legacy argument-hint, user-invocable and allowed-tools are not required native fields.

### Check 2 — Multiple Phases
The skill must have ≥2 numbered phase headings. Look for patterns like:
- `## Phase N` or `## Phase N:`
- `## N.` (numbered top-level sections)
- At least 2 distinct `##` headings if phases aren't explicitly numbered

**FAIL** if fewer than 2 phase-like headings are found.

### Check 3 — Verdict Keywords

The skill must communicate a clear outcome. Accept any of:

- **Gate / review verdicts** — `PASS`, `FAIL`, `CONCERNS`, `APPROVED`,
  `BLOCKED`, `COMPLETE`, `READY`, `COMPLIANT`, `NON-COMPLIANT`
- **Go / no-go verdicts** — `PROCEED`, `PIVOT`, `KILL`, `GO`, `NO-GO`
- **Severity scales** — `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`. Audit skills rank
  findings by severity instead of issuing one verdict for the whole run.

**FAIL** if none are present **and** the skill produces an assessment — its
description or body promises a review, audit, check, gate, or readiness
judgement.

**WARN** (never FAIL) if none are present and the skill's output is an artifact
or a value rather than a judgement. `$settings` is the reference case: it prints
and writes configuration and has no verdict to give. Do not invent one to
satisfy this check.

> A narrower list — gate verdicts only, hard FAIL on anything else — would wrongly
> fail skills for reasons that are not their fault: `$prototype` and
> `$vertical-slice` advertise `PROCEED`/`PIVOT`/`KILL` in their own descriptions,
> `$adopt` and `$security-audit` rank by severity, and `$settings` has no verdict
> by design. A linter that produces false failures on legitimate patterns stops
> being trusted.

### Check 4 — Authorization and Decisions
Assess whether executable writes and decisions respect prior user authorization and active host permissions. Required unanswered decisions are not consent. Do not require unconditional per-write questions. Report a concrete conflict as FAIL; read-only or inapplicable work is N/A.

### Check 5 — Next-Step Handoff
The skill must end with a recommended next action or follow-up path. Look for:
- A final section mentioning another skill (e.g., `$story-done`, `$gate-check`)
- "Recommended next" or "next step" phrasing
- A "Follow-Up" or "After this" section

**WARN** if absent.

### Check 6 — Branch Complexity and Delegation
If the native body requires separate delegated or isolated phases, WARN when fewer than five phase headings are present; otherwise this complexity criterion is N/A. Where delegation is used, check for justified authorized native delegation, bounded assignments and an honest non-independent fallback or PENDING. No legacy fork metadata is required.

### Check 7 — Invocation Behavior
Check that documented modes and arguments are understandable and handled consistently. Legacy argument-hint is not required; report unclear invocation as WARN.

### Native Format and Delegation Observations (not scored)

Run `node scripts/codex/native-helper-check.mjs skill [name] --root <project-root>` for one skill or use `skill all` for all skills. For a role use `node scripts/codex/native-helper-check.mjs role --agent [name] --root <project-root>`, or `role --root <project-root>` for all roles. These check a documented structural subset only; they do not execute behavior or establish a verdict. Report failures or unavailable checks explicitly.

Manually inspect actual delegation instructions for objective, inputs, owned paths, permission boundaries, output and evidence, and whether the work requires independent review. Distinguish an actual native role from an in-session non-independent fallback. For roles, inspect the declared capability ceiling and relevant native fields rather than assuming source tool controls or model aliases are native settings. Report any uninspected observations as NOT ASSESSED.

### Compatibility Observations (not scored)

Run `bash .agents/scripts/compat-inventory.sh --skill [name]` for a skill,
`bash .agents/scripts/compat-inventory.sh --agent [name]` for an agent, or
`bash .agents/scripts/compat-inventory.sh` once for `static all`. Each FOUND line is a lexical observation of a possible legacy construct, not a verdict or proof of runtime dependency; inspect context and report it under Compatibility. The helper scans role TOML as physical text without decoding the body. A NOT FOUND line means the name matched no file. If the script cannot run, write Compatibility: not run (reason).

---

### Static Mode Output Format

For a single skill:
```
=== Skill Static Check: $[name] ===

Check 1 — Frontmatter Fields:    PASS
Check 2 — Multiple Phases:       PASS (7 phases found)
Check 3 — Verdict Keywords:      PASS (PASS, FAIL, CONCERNS)
Check 4 — Authorization:          PASS
Check 5 — Next-Step Handoff:     WARN (no follow-up section found)
Check 6 — Branch Complexity:      PASS
Check 7 — Invocation Behavior:    PASS

Observations (not scored):
  Delegation, "Phase 3: Implementation" (line 202): ux-designer, ui-programmer.
    The brief names the output file and limits but no sources to read.

Compatibility (not scored):
  questions: available user-question tool (or ask in plain text and wait) (lines 13, 88) · shell-lines: shell-line (line 10)
  frontmatter: allowed-tools, argument-hint, model, user-invocable (lines 4-7)

Verdict: WARNINGS (1 warning, 0 failures)
Recommended: Add a "Follow-Up Actions" section at the end of the skill.
```

For a single agent there is no verdict, only observations:
```
=== Agent Static Check: qa-lead ===

Model: resolved through active policy and host capabilities
Capability ceiling: Read, Glob, Grep, Write, Edit, Bash; shell flag checked.
Observations (not scored):
  Authorization: prior user approval persists; unresolved decisions are surfaced.
  overlap with qa-tester (creation, regression, test): each still singled out.
Compatibility (not scored):
  Runtime dependencies: assessed from actual native instructions; source metadata is not a native setting.
```

A WARN or FAIL line names its cause in parentheses, and any verdict other than
COMPLIANT ends with a `Recommended:` line naming the fix.

The single-skill `Verdict:` is one of four values, the same as the `static all`
Result column: **COMPLIANT** (no warnings, no failures), **WARNINGS** (warnings,
no failures), **NON-COMPLIANT** (any FAIL), or **NOT ASSESSED** (the file could
not be read or parsed, or its checks could not run — name the reason).

For `static all`, produce a summary table then list any non-compliant skills:
```
=== Skill Static Check: All 74 Skills ===

Skill                  | Result       | Issues
-----------------------|--------------|-------
gate-check             | COMPLIANT    |
design-review          | COMPLIANT    |
story-readiness        | WARNINGS     | Check 5: no handoff
...

Summary: 48 COMPLIANT, 3 WARNINGS, 1 NON-COMPLIANT, 1 NOT ASSESSED
Aggregate Verdict: N WARNINGS / N FAILURES / N NOT ASSESSED

Agents (observations, not scored): 49 read
  asks-user: N agents · agent-type-list: N · preload-off: N · frontmatter: N
  Overlap pairs: [each pair, with whether both are still singled out]
  Delegation blocks: N in N skills; [the ones whose brief lacks a part]

Compatibility (not scored): N FOUND lines in N of N files read
  [feature]: [construct] N files, N hits; ...   (one line per feature)
```

**`NOT ASSESSED` is a per-skill result here, not only an aggregate line.** A skill
whose file is missing or otherwise unreadable (permissions, not found), so no
check could even start, is reported as `NOT ASSESSED` with the reason — never
omitted from the table and never counted as COMPLIANT. Ranked **above
COMPLIANT**, **below WARNINGS and NON-COMPLIANT**. A file that *was* read but
whose frontmatter does not parse is a different case: Check 1 fails on it (see
above), so it is reported **NON-COMPLIANT**, not NOT ASSESSED — the defect is in
the skill, not in the linter's access to it.

**And state the denominator.** `All 74 Skills` in the header must be the number
actually examined, not the number that exist: report `[N] of [M] skills checked`
whenever they differ. A summary whose counts silently sum to less than its own
title is the failure this skill is supposed to catch in others.

No file writes in static mode.

---

## Phase 2B: Spec Mode — Behavioral Verifier

### Step 1 — Locate Files

Use the skill or agent file resolved in Phase 1.
Look up the spec path from `studio-tests/catalog.yaml` — use the
`spec:` field on the matching `skills:` or `agents:` entry.

If either is missing:
- Missing skill or agent: the Phase 1 message.
- Missing spec path in catalog: "No spec path set for '[name]' in catalog.yaml."
- Spec file not found at path: "Spec file missing at [path]. Run `$skill-test audit`
  to see coverage gaps."

### Step 2 — Read Both Files

Read the skill — its `SKILL.md` and every file in its `references/` folder — or
the agent file, and the test spec file, completely.

### Step 3 — Evaluate Assertions

**Evaluate against what the model running it can see.** A skill runs in a
session, and a delegated role in its own context. Read AGENTS.md, selected applicable .agents rules and guidance explicitly; count only instructions actually supplied or read. Cite their source and apply the active instruction hierarchy; do not assume Claude @imports or automatic role preload.

**For an agent**, the spec's sections are evaluated against the agent file —
and only against skills actually available and supplied to the role:

- **Static Assertions** — evaluate the native TOML fields, decoded instructions, capability ceiling and active host limits against the native criteria in docs/codex/studio-tests/native-criteria.md. Map historical source aliases and frontmatter assertions to their documented native equivalents; do not demand a source model pin or tool allowlist. A runtime-only claim or unmappable assertion is NOT ASSESSED, with its reason.
- **Test Cases** — evaluate each case's expected behavior against the agent's
  written instructions, the same way a skill's are evaluated below. A case
  that names a gate ID (`LP-FEASIBILITY`, `CD-PILLARS`, …) is that gate's
  invocation: the spawning skill has the agent read
  `.agents/docs/director-gates/[gate-id].md` first, so that file's Prompt and
  Verdicts are the agent's instructions for the case — read it too.
- **Redirect and escalation cases** — the agent is asked for work another role
  owns, or meets a conflict it cannot settle. The case is met when the loaded
  `coordination-rules.md` covers the step — rule 2 (no binding decisions
  outside its domain), rule 3 (escalate a conflict to the shared parent) or
  rule 5 (no files outside its directories without delegation) — **and** the
  agent's own file names the owning role in its collaborator, delegation,
  escalation or "must not" lists. Cite both; do not require the agent to
  restate the redirect in its own words. It is a FAIL when the agent's file
  claims that work for itself, or when no loaded file names who owns it.
- **Protocol Compliance** — use the spec's own `## Protocol Compliance` list in
  place of the four skill checks below.

**For a skill**, check each of the spec's **Static Assertions** against the
skill's frontmatter and body (`SKILL.md` and its `references/` files) the same
way; a literal value is an exact
comparison. `$skill-test static` runs only its 7 fixed checks, so a spec's own
static lines — a verdict keyword, a phase, or a contextual authorization rule —
are evaluated here or nowhere.

The rest of this step applies to skills and agents alike.

For each **Test Case** in the spec:

1. Read the **Fixture** description (assumed state of project files)
2. Read the **Expected behavior** steps
3. Read each **Assertion** checkbox

A case with no **Fixture** reads its **Input** as the fixture; a case with no
**Assertions** list treats each **Expected behavior** bullet as an assertion —
most agent specs are written this way, and a case verdict is not left undefined
just because it has no separate checklist.

For each assertion, evaluate whether the skill's written instructions, if
followed correctly given the fixture state, would satisfy it. This is a
written-instruction reasoning check, not code execution.

Mark each assertion:
- **PASS** — skill instructions clearly satisfy this assertion
- **PARTIAL** — skill instructions partially address it, but with ambiguity
- **FAIL** — skill instructions would NOT satisfy this assertion given the fixture
- **NOT ASSESSED** — the assertion could not be evaluated at all: it names a
  fixture state the spec never defines, depends on runtime behavior no static
  read can settle, or references a file or section that does not exist (a file
  that is merely silent on the behaviour is FAIL or PARTIAL, not this). Rank it
  **above PASS** (an assertion nobody could evaluate has not been satisfied) and
  **below PARTIAL and FAIL** (an ambiguity somebody identified is more actionable
  than one nobody could reach). Do not resolve an unevaluable assertion to PASS
  because the skill "probably" handles it — that judgement is what the spec exists
  to replace.

For a skill's **Protocol Compliance** section (always present), evaluate each line
of the spec's own list against the skill's files exactly as you evaluate a case
assertion — PASS, PARTIAL, FAIL or NOT ASSESSED. Specs put rules there that no
case repeats ("covered by the protocol compliance assertions above"), so a
list that is not evaluated is a set of rules nobody checks. These four checks are
the floor, added when the list does not already cover them:
- Check that writes respect prior user authorization and active host permissions; a named path or mode does not create permission.
- Check that unresolved decisions or actions outside authorization have a reviewable draft and wait for an actual answer.
- Check whether the skill ends with an appropriate recommended next step.
- Check that no unanswered required question is treated as consent.

### Step 4 — Build Report

```
=== Skill Spec Test: $[name] ===
Date: [date]
Spec: studio-tests/skills/[category]/[name].md

Static Assertions:
  [PASS] [assertion text]
  [NOT ASSESSED] [assertion text]
     Reason: [why it could not be evaluated]

Case 1: [Happy Path — name]
  Fixture: [summary]
  Assertions:
    [PASS] [assertion text]
    [FAIL] [assertion text]
       Reason: The skill's Phase 3 says "..." but the fixture state means "..."
  Case Verdict: FAIL

Case 2: [Edge Case — name]
  ...
  Case Verdict: PASS

Protocol Compliance:
  [PASS] Respects existing authorization for file writes
  [PASS] Presents a reviewable draft for an unresolved decision
  [PARTIAL] No explicit next-step handoff at end

Overall Verdict: FAIL (1 case failed, 1 protocol line partial)
```

A Case Verdict is the worst result among its assertions, and the Overall
Verdict the worst across the static assertions, the cases and Protocol
Compliance, in this order:
FAIL, PARTIAL, NOT ASSESSED, PASS. An assertion nobody could evaluate keeps the
overall result from reading PASS.

For an agent, the header is `=== Agent Spec Test: [name] ===`, `Spec:` is its
path under `studio-tests/agents/`, and a `Static Assertions:`
block comes before Case 1.

### Step 5 — Record Results

Report results in conversation. When a persistent run record is authorized and useful, write it to ignored production/session-logs/studio-tests/ or host temporary storage and record last_spec and last_spec_result in an ignored catalog-results.yaml overlay there. Do not write execution results or tracking updates to the tracked studio-tests catalog. Preserve NOT ASSESSED and the actual evidence limits.

---

## Phase 2D: Category Mode — Rubric Evaluation

### Step 1 — Locate Skill and Category

Use the skill or agent file resolved in Phase 1.
Look up the `category:` field on its `skills:` or `agents:` entry in
`studio-tests/catalog.yaml`.

If neither file exists: the Phase 1 message.
If no `category:` field: "No category assigned for '[name]' in catalog.yaml.
Add `category: [name]` to its entry first."

For `category all`: collect every skill and every agent with a `category:` field
and process each, reporting skills and agents in separate tables.
`category: utility` skills are evaluated against U1 (static checks pass) and U2
(gate mode correct if applicable) only — skip to the static mode for U1.
Cross-check against `.agents/skills/*/SKILL.md` and `.codex/agents/*.toml`
(Audit mode's Step 2 glob): list any skill or agent missing from the catalog, or
catalogued with no `category:`, by name as **NOT ASSESSED** — never silently
excluded from the run.

### Step 2 — Read Rubric Section

Read `studio-tests/quality-rubric.md`.
Extract the section matching the category (e.g., `### gate`, `### team`; an
agent's category is under `## Agent Categories`, e.g. `### director`).
If the rubric has no section for the category, the result is **NOT ASSESSED**:
name the missing section, and never borrow another category's metrics.

### Step 3 — Read Skill

Read the skill's `SKILL.md` and every file in its `references/` folder, or the
agent's `.codex/agents/[name].toml`, fully,
and the project context Phase 2B Step 3 describes — a metric met by a rule in
AGENTS.md or explicitly read applicable guidance is met, citing that file. Its rule for
redirect and escalation cases decides the domain, deferral and escalation
metrics too (D2, D3, L2, S1–S3, O2).

### Step 4 — Evaluate Rubric Metrics

For each metric in the category's rubric table:
1. Check whether the skill's or agent's written instructions clearly satisfy the criterion
2. Mark PASS, FAIL, WARN, or NOT ASSESSED (the metric could not be evaluated — name why)
3. For FAIL/WARN/NOT ASSESSED, identify the exact gap in the text (quote the
   relevant section, note its absence, or name what could not be evaluated)

### Step 5 — Output Report

For an agent, the header is `=== Agent Category Check: [name] ([category]) ===`.

```
=== Skill Category Check: $[name] ([category]) ===

Metric G1 — Review mode read:      PASS
Metric G2 — Director panel width:  FAIL
  Gap: Phase 3 spawns only CD-PHASE-GATE at `workflow: full`; TD-PHASE-GATE, PR-PHASE-GATE, AD-PHASE-GATE absent
Metric G3 — Lean mode: PHASE-GATE only: PASS
Metric G4 — Solo mode: no directors:    PASS
Metric G5 — No auto-advance:       PASS

Verdict: FAIL (1 failure, 0 warnings)
Fix: Size the Phase 3 panel from `modes.workflow` — PR at `minimal`, TD + PR at
     `standard`, all four at `full` — and name any perspective a narrower panel leaves out.
```

The category verdict, first match wins: **FAIL** when any metric fails; else
**WARNINGS** when any metric warns; else **NOT ASSESSED** when any metric could
not be evaluated (a rubric section missing, a file unreadable); else **PASS**
when every metric passes — the same ranking as static and spec mode. It is
last_category_result in the ignored runtime overlay when recorded.

### Step 6 — Record Category Results

Report results in conversation. When authorized, record last_category and last_category_result in the ignored production/session-logs/studio-tests/catalog-results.yaml overlay or host temporary storage; do not update the tracked catalog for execution history.

---

## Phase 2C: Audit Mode — Coverage Report

### Step 1 — Read Catalog

Read the functional studio-tests/catalog.yaml and, if present, the ignored production/session-logs/studio-tests/catalog-results.yaml runtime overlay. Report missing files accurately.

### Step 2 — Enumerate All Skills and Agents

Glob `.agents/skills/*/SKILL.md` to get the complete list of skills.
Extract skill name from each path (directory name).

Glob `.codex/agents/*.toml` for the complete list of agents — the repo itself,
not the catalog, is the covered set (`.agents/rules/skill-authoring.md` §5:
gates derive their covered set, they do not enumerate it). Compare both globs
against the catalog's `skills:`/`agents:` entries and report any skill or agent
missing from the catalog by name, so an uncatalogued one cannot drop out silently.

### Step 3 — Build Skill Coverage Table

For each skill:
- Check if a spec file exists (use the `spec:` path from catalog, or glob `studio-tests/skills/*/[name].md`)
- Look up `last_static`, `last_static_result`, `last_spec`, `last_spec_result`,
  `last_category` and `last_category_result` from the ignored runtime overlay; absent history is unknown / not recorded. Read `category` from the catalog.
- Priority comes from catalog `priority:` field (critical/high/medium/low)

### Step 3b — Build Agent Coverage Table

For each agent in catalog's `agents:` section:
- Check if a spec file exists (use the `spec:` path from catalog, or glob `studio-tests/agents/*/[name].md`)
- Look up `last_spec`, `last_spec_result`, `last_category`,
  last_category_result from the runtime overlay and category from the catalog

### Step 4 — Output Report

```
=== Skill Test Coverage Audit ===
Date: [date]

SKILLS (74 total)
Specs written: 73 (99%) | Never static tested: 74 | Never category tested: 74

Skill                  | Cat      | Has Spec | Last Static | S.Result | Last Cat | C.Result | Priority
-----------------------|----------|----------|-------------|----------|----------|----------|----------
gate-check             | gate     | YES      | never       | —        | never    | —        | critical
design-review          | review   | YES      | never       | —        | never    | —        | critical
...

AGENTS (49 total)
Agent specs written: 49 (100%)

Agent                  | Category   | Has Spec | Last Spec   | Result | Last Cat | C.Result
-----------------------|------------|----------|-------------|--------|----------|----------
creative-director      | director   | YES      | never       | —      | never    | —
technical-director     | director   | YES      | never       | —      | never    | —
...

Top 5 Priority Gaps (skills with no spec, critical/high priority):
(none if all specs are written)

Skill coverage:  73/74 specs (99%)
Agent coverage:  49/49 specs (100%)
```

No file writes in audit mode.

Offer: "Would you like to run `$skill-test static all` to check structural
compliance across all skills? `$skill-test category all` to run category rubric
checks? Or `$skill-test spec [name]` to run a specific behavioral test?"

---

## Phase 3: Recommended Next Steps

After any mode completes, offer contextual follow-up:

- After `static [name]`: "Run `$skill-test spec [name]` to validate behavioral
  correctness if a test spec exists."
- After `static all` with failures: "Address NON-COMPLIANT skills first. Run
  `$skill-test static [name]` individually for detailed remediation guidance."
- After spec PASS: "Record this pass date in the ignored runtime overlay if authorized. Consider running `$skill-test audit` to find the next spec gap."
- After `spec [name]` FAIL: "Review the failing assertions and update the skill
  or agent, or the test spec, to resolve the mismatch."
- After `audit`: "Start with the critical-priority gaps. Use the spec template
  at `studio-tests/templates/skill-test-spec.md` (agents:
  `agent-test-spec.md`) to create new specs."
