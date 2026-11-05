# CGS-22 — narrative, release, live-ops and QA teams

Status: **EQUIVALENT for the bounded sequential host scenarios below**. Four source-bound overlays and centrally generated targets preserve the upstream bodies. This is not a successful full game release, independent review, or native custom-role execution.

## Source → target and behavior matrix

| Upstream source | Codex target | Preserved contracts | Observed bounded behavior |
|---|---|---|---|
| .claude/skills/team-narrative/SKILL.md | .agents/skills/team-narrative/SKILL.md | Canon first; six departments scoped by team size; mandatory ND-CONSISTENCY semantics and individual self-check exception; named strings/placeholders, <120 characters, localization headroom; separate working/final paths | Writer/world-builder inputs disagree on established canon. In-session narrative-director returns REJECT with reconciliation options. Shared parent handles the dispute; no invented user choice or canon edit. |
| .claude/skills/team-release/SKILL.md | .agents/skills/team-release/SKILL.md | Stage-before-spawn, written stage override; department/conditional security-network checks; source workflow severity thresholds; review-mode TD sign-off; NO-GO stops Phase 6; separate explicit deployment approval in every mode; stage remains unchanged | Real configuration helper resolves Polish in collaborative/guided/autonomous. Each in-session guard stops before Phase 1. Separate supplied Release candidate-quality scenario has open S2 at workflow full: producer NO-GO, no Phase 6 actions. TD review remains PENDING. |
| .claude/skills/team-live-ops/SKILL.md | .agents/skills/team-live-ops/SKILL.md | Cadence vs pricing ownership; economy and analytics collection before writing; ethics-policy missing vs violation; user-approved final design documents; community drafts and telemetry plans distinct from publication/instrumentation | Actual host inspection finds premium +20% ranked damage violates supplied cosmetics-only policy. Both economy/analytics reports exist; final season documents blocked. Missing instrumented fixture endpoint named PENDING, never filled with unrelated connected data. |
| .claude/skills/team-qa/SKILL.md | .agents/skills/team-qa/SKILL.md | Scope/open bugs first; smoke distinction; qa.level evidence rules; UI screenshot/Visual lead distinctions; canonical bug fields; every story included; unbiased qa-lead facts/rules; reply-only sign-off then coordinator write; task-owner handoff; scoped checkpoint | Real Node assertion fails (health 15 vs10). qa-tester files BUG-0003 S2-High/P1-Fix this sprint. In-session qa-lead replies NOT APPROVED despite unexecuted UI. Coordinator records reply under existing fixture authorization. Gameplay owner reads the handoff, acknowledges diagnosis and leaves implementation unchanged. |

Exact source/target SHA-256 and transform IDs are in [traceability.json](traceability.json). Overlay files are under ../../overlays/. They are source-hash anchored; no original skill body was edited.

## API substitutions and ownership

Claude Agent/subagent_type is translated to actual available delegation or explicit **sequential in-session role execution; not independent review**. This run uses the latter: bounded negative scenarios do not justify extra agents, and native custom loading remains PENDING from CGS-07. No hidden runtime, pseudo child handles, independently signed approval or simulated parallel execution is claimed.

TaskCreate/Get/List/Update becomes a scoped assignment record; no external tracker task was created. Questions use a real host question facility/plain text when an unresolved decision must be obtained. Here missing creative choices, stage overrides and deployment approvals are deliberately unresolved scenario inputs; the run stops dependent work rather than asking the real user to approve fictional deployments. Explicit authorization for fixture writes already exists and is not inferred from automation.

