# Skill Test Spec: $skill-test

## Skill Summary

`$skill-test` validates skills (`.agents/skills/*/SKILL.md`) and agents
(`.codex/agents/*.toml`). It has four modes:

- **static** `[name | all]`: runs 7 structural checks on a skill (frontmatter,
  phases, verdict vocabulary, authorization, handoff,
  branch/delegation complexity and invocation behavior) and reports each as PASS / WARN / FAIL. A skill split
  into `references/` files is read whole (`SKILL.md` and every references file) for
  checks 2-6; identity checks read `SKILL.md` and invocation policy reads `agents/openai.yaml` when present. Per-skill
  results are COMPLIANT, WARNINGS, NON-COMPLIANT or NOT ASSESSED. It also runs
  `.agents/scripts/agent-check.sh` and reports its agent and delegation lines as
  observations that never change a verdict, and runs
  `.agents/scripts/compat-inventory.sh` and reports each place the file depends on
  something only a particular client provides, by feature, the same way; given an agent
  name, it reports only those observations, with no verdict. Writes nothing.
- **spec** `[skill-or-agent-name]`: resolves the name through
  `studio-tests/catalog.yaml`, reads the file and the spec at the
  entry's `spec:` path, plus applicable `AGENTS.md`, explicitly referenced guidance and selected path rules,
  and marks each assertion — the spec's Static Assertions included, for a skill
  as for an agent — PASS / PARTIAL / FAIL / NOT ASSESSED. Case and Overall
  Verdicts are the worst result beneath them (FAIL, PARTIAL, NOT ASSESSED,
  PASS). It then asks "May I write these results to
  `production/session-logs/studio-tests/…` and update the ignored runtime `production/session-logs/studio-tests/catalog-results.yaml` overlay?"
- **category** `[name | all]`: scores the skill or agent against its section of
  `studio-tests/quality-rubric.md` (PASS / FAIL / WARN per
  metric) and asks "May I update the ignored runtime results overlay …?" before recording it.
- **audit** (also the no-argument default): coverage table of every skill and
  every catalogued agent. Writes nothing and issues no verdict.

No director gates apply.

---

## Static Assertions (Structural)

Checked against the SKILL.md by `$skill-test spec` — no fixture needed.

- [ ] Skill frontmatter has nonempty `name` and `description`; optional invocation policy is checked in `agents/openai.yaml` when present, without assuming source-only fields
- [ ] Has ≥2 phase headings
- [ ] Contains verdicts: COMPLIANT, WARNINGS, NON-COMPLIANT, NOT ASSESSED (static mode); PASS, PARTIAL, FAIL, NOT ASSESSED (spec mode)
- [ ] Checks current authorization before recording results/catalog updates, asking only when unresolved
- [ ] Has a next-step handoff (Phase 3: contextual follow-up after each mode)

---

## Director Gate Checks

None. `$skill-test` is a meta-utility skill. No director gates apply.

---

## Fixture Defaults

Every case's `project.yaml` sets `modes.rigor: minimal` and
`modes.automation: collaborative`, with no `project.local.yaml`, unless its own
Fixture says otherwise. Rules: `studio-tests/AGENTS.md` §
Fixture defaults.

---

## Test Cases

### Case 1: Static Mode — Well-formed skill, all 7 checks pass, COMPLIANT

**Fixture:**
- `.agents/skills/brainstorm/SKILL.md` exists and satisfies all 7 checks:
  - Has required `name` and `description` identity fields
  - Has ≥2 phase headings
  - Has verdict keywords
  - Has contextual authorization boundaries
  - Ends with a next-step handoff
  - Uses justified native delegation/fallback
  - Invocation behavior matches documented arguments and optional policy

**Input:** `$skill-test static brainstorm`

**Expected behavior:**
1. Skill reads `.agents/skills/brainstorm/SKILL.md` fully
2. Skill runs all 7 structural checks
3. Output is the single-skill block `=== Skill Static Check: $brainstorm ===`
   listing Check 1 – Check 7, each PASS
4. Verdict is COMPLIANT
5. Phase 3 follow-up suggests `$skill-test spec brainstorm`

**Assertions:**
- [ ] Exactly 7 structural checks are reported
- [ ] All 7 are marked PASS
- [ ] Verdict is COMPLIANT
- [ ] No files are written and no "May I write" is asked

---

### Case 2: Static mode — writing instructions omit authorization boundaries

**Fixture:** A sandbox Skill instructs writes and external publication outside unresolved authorization. No permission boundary covers its writing; the other six checks are valid.

**Input:** `$skill-test static some-skill`

**Expected behavior:** Read the Skill/references. Check 4 FAILS on the actual unauthorized-writing instruction. Report all other checks and NON-COMPLIANT with a concrete fix.

