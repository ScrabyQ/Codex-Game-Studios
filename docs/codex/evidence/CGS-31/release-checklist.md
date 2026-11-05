# Independent CGS-31 acceptance

**Technical acceptance: PASS with the explicit limitations below. No critical implementation blocker was found.** This accepts the candidate for a draft PR and user review. PR preparation remains the integrator's final step; this subagent does not mark CGS-31 complete, merge main, or publish a release.

Frozen candidate: `3670ab803998ce43e2cfd42a627954880206ff5a`, cloned directly from `ScrabyQ/Codex-Game-Studios` into the unique ignored `.codex-tmp/cgs31-final-20261105`. Historical and freshly fetched upstream: `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`. The final clone's HEAD was identical before and after the suite. No other process mutated that clone; its only final tracked change is the test runner's expected `docs/codex/evidence/CGS-29/tests.json` receipt. No reset or cleanup concealed it.

The reviewer is a separate subagent from the implementation/integration agents, applying technical-director and QA-lead instructions in-session. This is independent acceptance review, **not proof of native custom-role execution**. The recommended Astra model was unavailable twice according to the parent's collaboration status; available Sol substitution follows user Goal section 5. [review-context.json](review-context.json) records the exact reported error and provenance without invented timestamps or model attestation.

## Required acceptance checks