| Sequential responsibility | Owned artifact(s) under fixture | Inputs/dependencies |
|---|---|---|
| Harness input setup | brief.md, project.yaml, modes/*/project.yaml, design/** input policy/canon, src/damage.mjs, tests/damage.test.mjs, supplied drafts/stories | Explicit isolated-fixture assignment; not role implementation work |
| Writer conflict check | production/narrative/memory-vault/writer-review.md | Supplied canon and two conflicting drafts |
| Narrative-director consultation | production/narrative/memory-vault/nd-consistency.md | Writer/world-builder disagreement, canonical facts, gate definition |
| Economy / analytics consultations | production/live-ops/season-1/economy-review.md; analytics-review.md | Separate supplied economy/policy and telemetry-plan inputs |
| Live-ops consolidated review | production/live-ops/season-1/review.md | Both preceding artifacts collected; no downstream content fabricated |
| QA lead strategy / coordinator plan | production/qa/strategy-combat.md; qa-plan-combat.md | Existing Closed BUG-0002 excluded, story classifications, supplied smoke input |
| QA tester | production/qa/bugs/BUG-0003.md, evidence/story-001-evidence.md, evidence/story-002-evidence.md, handoff-BUG-0003.md | Actual test output; missing UI build/tester/screenshot explicitly unexecuted |
| QA lead reply / coordinator record | ../qa-lead-reply.md; production/qa/qa-signoff-combat-2026-11-05.md; production/session-state/active.md | ../qa-lead-brief.md carries facts and source rules, no preferred verdict; no lead file-write impersonation |
| Release QA / producer collection | production/releases/qa-gate-v0.0.22-fixture.md; go-no-go-v0.0.22-fixture.md | Known bug and actual config; unexecuted release checks remain PENDING |
| Gameplay owner receipt | production/combat/owner-receipt-BUG-0003.md | Written QA handoff + source inspection; acknowledgment only, no fix authority |

Every write is sequential, with one owner per report. No simultaneous same-file write was attempted. No live contention/lock-enforcement stress test is claimed. Input initialization is separate from role work; hashes demonstrate QA/owner did not modify implementation or narrative canon. Final compilation authority remains with the source-designated coordinator. Other departments are explicitly routed or marked unexecuted, not silently represented as completed.

## Actual execution and reproducibility

1. node docs/codex/evidence/CGS-22/prepare-overlays.mjs — writes only owned overlays, checks each through explicit PreToolUse/PostToolUse; root generates targets.
2. node docs/codex/evidence/CGS-22/prepare-fixture.mjs — writes supplied synthetic inputs, runs actual selected-root config helpers and Node test. Preparation exit0; deliberate QA test exit1 is expected.
3. The host reads generated source contracts, input/result evidence and relevant roles; authors the findings in record-reviews.mjs. Running that script materializes those already-authored observations; it does **not** invoke a model or discover a verdict.
4. The host reads the written qa-lead brief and QA→owner handoff, applies the source verdict order, then records replies in finish-checks.mjs. This performs actual helper decision logging and final artifact assertions; it is not a substitute automated skill evaluator.

All checks use existing authorization, explicit hook proposal checks and post-write validation. Real helper bootstrap requires Bash, which ran through the permitted host tools. Autonomous logging uses the actual sourced log_decision function because the narrow yaml-helper CLI deliberately exposes read-only dispatch only. Its recorded decision is to stop at Polish without an override. This does not create permission.

[config-observations.json](config-observations.json): four helper exits0, including all three automation modes.
[qa-test-run.json](qa-test-run.json): actual Node assertion exit1, expected defect, no real-engine claim.
[autonomous-log-run.json](autonomous-log-run.json): actual helper log invocation and exit status.
[checks.json](checks.json): final assertions, explicitly separated from model invocation.

The fixtures' smoke PASS and Release stage are **supplied test inputs**, not measured game readiness. The only executed gameplay check is the synthetic Node test. In release, S2/S3 additionally block **workflow full**; this axis is separate from **review_mode full**, which controls the TD sign-off.

## Limits and PENDING

- Native custom-role loading/spawn and shell-tool enforcement: PENDING, unchanged from CGS-07 diagnostic; no repeat probes.
- Independent multi-agent reviews, studio-size concurrent fan-out and full upstream test matrices: not executed.
- Real game build, manual UI QA/screenshot, full regression, platform CI, performance/security/localization/TD sign-offs, instrumented telemetry and live deployment: PENDING/not supplied.
- Narrative final choice/localization/level integration and live-ops corrected economy/final plan approval: unresolved by design.
- Phase 6 permission counterfactuals are source-based reasoning, not attempted external operations. No tag, push, release build, deployment, message, publication, storefront update or scheduler action was performed.
- Skills/role prose describes behavioral constraints; this evidence does not claim automatic host enforcement or turn directors into permission managers.
