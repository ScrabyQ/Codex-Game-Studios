# Codex overlay architecture (CGS-03)

Status: Accepted design under the user's authorized backlog implementation. This is an implementation contract, not a claim of runtime parity. Baseline upstream: `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`; prerequisites CGS-01 and CGS-02 completed at `cd47ba773adb128742bfba727dc3323fc8cca7c5` and `cfd7accffd86470981c11269ae4e1ed0b9cf9a56`. Owners are recorded in [ownership.json](ownership.json).

## Decision and boundaries

Use native Codex instructions, Skills, subagents, permissions, and supported hooks. Do not build an autonomous agent runtime, scheduler, conversation engine, or replacement permission system. Node ESM scripts perform deterministic generation, dispatch, validation, and evidence collection. Existing Bash/AWK/Python helpers remain the behavioral backend where needed; missing dependencies are reported explicitly.

Preserve `.claude/**`, original `CLAUDE.md` files, original docs/scripts, `studio-tests/**`, engine references, and MIT LICENSE. `project.yaml` remains the shared source of project settings; project operation can update it through authorized helpers, but migration must not seed new defaults. Additive AGENTS files, README attribution, CI, and narrowly necessary ignore rules are explicit integration seams, reviewed separately from upstream content. Git history and the fork relationship remain intact.

| Source | Codex target | Contract |
|---|---|---|
| `.claude/skills/**` | `.agents/skills/**` | Generated adapted copies, including all referenced resources |
| `.claude/scripts/**` | `.agents/scripts/**` | Adapted helper mirror; preserve arguments, observations, and exit semantics |
| `.claude/hooks/**` | `.agents/hooks/**` | Adapted helper/handler mirror; native registration is separate |
| `.claude/docs/**` | `.agents/docs/**` | Content-preserving copies where runtime instructions/paths need adaptation |
| `.claude/agents/*.md` | `.codex/agents/*.toml` | Standalone native role definitions, full responsibility and escalation content |
| `.claude/rules/*.md` | `.agents/rules/*.md` plus selector registry | Preserve 14 scopes; do not pretend directory scopes implement arbitrary globs |
| Root/scoped `CLAUDE.md` | Root/scoped `AGENTS.md` | Compact entry instructions and explicit on-demand references |
| Templates, engine references, studio tests | Original paths or registered adapted copies | Preserve originals, attribution, and source-to-target traceability |

The `.agents/{scripts,hooks,docs}` mirror deliberately retains sibling paths and `../..` root depth. Moving those helpers under `scripts/codex/legacy` would break root inference and sibling lookups without many extra transformations. Windows uses real files, never required symlinks.

## Worker interfaces and generated-file ownership

All public script commands run from the repository root unless an explicit `--root` is supplied. Implementations must support roots containing spaces. Root discovery must honor a deliberately selected nested project, including a nested `project.local.yaml` without a base; it must not silently borrow its parent's config.

- `node scripts/codex/cgs.mjs <command> [args...]` is the convenience dispatcher. It routes to implemented helpers/validators, prints usage for unsupported commands, and does not launch autonomous workflows.
- `node scripts/codex/helper.mjs <helper> [args...]` dispatches registered mirrored helpers with an argument array, explicit working directory, and dependency checks. No shell interpolation of user arguments. Preserve backend stdout/stderr and exit codes. Backend commands intentionally accepting shell command text keep that documented contract rather than passing arbitrary dispatcher arguments through a shell.
- `node scripts/codex/generate.mjs --check` checks generated state without writes; generation without `--check` writes only registered targets that pass ownership checks. Support component selection so independent workers can generate only their owned family.
- `node scripts/codex/rules.mjs --path <repository-relative-path>` selects matching adapted rules from `.agents/rules/index.json`; scope semantics and Windows path normalization are tested explicitly.
- `node scripts/codex/validate.mjs` performs deterministic overlay validation. Runtime/model/engine tests are separately invoked and separately reported.