**Assertions:**
- [ ] Check 4 is FAIL and cites the writing instruction.
- [ ] Unsupported tool metadata does not grant permission or determine the verdict.
- [ ] All other checks are reported; overall is NON-COMPLIANT.
- [ ] A second fixture with prior authorization proceeds within scope without requesting identical permission again.

---

### Case 3: Spec Mode — gate-check Skill Evaluated Against Its Spec

**Fixture:**
- `catalog.yaml` lists `gate-check` under `skills:` with
  `spec: studio-tests/skills/gate/gate-check.md`
- The sandbox's copy of that spec is the live one (the declared test cases and a Static
  Assertions list) with one Static Assertion added: "Balance values link to
  their source formula or rationale" — met only by
  `.agents/docs/coding-standards.md` (explicitly referenced by `AGENTS.md`), not by the skill
  or its gate files themselves. The live spec has no such line, so the copy is
  edited for the case
- `.agents/skills/gate-check/` holds `SKILL.md` and 12 `references/` files
  (6 phase files, 6 gate files)
- The user declines the results write

**Input:** `$skill-test spec gate-check`

**Expected behavior:**
1. Skill resolves `gate-check` as a skill via the catalog and takes the spec
   path from its `spec:` field
2. Skill reads the skill — `SKILL.md` and all 12 `references/` files — the
   spec, applicable `AGENTS.md` and explicitly referenced guidance
3. The spec's Static Assertions are checked against `SKILL.md` and its
   `references/` files in a
   `Static Assertions:` block before Case 1
4. Each assertion is marked PASS / PARTIAL / FAIL / NOT ASSESSED, with a Reason
   for each non-PASS; the balance-values assertion is PASS, citing
   `coding-standards.md`
5. Each case gets a Case Verdict; the report ends with an Overall Verdict, the
   worst result across the static assertions, the cases and Protocol Compliance
6. Skill asks "May I write these results to
   `production/session-logs/studio-tests/skill-test-spec-gate-check-[date].md`
   and update the ignored runtime results overlay?"; on decline nothing is written

**Assertions:**
- [ ] The spec path comes from the catalog `spec:` field
- [ ] The spec's Static Assertions are evaluated against `SKILL.md` and its `references/` files, not skipped as "static mode's job"
- [ ] An assertion met only in a `references/` file is PASS, not FAIL for being absent from `SKILL.md`
- [ ] Every declared test case is evaluated, each with its own Case Verdict
- [ ] The balance-values assertion is PASS, and the report cites `coding-standards.md` as the file it came from
- [ ] Overall verdict is the worst result — FAIL, PARTIAL, NOT ASSESSED or PASS; an assertion-level NOT ASSESSED keeps it from PASS
- [ ] No file is written without approval (declined here, so nothing is written)

---

### Case 4: Audit Mode — Coverage Table of All Skills and Agents

**Fixture:**
- `.agents/skills/` contains 74 skill directories; 73 have a spec at the path
  their catalog entry names (in the sandbox, one skill's catalog `spec:` is
  emptied and its spec file removed — every live skill has a spec)
- `catalog.yaml` has an `agents:` section with 49 entries, all with specs

**Input:** `$skill-test audit` (and, separately, `$skill-test` with no argument)

**Expected behavior:**
1. Both inputs run audit mode — no argument is the audit default, not a usage
   message
2. Skill globs `.agents/skills/*/SKILL.md` for skills and reads the catalog's
   `agents:` section for agents
3. For each skill: Has Spec (from the catalog `spec:` path, or a glob under
   `studio-tests/skills/`), last static/category dates and
   results, category, priority
4. Separate SKILLS and AGENTS tables, a Top 5 Priority Gaps list, and the lines
   `Skill coverage: 73/74 specs (99%)` and `Agent coverage: 49/49 specs (100%)`
5. No verdict line; the output ends with the offer to run `static all`,
   `category all` or `spec [name]`

**Assertions:**
- [ ] `$skill-test` with no argument produces this audit, not usage text
- [ ] All skill directories are enumerated (not just a sample)
- [ ] "Has Spec" column is accurate for each entry
- [ ] Summary coverage counts are correct for skills and for agents
- [ ] No files are written and no verdict is issued in audit mode

---

### Case 5: Category Mode — Gate Skill Evaluated Against Quality Rubric

**Fixture:**
- `studio-tests/quality-rubric.md` has a `### gate` section with
  metrics G1–G5
- `catalog.yaml` gives `gate-check` `category: gate`
- `.agents/skills/gate-check/SKILL.md` meets every metric except G2 — Director
  panel width (only CD-PHASE-GATE is spawned at `workflow: full`)
- The user approves the ignored runtime results overlay update

