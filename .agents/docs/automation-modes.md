# Automation modes

Use an exposed question facility when appropriate; otherwise ask in plain text and wait for required answers. Question sites below are not guaranteed widgets. Prior authorization persists. Modes never grant permission or revoke authorization. Prepare reviewable work before asking for an unresolved decision. Optional questions may follow a stated fallback; unanswered required questions never imply consent.



This document defines the standard `modes.automation` pattern for every skill
that uses `user question` or writes files. Skills reference this document
instead of embedding the full mode-handling rules inline — eliminating drift
when the pattern needs updating.

**Scope**: Skills across authoring, review, team orchestration,
implementation, and utility categories. Any skill that gates a decision
through `user question` or writes files should follow this pattern.

**Companion spec**: `.agents/docs/effects-map.md`
section `modes.automation` is the source of truth for behavior. This document
is the implementation pattern.

> **Do not read `effects-map.md` during a skill run** — it is a very large file, a
> reference for authoring the spec rather than a runtime input, and **this
> document is self-sufficient** for deciding what to ask and what to proceed on.
> If a case genuinely is not covered here, read only its `modes.automation`
> section, never the file.

---

## How to Use This Document

In any skill, add a single resolution step at startup and reference the
mode-aware user question pattern below at each gated site.

**Startup prelude** (add near Phase 0 / Phase 1):

```
Resolve automation mode (once, store for the run):
1. Read `modes.automation` from `project.local.yaml` (if present) → use that
2. Else read `modes.automation` from `project.yaml` → use that value
3. Else → default to `collaborative`

Pattern reference: `.agents/docs/automation-modes.md`.
```

The explicitly invoked backend resolves this via `get_effective_yaml_key modes.automation` —
the helper deep-merges project.local.yaml on top of project.yaml.

**At each user question site**, follow the pattern table in §Universal
Rules below. The skill author labels each decision as **major** or **minor**
(per the classification matrix in §Major vs Minor) so the pattern can apply
the right rule.

---

## The Three Modes

| Mode | Speed | Control | What changes |
|------|-------|---------|--------------|
| `collaborative` | Slowest | Full — every decision is the user's | Default. Discuss unresolved choices and obtain any still-required decision. |
| `guided` | Balanced | High — major decisions are the user's, minor ones proceed automatically | AI states recommendation and proceeds for minor decisions. user question reserved for major decisions. |
| `autonomous` | Fastest | Low — AI decides, logs, and proceeds | No user question (except `automation_always_ask` categories). All decisions logged. |

**Default**: `collaborative`. New projects start here.

**Set by**: `$start`, `$settings`.

---

## Universal Rules per Mode

### Collaborative

- `user question` used for unresolved multi-option decisions
- 2–4 options presented with pros/cons for every design choice
- Prepare a reviewable draft and obtain authorization for writes that still require it
- Do not repeat confirmation for a write the user already authorized
- Section-by-section discussion for unresolved content choices; authorized writing proceeds
- Multi-file work stays within authorized scope; ask for unresolved scope changes

### Guided

- `user question` called for **major decisions only** (see classification below)
- Minor decisions: AI states recommendation inline and proceeds — e.g.
  > *"Going with a static utility pattern here — it fits the existing architecture. Continuing unless you want to change direction."*
- Updates to existing files: draft shown briefly before writing — proceeds after a short summary, does not wait for explicit "yes"
- New and existing files follow the same authorization boundary; mode is not permission to write
- Still presents options for major decisions but caps at 2 choices with a clear recommendation
- Multi-section authoring: writes each approved section immediately, no per-section confirmation

### Autonomous

- No `user question` calls **except** for categories listed in `modes.automation_always_ask`
- Routine authorized implementation proceeds; unresolved strategic choices need a reviewable draft
- Proceed with authorized writes; ask for unresolved permission or scope
- Picks the recommended option for every decision without presenting alternatives
- All decisions logged via `log_decision` (helper in yaml-helper.sh) to
  `production/session-logs/decision-log.md`
- User reviews decision log post-session to audit choices made

### Every mode: a required question with no answer

A required question that comes back **skipped, dismissed or empty is not an answer**, in
every mode and on every tool: the user closing the question, a headless run that
returns every question as skipped, a reply that picks nothing.

- Do not write a file, change a mode or setting, or pick an option on its behalf.
- Ask again in plain text, say what is waiting on the answer, and wait.
- In `autonomous`, a question the mode did not require can be decided as usual:
  pick the recommended option and log it via `log_decision`. A question in an
  `automation_always_ask` category, or in an exempt skill, is the user's: ask
  again and wait.
- Where nobody can answer (CI, a headless run), stop and report what is waiting
  rather than choosing.

---

## Major vs Minor Decision Classification

Skills label each gated decision as **major** or **minor** before applying
the mode rules.

### Major — always use user question in guided mode

| Decision type | Example |
|---------------|---------|
| Choosing a system name or document path | "What should we call this system?" |
| Mutually exclusive design directions | "Real-time or turn-based?" |
| Any choice that gates downstream work | Engine choice, architecture approach |
| Scope changes | "Cut this feature or slip the deadline?" |
| Any decision that can't be changed without significant rework | Core loop mechanic |

### Minor — AI recommends and proceeds in guided mode