The generator owns a machine-readable `docs/codex/generation-manifest.json`, separate from the integrator-owned migration manifest. Its versioned entries contain `id`, `source`, `source_sha256`, `target`, `target_sha256`, `transform_version`, `transform_ids`, `owner`, and `ownership` (`generated` or `manual`). Source hashes identify Git blob bytes; target hashes identify exact emitted UTF-8/LF bytes. Global metadata records schema and upstream commit. Normalize checkout line endings only for generation, never for source identity.

Transforms preserve substantive source text and record each intentional change. Do not globally replace words such as Agent or model in ordinary prose. Frontmatter conversion, path changes, dynamic shell bootstrap, question/delegation changes, and tool restrictions are explicit transformations with anchored expectations. Unknown structures fail review rather than disappearing.

Regeneration refuses to overwrite a target whose bytes differ from the last recorded generated hash. Missing registration, new upstream files, changed sources, removed sources, duplicate targets, failed anchors, and unexpected generated output are visible reconciliation items. A manually owned target is never overwritten by normal generation. Manual adaptations may be maintained as source-hash-bound patches under `docs/codex/overlays/`; each patch has exact anchors and an owner. Source changes invalidate patch assumptions and prior evidence. No force-regeneration escape that silently discards manual work.

Workers own disjoint skill/role/helper families and evidence files. Only the integrator edits `migration-manifest.json`, `progress.json`, and shared task status. Workers return source IDs, target paths, hashes, transforms, and evidence for integration. A generated file is not automatically PORTED; coverage classification and verification status are separate.

## Instructions, roles, models, and permissions

Root AGENTS states source preservation, configuration resolution, authorization, checkpoint recovery, and where to find applicable policies. Add scoped AGENTS for existing source/design/docs/test areas only where useful. Do not load 49 role bodies and 74 skills into every prompt. Claude `@imports` become explicit references/read instructions; no implicit import equivalence is assumed.

Skill frontmatter uses supported Codex fields. Claude dynamic `!` shell insertions become explicit safe bootstrap commands that the skill runs before consuming config; they are not silently removed. Replace `CLAUDE_SKILL_DIR`/project environment assumptions with verified paths and project-root resolution. Retain arguments, phases, gates, decision rules, evidence requirements, and resource content.

Role TOML requires `name`, `description`, and full `developer_instructions`. Do not emit Claude model/tool/maxTurns metadata as native configuration. Generated roles contain no model pin. A separate model policy maps task/role to preferred model and effort, validates against explicitly available capabilities, and records the selected model or fallback reason. Unknown availability never counts as available. Native CLI model IDs and host collaboration-tool IDs are separate capability sets. Discover locally advertised models, then verify the selected model; a cache is evidence of advertisement, not successful execution. If none is established, inherit the session default rather than guessing an ID. Where overrides are unsupported, inherit the session model and disclose that limitation; fallback cannot weaken role requirements.

Parent-reported CLI probe on 2026-11-05: CLI 0.148.0 rejected `gpt-6-luna` for the ChatGPT account (HTTP 400); retry with locally advertised `gpt-5.6-luna` exited 0 and returned `CGS_NATIVE_PROBE_OK`. This verifies one basic model invocation, not skill discovery, custom roles, or hooks. Host collaboration may separately expose `gpt-6-*` names; never copy those blindly into CLI configuration.

Delegate only where task scope warrants it and authorization permits it. Native roles inherit session permissions. If native delegation is unavailable, read the role instructions and perform a disclosed in-session role review; do not call it an independent review. Preserve existing user authorization across steps. Automation modes cannot grant permissions the user or host has withheld. Ask only for choices or approval still required by the applicable workflow; unanswered required questions are not consent. No generated broad permission grants.

## Configuration and persistence

Preserve the resolver chain: allowed `project.local.yaml` values → `project.yaml` → legacy mirrors → rigor expansion → documented defaults. Preserve invalid-enum fallthrough, local read/write whitelist parity, source provenance, BOM/CRLF handling, and diagnostics. Never seed the six knobs fronted by rigor: workflow, density, QA level, story granularity, review mode, team size. `testing.strict.*` remains unset where unset; per-skill defaults remain per-skill. Test all three rigor and three automation modes and their combinations.

