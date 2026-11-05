# Codex Game Studios workflow guide

This guide takes a game from concept to release using the studio's skills,
role guidance, design records, and evidence. Start with the project's actual
state and effective settings; an existing game can enter at any stage.

## Start here

Open the repository in Codex and use `$start`, or select **start** in the
available skill UI. Skills live in `.agents/skills/<name>/SKILL.md`. In this
guide, `$name` means invoke that skill with the described context, not run a
shell command. If the host has not discovered it, open the named skill and
follow its instructions explicitly; disclose that fallback.

Use `$help` when the next step is unclear. For existing work, use
`$project-stage-detect` to locate it in the pipeline and `$adopt` to audit
whether its artifacts actually satisfy the workflow. File presence is only
an observation, not proof that a design or implementation works.

See [onboarding](codex/onboarding.md) for prerequisites and
[testing](codex/testing.md) for verification. Node runs the Codex adapters;
applicable helper backends also require Bash and Python 3. A dependency failure
must remain visible. A normal clone needs no upstream checkout or source archive.

## Settings and authority

`project.yaml` is the shared configuration. Resolve allowed
`project.local.yaml` overrides, shared settings, legacy mirrors, rigor
expansion, and documented defaults in that order. Invalid enum values fall
through with a diagnostic. Read [configuration guidance](../.agents/docs/config-resolution.md)
for the specific keys needed by the task.

`modes.rigor` defaults to `minimal` and supplies workflow, review depth,
QA level, document density, team size, and story granularity unless explicitly
overridden. Do not populate those six knobs merely to repeat rigor defaults:
doing so would prevent a later rigor change from controlling them.
Use `$settings` to inspect the effective values and their provenance.

Workflow controls required artifacts; automation controls how unresolved
choices are handled; review mode controls review depth. These are distinct.
Per-system workflow overrides use the GDD filename stem. Read
[workflow modes](../.agents/docs/workflow-modes.md) and
[automation modes](../.agents/docs/automation-modes.md) when needed.
Modes cannot grant permissions or cancel prior user authorization.

Before an unresolved creative, technical, scope, or approval decision, prepare
a concrete draft with trade-offs and ask the user. Use an available question
facility or ask in plain text and wait. An unanswered required question is not
consent. Continue work already authorized within scope; do not ask again for
each routine file write. See the [collaborative principle](COLLABORATIVE-DESIGN-PRINCIPLE.md).

## The default path: minimal

The minimal workflow uses `design/game-brief.md` as its design record.
The brief states the pitch, MVP features, and build order; it replaces separate
concept, art bible, systems index, and GDD requirements at this tier.

1. `$setup-engine`: choose and pin the engine/version, language, platforms,
   naming, performance budgets, and applicable specialists in project settings.
2. `$brainstorm`: agree the one-page brief and the smallest playable loop.
3. `$create-stories`: turn the brief's build order into implementable stories
   under `production/epics/<slug>/story-*.md`.
4. `$dev-story` with a story path, then `$story-done`: build and verify one
   story at a time, and repeat in build order.

Separate epic planning and sprint planning are not required on this route.
The catalog's minimal route does not use phase gates to move the stage marker;
do not mistake a retained Concept marker for absence of implemented work.
Play the build, record what happened, and create the next stories from that
evidence. The other skills remain available when useful. Raising rigor changes
requirements; inspect gaps before assuming earlier artifacts meet the new tier.

## Phase 1: Concept

For standard/full workflows, establish the game's pillars, target players,
core verbs, scope, and intended experience before expanding its systems.

- `$brainstorm` develops the concept in `design/gdd/game-concept.md`.
  `$design-review` can challenge the concept before further investment.
- `$setup-engine` pins actual engine/version choices. Consult the selected
  `docs/engine-reference/<engine>/VERSION.md` before engine work.
- `$prototype` tests the risky core mechanic in a throwaway build before
  committing to detailed design. Record PROCEED, PIVOT, KILL, or NOT ASSESSED;
  a build that nobody played cannot establish fun.
- `$art-bible` defines visual identity in `design/art/art-bible.md` before
  asset production and `$map-systems`. The systems map records dependencies
  and the order in which systems should be designed.