**Input:** `$skill-test category gate-check`

**Expected behavior:**
1. Skill reads the `category:` from the catalog, then the `### gate` section of the rubric
2. Skill reads the skill and the `AGENTS.md` context, and evaluates G1–G5
3. Each metric is marked PASS, FAIL or WARN; G2 is FAIL with a quoted Gap line
4. Report ends `Verdict: FAIL (1 failure, 0 warnings)` and a Fix line
5. Skill asks "May I update `production/session-logs/studio-tests/catalog-results.yaml` to record
   this category check (`last_category`, `last_category_result`) for gate-check?"

**Assertions:**
- [ ] All gate metrics (G1–G5) from quality-rubric.md are evaluated
- [ ] Each metric has an individual PASS / FAIL / WARN result, with a Gap line for G2
- [ ] Overall verdict reflects the metric results
- [ ] The ignored runtime results overlay is updated only after the "May I update" approval

---

### Case 6: Spec mode — native role resolves to TOML instructions

**Fixture:**
- Catalog lists `creative-director` under agents with its written spec.
- Role TOML has `name = "creative-director"`, description and developer instructions; no matching Skill exists.
- A static assertion requires the exact name. Run B changes it to `creative-director-other`.
- A redirect asks this role to choose the engine; its domain limit and coordination guidance assign that decision to technical-director.

**Input:** `$skill-test spec creative-director`

**Expected behavior:** Resolve the catalog agent entry. Read TOML instructions and written spec. Exact name comparison passes Run A and fails Run B. Assess redirect from both role and coordination context. Record actual host/model if behavior runs; document review alone never establishes independent role loading.

**Assertions:**
- [ ] Role resolves, instead of reporting a missing Skill.
- [ ] Exact name comparison rejects near matches.
- [ ] Capability ceiling/domain boundaries are instructions, never tool grants.
- [ ] No source model alias or Skill model switch is required.
- [ ] Required execution that cannot run is PENDING/NOT ASSESSED, never invented PASS.
- [ ] Results writes honor prior authorization; unresolved permission receives reviewable work before asking.

---

### Case 7: Static All — an unreadable skill is NOT ASSESSED and counted

**Fixture:**
- `.agents/skills/` holds 74 skill directories; one `SKILL.md` cannot be
  read (the Read call fails — permission denied), so none of its checks can
  start. (A file that is read but whose frontmatter does not parse is a
  different case: Check 1 fails and it is NON-COMPLIANT.)

**Input:** `$skill-test static all`

**Expected behavior:**
1. The 73 readable skills are checked and listed with their Result
2. The unreadable skill appears in the table as `NOT ASSESSED`, with the
   reason — not omitted, not COMPLIANT
3. The header states the denominator, `73 of 74 skills checked`, and the
   Summary line counts the NOT ASSESSED skill

**Assertions:**
- [ ] The unreadable skill's Result is NOT ASSESSED, with a reason
- [ ] The header or summary reads `73 of 74 skills checked`
- [ ] The Summary counts sum to the skills in the table

---

### Case 8: Spec Mode — an unevaluable assertion makes the run NOT ASSESSED

**Fixture:**
- `.agents/skills/brainstorm/SKILL.md` and its spec exist
- Every assertion in the spec passes except one, which names a fixture file
  the spec never defines
- The user approves the results write

**Input:** `$skill-test spec brainstorm`

**Expected behavior:**
1. That assertion is NOT ASSESSED, with a Reason — never resolved to PASS
   because the skill "probably" handles it
2. Its Case Verdict is NOT ASSESSED; with no PARTIAL or FAIL anywhere, the
   Overall Verdict is NOT ASSESSED
3. On approval, the ignored runtime results overlay records `last_spec_result: NOT ASSESSED`

**Assertions:**
- [ ] The unevaluable assertion is NOT ASSESSED, not PASS
- [ ] Overall Verdict is NOT ASSESSED, not PASS
- [ ] The ignored runtime results overlay records `NOT ASSESSED` as the result

---

### Case 9: Category Mode — no rubric section for the category

**Fixture:**
- `catalog.yaml` gives `some-skill` `category: tooling` — a category added to
  the catalog before its rubric section was written
- `studio-tests/quality-rubric.md` has no `tooling` section

**Input:** `$skill-test category some-skill`

**Expected behavior:**
1. Skill reads the category, then looks for its rubric section and finds none
2. The result is NOT ASSESSED, naming the missing `tooling` section
3. No other category's metrics are borrowed to fill the gap — not even
   `utility`'s

**Assertions:**
- [ ] The result is NOT ASSESSED and names the missing rubric section
- [ ] No metric from another category is evaluated in its place

---

### Case 10: Static Mode — a split skill is read whole, but its frontmatter comes from SKILL.md