Helpers emit observations, never invented quality verdicts. Keep `production/session-state/active.md` as the recovery checkpoint and existing stage/story/ADR/evidence formats. Adapted per-role memory uses an explicitly ignored `.agents/agent-memory/` directory; it is file persistence, not a promise of native Codex memory. Recovery reads the checkpoint after compaction or interruption; hooks may assist but cannot be the sole recovery mechanism.

## Rules and hooks

Preserve all 14 source rule globs in a machine-readable selector registry. Directory-scoped AGENTS handle genuine directory inheritance. Cross-tree engine globs and extension scopes use on-demand rule selection and tested validators. Instructions must direct selection before relevant work; a selector existing on disk does not prove automatic enforcement.

Register supported native events in `.codex/hooks.json` only after inspecting current event/payload behavior. Candidate events are SessionStart, PreToolUse, PostToolUse, PreCompact, SubagentStart, SubagentStop, and Stop. Hooks require project trust where applicable. Native integration is opt-in until verified in the target client; mandatory protection cannot be advertised while a required hook is disabled.

Keep 15 declaration-level traceability entries distinct from 18 source scripts. Notification has no documented event in the consulted API: provide a documented explicit status/notification command, not a fictional registration. Unsupported lifecycle behavior gets an explicit manual/CLI/CI fallback and limitation.

Verify actual Codex payloads for Bash/exec_command and Edit/Write/apply_patch aliases. The upstream hook parser expects Claude `file_path` and replacement fields; aliases alone do not establish compatibility. Multi-file patches must inspect every affected path/proposed result. Existing validate-write warnings are advisory, not blocking. PreToolUse blocking uses verified deny JSON or exit-2 semantics. Command-based file access can bypass file-tool matchers; native permissions and tested command guards supplement them. A finite command-pattern guard is not a universal shell security boundary. Test denial by proving a harmless sentinel action did not execute; test malformed input, missing dependencies, and false positives too.

## Verification and upstream updates

Keep five evidence layers separate: structural validation, written-spec review, native discovery, actual behavioral execution, and engine integration. Upstream `skill-test` explicitly says its current modes read files and do not run skills. A structural/spec PASS must never become behavioral PASS.

Reuse all 74 upstream skill specifications and 49 role specifications through registered Codex adaptations. Actual behavior tests invoke Codex in disposable fixtures with recorded runtime version, actual model, prompt and follow-up inputs, tool trace, before/after files, assertion results, and exit codes. Include withheld consent/no writes, missing inputs/NOT ASSESSED, rigor-dependent gates, root/subdirectory invocation, recovery, and hook denial. Engine evidence records actual installed versions and screenshots where visual behavior matters. Unrun cases, models, engines, and client integrations remain PENDING; mocked tests are labeled as such.

Evidence JSON records `schema`, component IDs, source/target hashes, fixture hash, runtime/model, command, start/end time, exit code, assertion results, and artifact paths. Runtime evidence belongs under `docs/codex/evidence/<task-id>/`; large/private temporary fixtures and transcripts stay in ignored scratch storage with appropriate sanitized evidence references.

Updates use fetch, inventory comparison, a dedicated sync branch, reviewed merge, reconciliation, regeneration, and tests before a reviewable PR. No force-push, automatic main merge, blanket conflict acceptance, or removal of local work. Dry-run does not mutate source or overlays. Newly discovered components are PENDING; changed hashes stale prior evidence. Sync tests modify a fixture Skill and hook, verify both are detected, and prove manual overlays survive.

Dependency gates: CGS-01+02 → 03 → 04; then 05/06/23 can use separate ownership. CGS-26 follows 01+03. CGS-06 enables 07 and 25; 07 → 08 → 09. CGS-24 waits for 04+23+25. Skill groups retain their backlog dependencies, especially 13 → 14 → 15 and 21 → 22. Engine acceptance/CI/sync/release tasks consume evidence rather than upgrading untested components to PASS.

Documentation consulted for API candidates: [Skills](https://learn.chatgpt.com/docs/build-skills), [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Hooks](https://learn.chatgpt.com/docs/hooks). CLI 0.148.0 availability is recorded by the project; this ADR itself performs no native runtime tests. Host/client differences remain verification obligations.