Use `$gate-check` for the Systems Design transition when the effective
workflow calls for phase review. Its report should identify missing evidence
and unresolved decisions, not silently advance the project.

## Phase 2: Systems Design

Work in dependency order from the systems index. Use `$design-system` for
one system at a time and `$design-review` before handing it to programmers.
The effective workflow determines required sections. Precise rules, numeric
formulas where needed, edge cases, dependencies, and testable acceptance
criteria should allow an implementer to act without inventing behavior.

Use `$quick-design` for a bounded change that fits in a story.
Use `$consistency-check` to compare documents against the entity registry,
and `$review-all-gdds` for cross-system contradictions, dominant strategies,
economy interactions, cognitive load, and pillar alignment.

For narrative-heavy work, `$team-narrative` coordinates story, lore, and
environmental needs. Preserve the agreed mechanics and domain ownership while
resolving conflicts. Review the Technical Setup transition with `$gate-check`.

## Phase 3: Technical Setup

Use `$create-architecture` to describe modules, data flow, interfaces, engine
constraints, and performance strategy before production implementation.
Record important alternatives and consequences with `$architecture-decision`.
An ADR's existence does not make it Accepted.

`$architecture-review` maps design requirements to decisions and checks
cross-ADR conflicts. `$create-control-manifest` turns Accepted decisions into
short must-do/never-do programmer rules. Update the manifest after relevant ADR
changes rather than leaving stale instructions in stories.

Establish accessibility requirements through `$ux-design`, then scaffold the
appropriate test framework and CI with `$test-setup`; `$test-helpers` adds
engine-specific factories or assertions when needed. Resolve the engine from
project state and consult coding standards and coordination guidance before
implementation. Review the Pre-Production transition with `$gate-check`.

## Phase 4: Pre-Production

Use `$ux-design` and `$ux-review` for the key screens and player flows:
typically the main menu, HUD, and pause menu, with input and accessibility
requirements included.

Build an end-to-end `$vertical-slice` using representative architecture and
a complete start → challenge → resolution loop. The concept prototype tests
whether an idea is promising; the slice tests whether the production pipeline
can deliver it. Play it unguided and record a `$playtest-report`. A skipped
slice, an unplayed slice, and a broken slice require different findings.

Plan Foundation before Core dependencies with `$create-epics`; use
`$create-stories` for each epic. Stories should reference requirements and
Accepted ADRs, state acceptance criteria, identify dependencies, and name any
engine-specific constraints. A Proposed ADR is an unresolved dependency.

Use `$story-readiness` before pickup, `$estimate` for effort and uncertainty,
and `$sprint-plan` for the first sprint's goal, capacity, and priority.
Review the Production transition with `$gate-check`. Apply the actual tier's
requirements; the vertical slice is recommended rather than a universal
blocking prerequisite.

## Phase 5: Production

For each story:

1. Confirm readiness, dependencies, destination ownership, and acceptance
   criteria; resolve missing decisions before implementation.
2. Use `$dev-story` with the story path. Choose the programmer guidance that
   matches the current engine and system. Follow Accepted ADRs and the control
   manifest; keep changes within the assignment.
3. Run meaningful checks appropriate to the change. `$code-review`,
   `$qa-plan`, `$smoke-check`, and `$test-evidence-review` support review,
   testing scope, the smoke gate, and evidence quality.
4. Use `$story-done` to compare results with acceptance criteria and record
   honest completion status. Missing runtime or visual evidence stays explicit.

`$sprint-status` reports progress; `$content-audit` compares planned and built
content; `$scope-check` catches expansion beyond the agreed plan.
`$bug-report` records reproducible failures and `$bug-triage` prioritizes them.
At sprint end use `$retrospective`, then `$sprint-plan`; at milestones use
`$milestone-review` to assess quality, risk, and remaining work.

When a GDD changes, use `$propagate-design-change` to resolve stale ADRs, then
refresh affected manifests, stories, and tests. Use `$reverse-document` for
implementation whose design records are missing.

Team skills cover combat, UI, audio, levels, narrative, QA, and live operations.
They define a workflow and domain responsibilities; they do not create native
parallel execution by themselves. See coordination below.

## Phase 6: Polish

Polish is evidence-driven. Compare measured results with the project's actual
budgets and target hardware.