**Fixture:**
- `.agents/skills/split-skill/SKILL.md` has required `name` and `description` frontmatter and a justified
  native delegation/fallback policy, and two phase headings (`## Phase 1: Gather`, `## Phase 2: Report`)
  that each say "Read `references/N-name.md` now and follow it". It holds no verdict
  keyword, no contextual authorization boundary and no next-step handoff itself
- `.agents/skills/split-skill/references/2-report.md` holds `Verdict: **COMPLETE**`,
  the line "May I write this report to `production/qa/report.md`?" and a closing
  "Next step: `$gate-check`"; `references/1-gather.md` holds only instructions
- Run A: as above. Run B: the same skill, except `description:` is missing from
  `SKILL.md` and appears only in a metadata-like example block at the top of
  `references/1-gather.md`

**Input:** `$skill-test static split-skill`

**Expected behavior:**
1. Skill reads `SKILL.md` and every file in `references/` and runs the 7 checks on
   them as one skill
2. Run A: Checks 2, 3, 4 and 5 read the whole skill, so they PASS on the verdict
   keyword, the "May I write" line and the handoff found in `references/2-report.md`;
   Check 3 is not a FAIL for a verdict word absent from `SKILL.md`. Identity and invocation documentation pass; Check 6 is N/A because this fixture requires no separate delegated/isolated phase. Verdict COMPLIANT
3. Run B: Check 1 reads `SKILL.md` only, so the missing `description:` is a FAIL
   although the references file holds one; the verdict is NON-COMPLIANT with a
   `Recommended:` line to add it to the `SKILL.md` frontmatter. Invocation documentation is assessed separately from identity

**Assertions:**
- [ ] Run A: Checks 3, 4 and 5 PASS on text that appears only in `references/`
- [ ] Run A: Check 3 is not a FAIL or WARN for a verdict word absent from `SKILL.md`
- [ ] Run A: the verdict is COMPLIANT and nothing is written
- [ ] Run B: Check 1 is FAIL — a frontmatter field found only in a `references/` file does not count
- [ ] Run B: the verdict is NON-COMPLIANT and the `Recommended:` line names the `SKILL.md` frontmatter

---

### Case 11: Results storage preserves the maintained catalog

**Fixture:** Catalog mapping is readable; one structural or category assessment completes. A prior authorization permits writing its run output in ignored `production/session-logs/studio-tests/`. Save the exact catalog bytes before assessment.

**Expected behavior:** Keep mapping/spec/priority/category data read-only. Store observed runtime history in `catalog-results.yaml` under that ignored directory, or a host temporary directory. Audit joins available runtime history to the catalog mapping; absent history is unknown, not PASS.

**Assertions:**
- [ ] Maintained `studio-tests/catalog.yaml` bytes are unchanged.
- [ ] No tracked result report, raw trace or catalog tracking update is created.
- [ ] Runtime output records assessed scope, observed result and limitations.
- [ ] Structural review is not presented as observed native model behavior.
- [ ] Existing authorization covers the output; no repeated permission is requested.

---

## Protocol Compliance

- [ ] Static mode checks exactly 7 structural assertions
- [ ] Static mode reads a split skill's `SKILL.md` and `references/` files together for checks 2-6, and `SKILL.md` for identity and optional `agents/openai.yaml` for invocation policy
- [ ] Spec mode evaluates each test case from the spec file individually, and a skill spec's Static Assertions against the SKILL.md and its references/ files
- [ ] Each mode can report NOT ASSESSED — per skill in static mode, per assertion and overall in spec mode, and for a missing rubric section in category mode
- [ ] Audit mode covers all skills AND agents (not just one category)
- [ ] Spec and category modes accept an agent name as well as a skill name
- [ ] Category mode reads quality-rubric.md to get criteria (not hardcoded)
- [ ] Static and audit modes write nothing; spec and category modes write within existing authorization, asking for a reviewable decision when unresolved
- [ ] After a spec FAIL, recommends reviewing the failing assertions and updating the skill or agent, or the spec

---

## Coverage Notes

- The skill-test skill is self-referential (it can test itself). The static
  mode case for skill-test's own SKILL.md is not separately fixture-tested to
  avoid infinite recursion in test design.
- The specific 7 structural checks are defined in the skill body; only Check 4
  (authorization) is individually tested here because it has the most
  nuanced logic. The single-skill NOT ASSESSED verdict follows Case 7's
  per-skill rule; not separately tested.
- Audit mode counts are approximate — the exact number of skills and agents will
  change as the system grows; the fixture's numbers are illustrative.
- A spec case that names a director gate ID has the agent evaluated against
  `.agents/docs/director-gates/[gate-id].md`; not separately fixture-tested.