| Check | Status | Evidence and exact scope |
| --- | --- | --- |
| Full user Goal and all 31 full task descriptions considered | PASS | [Review context](review-context.json); full local Singularity export read and 31 fresh exact `task_get` calls. A connector filter error was replaced by exact-ID reads. |
| CGS-01–30 accepted results and commits exist | PASS | [Final snapshot](final-snapshot.json): all 30 COMPLETE records, reachable commits, every referenced local evidence file exists and is hashed. Fresh CGS-30 `task_get` subsequently showed checked 1. |
| Frozen candidate checkout and immutable test SHA | PASS | [Final snapshot](final-snapshot.json), before/after HEAD `3670ab8`; initial status empty. Preliminary mixed-SHA quick run is explicitly excluded; see [corrections](audit-corrections.md). |
| Original snapshot accounted exhaustively | PASS | Bulk `git cat-file --batch` checks every one of 638 historical Git blobs against inventory SHA-256 and migration mapping. Zero source errors or unmapped files. The calculated complete-record digest is retained in [final-snapshot.json](final-snapshot.json). |
| 15 declared hooks additional to 638 files | PASS | 653 migration rows; [final snapshot](final-snapshot.json), [declaration parity](../CGS-24/parity.json). Handlers, helpers and declarations are distinct counts. |
| Component counts 49 / 74 / 15 / 14 / 62 | PASS | [Final snapshot](final-snapshot.json) and final CI validator: 49 roles, 74 Skills, 15 declarations, 14 rules, 62 user templates; 8 guidance files and 1 authoring template counted separately. |
| 440 generated targets and migration target hashes current | PASS | Final snapshot independently checks all 440 exact target bytes; final validator also checks related migration targets and source/registry consistency. Zero drift. |
| Migration disposition explicit | PASS | 12 PORTED, 637 EQUIVALENT, 4 UNSUPPORTED, 0 PENDING **source dispositions**. Runtime/quality checks still PENDING are listed below; zero disposition-PENDING does not mean all runtime tests passed. |
| Current upstream fetched, no overlooked drift | PASS | [Actual fetch](final-actual-fetch.json) exit 0; [check](final-actual-upstream-check.json) exit 0: baseline/latest both `05ad7c8`, zero changes, zero target drift. No real baseline promotion was needed. |
| Git history and local authorship | PASS | Baseline is an ancestor, exit 0. Every adaptation author and committer is `ScrabyQ <scraby2016@yandex.ru>`; [final snapshot](final-snapshot.json). Synthetic fixture identities are confined to synthetic repositories. |
| Own fork, ownership and permission boundary | PASS | [Fork provenance](../../fork.json); fresh connected GitHub read confirms repository owner ScrabyQ, admin/push rights, main default and auto-merge disabled; [review context](review-context.json). No external write by reviewer. |
| Original source preservation | PASS | Exactly five reviewed seams differ as committed blobs: `.gitattributes`, `.github/CODEOWNERS`, `.gitignore`, README and UPGRADING. No `.claude/**`, original engine reference, source project configuration or original test-spec blob changed. All originals remain in history. |
| README and upgrade history content | PASS | Original README body retained verbatim after newline normalization. UPGRADING's original body after its first heading retained; its title was replaced by the Codex introduction and historical-history heading. CODEOWNERS preserves original rows and appends fork ownership. [Final snapshot](final-snapshot.json). |
| MIT and Donchitos attribution | PASS | LICENSE exact committed blob unchanged, SHA-256 `6ecc068715c0edffc4bc21e5dca450803e0a45af145f72221da23d14e7588359`. README opens with linked Donchitos attribution and independent-fork statement. Windows checkout CRLF is not a license-content change. |
| Structural/static/config/model/rule regression suite | PASS | `node scripts/codex/ci.mjs` in the final clone exit 0, 14:36:47–14:40:09 UTC; [final-quick-ci.json](final-quick-ci.json). Includes inventory, complete generation, role selection, three rigor/automation modes, config precedence, policy and negative corruptions. |
| Windows explicit backend behavior | PASS | [backend-ci.json](backend-ci.json), exit 0 after the clone had reached `7facb4b`; all six suites passed: hooks, helpers, selected-root helpers, extended helpers, leadership and specialist tests. Final snapshot proves no scripts/.agents/.codex code change between `7facb4b` and frozen candidate. |
| Linux execution | PASS | Fresh GitHub connector read confirms quick and linux-backend jobs SUCCESS on run [42045556633](https://github.com/ScrabyQ/Codex-Game-Studios/actions/runs/42045556633). [CGS-30 receipt](../CGS-30/remote-ci.json) binds that run to `7facb4b`; [review context](review-context.json) distinguishes the jobs-only connector response. |
| Hook negative tests actually deny | PASS | Windows 18-case suite plus Linux suite. Final [upstream dry-push proposal](final-upstream-denied-dry-push.json) exits 2; push was never executed. Dangerous Git, secret paths, Unreal binaries, invalid JSON and unmapped critical tool inputs are checked by explicit adapter tests. |
| Safe README remote configuration and regression | PASS | Final [remote add](final-upstream-add.json) and [set-url --push upstream DISABLED](final-upstream-disable-push.json) each exit 0. The published fix exempts only the exact complete safe configuration command; chained real pushes remain denied. [Initial failure/correction](../CGS-30/hook-fix.md) retained. |
| Upstream dry-run | PASS | [final-actual-sync-dry-run.json](final-actual-sync-dry-run.json) exit 0, NO_UPSTREAM_CHANGES. It preserves the expected test receipt change and makes no coverage acceptance. |
| Synthetic fetch / isolated merge / conflicts / reconciliation | PASS | Final quick CI runs actual local Git fixtures: changed Skill/hook, added role, deleted rule, deterministic dry-run, dirty-state preservation, isolated no-commit merge, recoverable conflict, no-op repeat, pending-state and stale mapping/overlay/evidence/enum refusals, explicit promotion followed by CI. No fixture push or PR. [Final CI](final-quick-ci.json). |
| README setup to one functioning Skill fallback | PASS, bounded | [Clean published install](../CGS-30/clean-install.md) and [CGS-30 acceptance](../CGS-30/acceptance.md): actual clone/config/fetch/check plus two actual CLI read-only help probes, one explicitly reading the Skill file. Nested command denials and slash-spelling defect are retained. Native automatic discovery is not certified. |
| Documentation local targets and template references | PASS, bounded | 29 introduction/onboarding link targets checked in CGS-30; final CI validates static Skill links, all generated target hashes and catalog spec paths. Dynamic examples/external destinations/fragment anchors were not universally fetched. |
| 123 catalog specs retained | PASS for content/format | 49 role + 74 Skill specs all present, unique and checked by final validator. These are written specifications, **not 123 executed native model-behavior tests**. |
| Fresh minimal Godot e2e | PASS | [Version](fresh-godot-version.json) 4.7.2.stable.steam.ed1daf0bf; [import](fresh-godot-import.json), [three-script parse](fresh-godot-parse.json), [eight model assertions](fresh-godot-test.json), [render/input](fresh-godot-render.json) all exit 0, no error lines. Actual Windows OpenGL renderer. |
| Fresh UI run-and-observe | PASS | Three actual 800×480 ready/empty/reset PNGs [opened and assessed](visual-observations.json); 3/3 ready → 0/3 disabled → 3/3 reset, readable and unclipped. [File/source hashes](scenario-files.json), [UNCHANGED freshness](scenario-freshness.json). |
| Small start → story-done scenario | PASS, explicit fallback | [Before evidence](scenario-before-evidence.json): returning-user start reads actual engine/brief and stops; later explicitly authorized dev-story validates reused implementation. Closure initially BLOCKED without UI captures. After fresh engine tests/opened images, [closure](scenario-closure.json) and [final facts](scenario-final-facts.json) show Complete, 5/5 bounded criteria. No fresh implementation or native end-to-end claim. |
| Minimal rigor and consent fidelity | PASS, bounded | Actual bootstrap resolves workflow/QA minimal, guided automation and solo gates. Project config hash unchanged; Concept stage retained despite inferred phase. Scripted fixture authorization applies only to the disposable fixture. Missing images blocked closure; no QA waiver waived visual evidence. |
| Unity editor / compile / tests / render | PENDING | Configured editor executable absent, Hub editor directory empty on fresh inspection; existing actual ENOENT probe retained in [engine matrix](../CGS-27/engine-matrix.json). No exhaustive disk search, invented project or static-analysis substitution. W-04. |
| Unreal build / tests / render | FAIL retained; coverage PENDING | Installed Build.version freshly read: 5.8.0 CL55116800 versus requested 5.8.3. Existing actual [UBT build](../CGS-27/unreal-build.json) exit 6: SDK10.0.19041.0 absent; no redundant build while prerequisites unchanged. No compiled model/test or UI/map success claimed. W-04. |
| Packaged game exports / certification | PENDING | No export presets/SDK certification/package build established; scoped engine tests do not establish release-ready game builds. [Engine limits](../CGS-27/README.md), W-04. |
| Physical input / human feel / accessibility usability | PENDING | Godot input uses actual synthetic engine events; no physical-device session, human playtest, performance benchmark or broad resolution/accessibility claim. W-05. |
| Native hook activation, native custom agent types | PENDING | Explicit CLI/CI equivalents verified; optional native hooks example remains inactive and custom type loading not attested. W-01/W-02. |
| Complete model-behavior catalogs / desktop / IDE discovery | PENDING | Current acceptance covers retained content, scoped behaviors and documented fallback; automatic client-wide behavior and all 123 native model scenarios remain unrun. W-03. |
| Release PR and official release | PENDING integrator/user action | Technical audit permits draft PR preparation. Integrator owns final `draft-pr.md` and `final-repository.json`, final commit/status and authorized draft PR. No auto-merge or official release is accepted or performed. |

## Task-by-task disposition

These rows accept each task's bounded implementation and evidence, including its explicitly recorded unavailable checks. They do not turn unavailable runtime features into PASS. [final-snapshot.json](final-snapshot.json) records every task's commit and evidence hashes.

| Task | Result | Main evidence / qualification |
| --- | --- | --- |
| 01 inventory | PASS | [Audit](../../audit.md); all 638 files +15 declarations accounted. |
| 02 fork/history/license | PASS | [Fork](../../fork.json), final exact blob/ancestry/authorship checks. |
| 03 architecture/isolation | PASS | [Architecture](../../architecture.md), [ownership](../../ownership.json); no new agent runtime. |
| 04 instructions/onboarding | PASS bounded | [Native probes](../CGS-04/native-probes.json), AGENTS and on-demand policies; not universal client behavior. |
| 05 Skill infrastructure | PASS bounded | [Evidence](../CGS-05/README.md), guarded generator negatives and help fallback; W-03. |
| 06 configuration/model policy | PASS | [Config checks](../CGS-06/config-policy.json), fresh final config/model tests. |
| 07 eleven leadership roles | PASS equivalent | [Structure](../CGS-07/structural.json), behavioral fixture and native diagnostic; W-02. |
| 08 twenty-three specialists | PASS equivalent | [Structure](../CGS-08/structural.json), in-session code/design/QA cases; W-02. |
| 09 fifteen engine specialists | PASS equivalent | [Structure](../CGS-09/structural.json), final role-selection tests; real engines separately qualified. |
| 10 six onboarding/settings Skills | PASS equivalent | [Traceability](../CGS-10/traceability.json), no-write/override/scope tests. |
| 11 six design Skills | PASS equivalent | [Acceptance](../CGS-11/acceptance.md), minimal/standard/dependency propagation. |
| 12 seven art/UX/prototype Skills | PASS equivalent | [Acceptance](../CGS-12/acceptance.md), actual Godot renders; human feel unassessed. |
| 13 five architecture Skills | PASS equivalent | [Traceability](../CGS-13/traceability.json), ADR transitions/guards. |
| 14 seven planning Skills | PASS equivalent | [Acceptance](../CGS-14/acceptance.md), dependency blocking/idempotency. |
| 15 five implementation/review Skills | PASS equivalent | [Traceability](../CGS-15/traceability.json), Godot and interrupted/stale-evidence guards; fresh fallback scenario above. |
| 16 six audit/review Skills | PASS equivalent | [Checks](../CGS-16/checks.json), six problem fixtures/read-only boundaries. |
| 17 eight QA Skills | PASS equivalent | [Runner outcomes](../CGS-17/runner-results.json), actual pass/fail/missing runner. |
| 18 five framework QA Skills | PASS equivalent | [Static/spec/category mapping](../CGS-18/static-spec-category.md); no fabricated human playtest or universal quality score. |
| 19 four production/content Skills | PASS equivalent | [Traceability](../CGS-19/traceability.json), factual logs/missing gate/localization unknowns. |
| 20 six release/hotfix Skills | PASS equivalent | [Dry-run](../CGS-20/dry-run.json), blockers/hashes retained; no real publish. |
| 21 five gameplay/visual team Skills | PASS equivalent | [Checks](../CGS-21/checks.json), bounded ownership/incomplete-agent cases; W-02. |
| 22 four narrative/release/QA team Skills | PASS equivalent | [Checks](../CGS-22/checks.json), conflict/capability/release-gate handoffs; W-02. |
| 23 fourteen path rules | PASS equivalent | [Rules](../CGS-23/rules.json), fresh final selector tests; explicit invocation, no automatic enforcement claim. |
| 24 fifteen hook declarations | PASS equivalent | [Parity](../CGS-24/parity.json), Windows/Linux suites and safe command regression; W-01. |
| 25 helper/config/session infrastructure | PASS equivalent | [Helper inventory](../CGS-25/helper-inventory.json), all six backend suites/extended observations. |
| 26 templates/guidance/reference content | PASS content | [References](../CGS-26/references.json), exact original blobs and generated hashes. Content retention is not engine-version verification. |
| 27 engine matrix | PASS scoped; pending engines explicit | [Matrix](../CGS-27/engine-matrix.json), fresh Godot e2e above; Unity/UE/human W-04/W-05. |
| 28 CI | PASS | Final exact-SHA local CI, existing Linux Actions plus fresh connected job check; engine/model checks remain separate. |
| 29 upstream synchronization | PASS | [Acceptance](../CGS-29/integrator-acceptance.md), final actual fetch/dry-run and synthetic reconciliation suite. |
| 30 documentation/install/attribution | PASS bounded | [Acceptance](../CGS-30/acceptance.md), actual corrected published clean install and explicit CLI fallback; W-03. |
| 31 final acceptance/draft PR | Technical audit PASS; handoff PENDING | This checklist and evidence; integrator still prepares/reviews draft PR and records final task disposition. |

## Explicit equivalence and unsupported waivers

The user Goal sections 2 and 6 expressly permit tested functional equivalents/safe fallbacks and documented unavailable engine checks. These waivers bound the claim; they are not permission to release broken games or a claim that unknown capabilities work.

- **W-01 — hooks:** 15 declarations have tested explicit CLI/CI equivalents. Native activation and automatic lifecycle/tool interception remain PENDING; users must invoke the fallback explicitly. Notification is manual status, not an invented native approval event. Finite shell detection and advisory registry/write guards are documented in [hooks](../../hooks.md); host permissions remain necessary. Automatic InstructionsLoaded telemetry is UNSUPPORTED.
- **W-02 — roles/orchestration:** all 49 adapted bodies and coordination contracts are available. Native custom `agent_type` loading and model overrides are not established. Read the selected role and apply in-session fallback when unavailable; disclose lack of independent role review. Existing scoped orchestration cases do not certify all native agents.
- **W-03 — Skill/client/catalog:** all 74 adapted Skills are mapped and validated with group-specific scoped evidence. Successful real CLI help fallback reads establish a working fallback, not universal native discovery, preprocessing, desktop/IDE behavior, or all 123 native model-behavior scenarios. Written test specifications are retained as specifications.
- **W-04 — engines/exports:** Godot scoped runtime/render passes. Unity needs the configured real editor/license/project; Unreal needs the intended patch and SDK before compiling/testing/rendering. Retain Blocked/PENDING stories and rerun documented commands after prerequisites change. No SDK install or Epic-source redistribution is required for this adaptation's draft PR.
- **W-05 — human assessment:** synthetic engine events and opened PNGs do not measure feel, accessibility usability, physical input, platform performance or release certification. Human playtests and packaged builds remain PENDING when applicable.
- **W-06 — retained reference meaning:** EQUIVALENT on a reference/template/written spec means preserved, available content with verified links/hashes, not execution of a fictional behavior. Migration status is a disposition of source content; capability/test status remains separately visible above.

Four exact UNSUPPORTED rows are retained: `.claude/hooks/log-instructions.sh` (automatic instruction telemetry), `.claude/settings.json` (automatic Claude client configuration), `.claude/statusline.sh` (automatic statusline), and `.worktreeinclude` (automatic Claude worktree copying). Original files and Git blobs remain; explicit rule selection/instruction/hook dispatch/manual project context compensate where documented. None is silently omitted or represented as native execution. [Machine-readable rows](inventory.json).

## Findings and handoff

No critical blocker remains for the documented fallback-based adaptation candidate. One real setup defect was found by CGS-30's clean clone and fixed before this freeze: the safe upstream-disable command false positive. Its failed run and regression checks remain visible. Independent audit process errors (initial mixed-SHA run, CRLF comparisons, oversized snapshot hook timeout) are recorded in [audit-corrections.md](audit-corrections.md), and excluded or corrected before this verdict.

The integrator should review this content, prepare the concrete draft PR with these limitations, and record final CGS-31 completion only after the promised PR artifact exists. Any code/source change invalidates this frozen-code acceptance and requires checks appropriate to that change. A later evidence-only bookkeeping commit does not constitute a new engine/model test. No official release or automatic main merge is recommended or authorized by this technical verdict.