| Need | Skills and evidence |
|---|---|
| Performance | `$perf-profile`: measured frame time, memory, bottlenecks, ranked fixes |
| Balance | `$balance-check`: curves, outliers, economy sinks/faucets, degenerate strategies |
| Assets | `$asset-audit`: naming, size, formats, missing references, orphans |
| Player experience | `$playtest-report`: observed behavior, severity, reproducible feedback |
| Maintainability | `$tech-debt`: prioritized debt and its production impact |
| Coordinated polish | `$team-polish`: performance, visuals, audio, regression checks |
| Localization | `$localize`: extraction, string freeze, locale/RTL/VO requirements |
| Security | `$security-audit`: save tampering, cheats, inputs, network and privacy risks |
| Test coverage | `$regression-suite`, `$soak-test`, `$test-flakiness` |

Use multiple documented playtest sessions to distinguish a recurring problem
from a single observation; consult the effective gate criteria for required
counts. Localization QA must check layout and interaction in the target
locales, and accessibility needs verification in the actual build.

Use `$release-checklist` for build, certification, and store readiness.
Prepare `$changelog` and player-facing `$patch-notes` from completed changes.
Review the Release transition with `$gate-check` and retain unresolved risks.

## Phase 7: Release and live operations

`$launch-checklist` checks launch readiness; `$team-release` coordinates the
release candidate, QA sign-off, build pipeline, and production responsibilities.
Prepare a reviewable candidate and its evidence before any unresolved release
approval. Publishing, deploying, messaging others, and pushing require the
applicable existing authorization; a favorable checklist grants none.

After launch, use `$day-one-patch` or `$hotfix` for urgent repair,
`$bug-triage` for incoming reports, and `$team-live-ops` for a planned event
or season. Validate the affected critical paths, prepare patch notes, and
record remaining risks before the authorized release action.

## Gates and evidence

The phase sequence and artifact expectations are in
[the workflow catalog](../.agents/docs/workflow-catalog.yaml). Gates report
PASS, CONCERNS, NOT ASSESSED, or FAIL. Their findings guide the user's transition
decision; they are not host permission enforcement. Do not turn absent checks
into PASS or a manually accepted risk into a successful test.

The following summarizes the full baseline and important reductions. Open only
the relevant target gate during a skill run; its detailed checklist controls.

| Transition and detailed checklist | Full baseline and reductions |
|---|---|
| [Concept → Systems Design](../.agents/skills/gate-check/references/gate-systems-design.md) | Concept, pillars, visual identity anchor; standard recommends the latter two. A concept prototype is recommended. |
| [Systems Design → Technical Setup](../.agents/skills/gate-check/references/gate-technical-setup.md) | Systems index, all MVP GDDs, cross-GDD review. Standard uses five required GDD sections plus conditional Formulas; cross-GDD review is recommended. Minimal skips this design gate. |
| [Technical Setup → Pre-Production](../.agents/skills/gate-check/references/gate-pre-production.md) | Pinned engine, populated configuration, art bible sections 1–4+, three Foundation ADRs, architecture/traceability, test framework and CI, accessibility and started UX. Standard requires critical ADRs and an art bible when visual-asset stories exist; UX/accessibility/traceability are recommended. Minimal requires engine configuration. |
| [Pre-Production → Production](../.agents/skills/gate-check/references/gate-production.md) | Sprint plan, MVP design, Accepted Foundation/Core ADRs, complete nine-section art bible with sign-off, epics, UX and control manifest. Standard retains epics/sprint plan and recommends complete art bible, UX, and manifest. Minimal uses the filled brief's build order and stories. |
| [Production → Polish](../.agents/skills/gate-check/references/gate-polish.md) | Core mechanics, tests, full smoke run, QA sign-off, three distinct playtests, end-to-end play and no S1 Critical bugs. Standard requires one documented playtest and recommends sign-off/per-story coverage. Minimal retains smoke, end-to-end play, and no S1 Critical bugs. |
| [Polish → Release](../.agents/skills/gate-check/references/gate-release.md) | Features/content complete, localization, QA sign-off, clean full smoke, no open S1–S3 bugs, performance and security evidence. Standard retains features, smoke, and no S1 Critical bugs while recommending content audit, localization, sign-off, and resolution of S2/S3 bugs. Minimal retains smoke and no S1 Critical bugs. |