| Decision type | Example |
|---------------|---------|
| Which section to work on next | "Moving to Edge Cases next" |
| Optional section inclusion | "Adding a Visual Notes section — fits the system" |
| Formatting and structure choices | Heading levels, table vs prose |
| Adding detail to an already-decided direction | Sub-options within an approved approach |
| Next-step routing after a phase completes | "Running design-review now" |

---

## `automation_always_ask` Categories

Even in `autonomous` mode, certain decision categories ALWAYS trigger
`user question`. The configured list lives at
`modes.automation_always_ask` in `project.yaml`.

**Default** (when unset): `[scope_changes, file_deletions, schema_changes]`.

### Recognized categories

**This table is the set you may configure, NOT the set that always asks.** Only
the categories actually listed in `modes.automation_always_ask` — the three
defaults above, unless the project overrides them — interrupt an `autonomous`
run. The other rows do nothing until a project opts into them. Read the resolved
list with `resolve_config` rather than assuming a row here is active. Treating a
category the project never configured, such as `architecture_decisions`, as
active reports rule violations the project never asked for.

| Category | Examples of decisions in this category |
|----------|----------------------------------------|
| `scope_changes` | Cutting a feature, slipping a deadline, splitting/merging an epic, removing acceptance criteria |
| `file_deletions` | Removing a story, deleting a GDD, removing a system, removing a test file |
| `schema_changes` | Changes to project.yaml, story template, control manifest, ADR template, GDD template |
| `architecture_decisions` | New ADR creation, ADR replacement, system boundary changes |
| `version_bumps` | Engine version change, framework version bump, dependency major version change |
| `external_calls` | Invoking external APIs (asset gen, AI services) when in autonomous mode |

### Helper

```bash
is_always_ask_category <category>
```

Returns 0 if the named category is in `modes.automation_always_ask`,
1 otherwise. Skills use this at decision points that fall into any
of the six categories above.

---

## Exemptions — Skills That Ignore the Automation Setting

These skills always behave as `collaborative` regardless of the setting:

| Skill | Why always collaborative |
|-------|--------------------------|
| `hotfix` | Emergency decisions — user must approve scope and risk before any action |
| `gate-check` | Results must be reviewed — a gate verdict without acknowledgement defeats the purpose |
| `day-one-patch` | Release-critical — every action needs explicit sign-off |
| `setup-engine` | One-time irreversible choice that affects the entire project |

These Skills keep explicit decision gates while honoring prior authorization; never request the same permission again.

---

## Decision Log Format (Autonomous Mode)

When `autonomous` mode skips an `user question`, the skill calls
`log_decision` to write a structured entry. Format per entry:

```markdown
## [timestamp] — [skill-name]

**Decision point:** [what was being decided]
**Options considered:** [list of options that would have been presented]
**Chosen:** [what was picked]
**Reason:** [one-line rationale]
**Category:** [scope_changes | file_deletions | schema_changes | … or "minor"]
```

Written to `production/session-logs/decision-log.md` (append-only, never
truncated, created if absent). The user reviews the log post-session to
audit choices made.

### Helper

```bash
log_decision "<skill-name>" "<decision-point>" "<options>" "<chosen>" "<reason>" "<category>"
```

Wraps the format above. Skills call this at every decision point in
autonomous mode, including ones where the chosen value differs from
the recommended default (so the audit trail is complete).

### What to log, and at what granularity

These rules keep autonomous logs consistent across runs:

- **Log every decision that would have shown an `user question` widget** —
  including option/framing choices, not only final approvals. The
  framing/options decisions (which approach, which formula, which edge
  cases) are usually the most informative entries; do not log only the
  rote "approve this section" steps.
- **Collapse a single multi-tab widget into ONE entry.** List each tab's
  choice under **Chosen** rather than emitting one entry per tab.
- **Do NOT log conversational answers the model synthesizes for itself**
  (e.g. internal Q&A while drafting a section) — only log what would have
  been an explicit user decision.
- **Do NOT emit a separate entry for routine "may I write?" file gates** —
  fold the write into the decision it implements (autonomous mode writes
  directly anyway).

### Categorizing data-file writes

The most common categorization mistake is treating a data-file append as a
`schema_changes` decision:

- **Appending facts to a registry or index** — e.g.
  `design/registry/entities.yaml`, `design/gdd/systems-index.md` — is
  **`minor`**. It adds data without altering a *template*.
- **`schema_changes`** means editing the *structure* of `project.yaml` or a
  template (story / ADR / GDD / control-manifest template). These are
  always-ask.
- **When genuinely unsure** between `minor` and an always-ask category,
  prefer the always-ask category and prompt — failing safe.

---

## The Pattern Skills Apply at Each user question Site

```
At each decision point in this skill:

1. Classify the decision: major or minor (see §Major vs Minor above).
2. Check whether the decision falls into an `automation_always_ask`
   category: scope_changes, file_deletions, schema_changes,
   architecture_decisions, version_bumps, external_calls.
3. First honor existing authorization and host permissions. Do not repeat answered decisions. For unresolved decisions apply the mode rule:

   collaborative:           ask unresolved choices; honor prior authorization.
   guided + major:          user question with capped options + recommendation.
   guided + minor:          State recommendation inline, proceed.
   autonomous + always_ask: user question (regardless of mode).
   autonomous + other:      Pick recommended, log via log_decision, proceed.
4. If the question comes back skipped, dismissed or empty, it is not an
   answer: see §Every mode: a question with no answer.
```

This is the contract. Skills that follow this pattern produce
consistent behavior across all three automation modes.
