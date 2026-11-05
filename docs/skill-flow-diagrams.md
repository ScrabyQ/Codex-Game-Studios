# Skill flow diagrams

These maps show useful order and artifact handoffs. Invoke a skill as
`$name` or through the available host skill UI; labels in diagrams are skill
names, not shell commands. Skills live in `.agents/skills/<name>/SKILL.md`.
Read the [workflow guide](WORKFLOW-GUIDE.md) for settings, gates, and execution
limits. The [workflow catalog](../.agents/docs/workflow-catalog.yaml) records
the phase requirements.

## Minimal route

The default rigor expands to a minimal workflow unless overridden. Its brief's
build order replaces separate epic and sprint planning requirements.

```mermaid
flowchart TD
    A[setup-engine] --> B[project.yaml: engine and version]
    B --> C[brainstorm]
    C --> D[design/game-brief.md: MVP and build order]
    D --> E[create-stories]
    E --> F[production/epics/slug/story-*.md]
    F --> G[dev-story: next story]
    G --> H[Relevant checks and player evidence]
    H --> I[story-done: compare acceptance criteria]
    I -->|Next story| G
    I -->|New scope| E
```

No phase transition gate is required on this route; the stage marker may remain
Concept. Other skills are available when useful. File presence alone does not
establish completion.

## Standard/full phase route

```mermaid
flowchart TD
    A[start or project-stage-detect] --> B[Concept: brainstorm and setup-engine]
    B --> C[Prototype risky mechanic; art-bible; map-systems]
    C --> G1[gate-check: Systems Design]
    G1 --> D[design-system per system; design-review]
    D --> E[consistency-check and review-all-gdds]
    E --> G2[gate-check: Technical Setup]
    G2 --> F[create-architecture and architecture-decision]
    F --> H[architecture-review and create-control-manifest]
    H --> J[test-setup and accessibility requirements]
    J --> G3[gate-check: Pre-Production]
    G3 --> K[ux-design and ux-review]
    K --> L[vertical-slice and playtest-report]
    L --> M[create-epics, create-stories, story-readiness]
    M --> N[estimate and sprint-plan]
    N --> G4[gate-check: Production]
    G4 --> O[Implement, review, test, close stories]
    O --> P[Polish and regression evidence]
    P --> G5[gate-check: Release]
    G5 --> Q[release-checklist and launch-checklist]
    Q --> R[team-release: prepare candidate and handoff]
```

The arrows indicate review order. They do not mean a gate automatically permits
advancement or publishes a build. Apply the effective tier and record PASS,
CONCERNS, NOT ASSESSED, or FAIL. Missing playtests and unavailable independent
reviews remain visible. Release actions need applicable user authorization.

## Story and sprint loop

```mermaid
flowchart TD
    A[Accepted design and architecture] --> B[create-stories]
    B --> C[story-readiness]
    C -->|Needs work or blocked| A
    C -->|Ready| D[dev-story within owned paths]
    D --> E[code-review and appropriate tests]
    E --> F[smoke-check and QA evidence as required]
    F -->|Failure| D
    F --> G[test-evidence-review]
    G --> H[story-done]
    H --> I[sprint-status and content-audit]
    I --> J[retrospective and sprint-plan]
    J --> C
```

`qa-plan` defines testing scope; `team-qa` coordinates the testing cycle.
Static structure checks are not proof that a skill, engine, or client workflow
ran. A story closes only with evidence appropriate to its acceptance criteria.

## Design change propagation

```mermaid
flowchart LR
    A[Changed GDD rule] --> B[propagate-design-change]
    B --> C[Resolve affected ADRs]
    C --> D[Refresh control manifest]
    D --> E[Update stories and tests]
    E --> F[Revalidate affected paths]
```

Use `quick-design` for bounded story-sized changes, `scope-check` for scope
growth, and `reverse-document` when implementation lacks design records.

## Adoption and repair

```mermaid
flowchart TD
    A[Existing game] --> B[project-stage-detect]
    B --> C[adopt: test compliance of actual artifacts]
    C --> D[Resolve configuration conflicts and high-risk gaps]
    D --> E[Enter relevant workflow stage]
    F[Observed failure] --> G[bug-report and reproduction]
    G --> H[bug-triage]
    H --> I[Bounded fix and regression]
    I --> E
```

See [configuration migration](migration-guide-v1.1.md) for the adapted legacy
converter. A current clone requires no historical source directory.

## Polish, release, and follow-up

```mermaid
flowchart TD
    A[Feature-complete candidate] --> B[perf-profile; balance-check; asset-audit]
    B --> C[Playtests; localization and accessibility QA]
    C --> D[security-audit; regression-suite; soak-test]
    D --> E[release-checklist and launch-checklist]
    E --> F[Reviewable release candidate and evidence]
    F -->|Authorized release| G[Release action]
    G --> H[bug-triage; day-one-patch or hotfix]
    H --> I[Regression and patch-notes]
    G --> J[team-live-ops for planned events]
```

Team skills describe coordination. Native delegation depends on actual host
support and authorization. Otherwise disclose an in-session role-guidance
fallback; do not label it independent review. Model choices follow host
capabilities and `.codex/model-policy.json`. Hooks and lifecycle helpers use
the [explicit CLI](codex/hooks.md); automatic native activation is PENDING
until verified.