The Production gate's vertical slice remains recommended at standard and full:
skipped → CONCERNS; built but unplayed → NOT ASSESSED; built and failing a
validation item → FAIL. At minimal, the current build's fun and end-to-end
play replace the slice checks. A negative result is FAIL; nobody having played
it is NOT ASSESSED. Reductions relax required artifacts, never failed behavior.

Use `$gate-check` with target slug `systems-design`, `technical-setup`,
`pre-production`, `production`, `polish`, or `release`. An optional
`--review full|lean|solo` changes review depth for that run. With no target,
confirm the detected transition before running it. A gate is a deliberate
checkpoint, exempt from automation shortcuts. Record an authorized transition
in both `project.yaml` (`project.stage`) and `production/stage.txt`; passing
checks or accepted CONCERNS do not authorize an otherwise unresolved write.

Review depth follows effective settings. Solo skips director panels; lean
retains phase-gate review. Workflow determines panel breadth, and team size
determines specialist depth, not the number of directors. When independent
review is required but unavailable, disclose it and leave that review
unassessed. An in-session review can help but is not independent assessment.

QA level controls test enforcement separately from artifact requirements:
minimal waives game test gates but retains build, launch, and critical-path
smoke evidence; standard requires Logic and Integration tests; full adds
coverage and regression checks. UI screenshots and Visual/Feel screenshots
plus lead sign-off are not waived by QA level. A quick smoke run that skipped
coverage does not satisfy the full smoke requirement. A build nobody launched
remains NOT ASSESSED.

Review reports must cover the claim being made: a narrow architecture or
security scan cannot clear unscanned categories, and a focus-only cross-GDD
review cannot establish both review passes. At the full Release baseline,
resolve CRITICAL/HIGH security findings against a full-scope audit and later
applicable updates. Each shipped translated locale needs localization QA;
FAIL blocks that locale, missing/unplayed QA stays NOT ASSESSED, and a
source-locale-only release records that localization check as N/A.

## Coordination and execution limits

Native role definitions live in `.codex/agents/<name>.toml`. Use only the role
material relevant to the assignment. The model policy in
`.codex/model-policy.json` requires actual host/account capabilities; it is
not a promise that a model or override is available.

Delegate only when authorized and supported by the active host. Give each
worker a bounded domain, explicit paths, dependencies, artifact contract, and
expected validation. Tell workers that others are editing the same repository;
they must preserve unrelated changes. Review returned content, not just file
presence. If delegation is unavailable, disclose an in-session role-guidance
fallback. Do not assume a particular agent tool, depth, isolation, or hierarchy.

Before file changes, select matching path policies with:

```powershell
node scripts/codex/rules.mjs --path docs/example.md --content
```

Follow [the explicit hook procedure](codex/hooks.md): check the exact proposed
action with PreToolUse, proceed only on exit 0 and existing authorization,
then validate written paths with PostToolUse. Native activation is PENDING
until separately verified in the installed client. There are no automatic
imports, rule injection, shell preprocessing, lifecycle events, or safety
guarantees merely because helper files exist.

For recovery, read `production/session-state/active.md` first if present.
Checkpoint, delegated-return, and notification fallbacks are explicit CLI
actions described in the hook guide; helper observations never certify
completion. Keep runtime reports in ignored/temporary storage or CI artifacts.

## Common routes

| Situation | Start with |
|---|---|
| No idea yet | `$start` → `$brainstorm` → `$setup-engine` |
| Designs exist, ready to code | `$project-stage-detect` → resolve architecture/UX gaps → stories |
| Complex feature mid-production | `$quick-design` or `$design-system` → change propagation → stories |
| Something broke | `$bug-report` → reproduce → bounded fix → relevant regression |
| Existing game | `$project-stage-detect` → `$adopt` → resolve highest-risk gaps |
| New sprint | `$retrospective` → `$sprint-plan` → `$story-readiness` |
| Ready to ship | `$release-checklist` → `$launch-checklist` → `$team-release` |
| Unsure what matters next | `$help` with current goal and known blockers |

See [skill flow diagrams](skill-flow-diagrams.md) for the artifact handoffs.
