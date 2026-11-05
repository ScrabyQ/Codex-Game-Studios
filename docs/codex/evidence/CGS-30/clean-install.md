# Published clean-clone verification

Initial run 2026-11-05 14:22–14:27 UTC in ignored `.codex-tmp/cgs30-clean-20261105`, cloned directly from the published fork, with no local overlay:

| Command or check | Actual result |
| --- | --- |
| `git clone --branch codex/adaptation https://github.com/ScrabyQ/Codex-Game-Studios.git .codex-tmp/cgs30-clean-20261105` | Exit 0; `git rev-parse HEAD` exactly `1229523688c31643d38fc403daf55b8ecded5518` |
| `git remote add upstream https://github.com/Donchitos/Claude-Code-Game-Studios.git` | Exit 0 |
| `git remote set-url --push upstream DISABLED` | Required explicit PreToolUse check denied exit 1 with “Push to upstream denied”; command was not executed. This was a false positive for a safe configuration command. The upstream push URL therefore remained unchanged in this fixture. |
| `node scripts/codex/validate.mjs` | Exit 0; structural counts roles 49, Skills 74, hooks 15, rules 14, templates 62 and 440 targets. No engine behavior is inferred. |
| `node scripts/codex/sync-upstream.mjs --dry-run` before fetch | Exit 1: upstream tracking ref absent, as expected for a fresh clone. |
| `node scripts/codex/check-upstream.mjs --fetch` | Exit 0; fetched baseline/upstream `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`, status NO_UPSTREAM_CHANGES, zero pending entries. |
| `node scripts/codex/sync-upstream.mjs --dry-run` after fetch | Exit 0, same baseline and status. |
| New local Markdown link targets in the Codex README and upgrade introductions and onboarding | 29 target paths existed; external links and fragment anchors were not independently fetched or checked by this path check. |
| `git status --porcelain` before and after probes | Exit 0 and empty. This asserts no tracked or unignored worktree changes, not absence of all possible host state writes. |

All actual shell/file proposals were checked explicitly; successful writes received PostToolUse checks. The denied remote command was not executed. Fetch changed local Git metadata, and both native runs used ignored trace files. The clone remains retained for inspection; no cleanup or global settings changes were made.

## Native CLI probes

At 14:23 UTC the initial sandboxed run exited 1 before model execution: state database and app-server startup were denied. The authorized host retry used:

```text
codex exec --ignore-user-config --ephemeral --strict-config --sandbox read-only --cd <clean-clone> --model gpt-5.6-luna --json -
```

Stdin: `$help Use your documented factual read-only fallback; Bash helpers unavailable in this host; cite actual project settings and catalog and next step; do not write or invoke next skill.` Host retry exited 0. Successful actual commands read `project.yaml`, `.agents/docs/config-resolution.md`, `.agents/docs/workflow-catalog.yaml` and technical preferences. The response identified the default minimal path, collaborative automation and unconfigured engine, and recommended `$setup-engine` without invoking it. Several compound nested commands were blocked by policy; one artifact search exited 1. Event output does not independently attest the selected model or show how Skill instructions were injected, so native discovery itself is not established by the result.

At 14:25–14:27 UTC an additional host run with the same CLI options asked explicitly to read `.agents/skills/help/SKILL.md` and apply its factual fallback. It exited 0, and a simple `Get-Content .agents/skills/help/SKILL.md` command actually exited 0. It also read project settings, config resolution and workflow catalog; nonexistent local override, stage mirror and checkpoint reads returned exit 1. Compound commands and the Bash bootstrap were denied by nested policy. The response reported those missing inputs, minimal workflow, unknown intended engine and stage, and recommended engine setup without invoking another Skill. It printed the upstream-style `/setup-engine` spelling; Codex invocation uses `$setup-engine`. Successful process exit is not a guarantee that native Skill discovery or bootstrap works.

Raw JSON event traces are retained only in ignored `.codex-tmp/cgs30-native-host-trace.jsonl` and `.codex-tmp/cgs30-explicit-host-trace.jsonl`. The requested model was supplied as a CLI option; the JSON events do not independently attest it. Desktop/IDE behavior, native hook activation, Unity/Unreal runtime and human playtests remain PENDING.

## Corrected published setup retry

At 14:30–14:31 UTC a second unique ignored fixture, `.codex-tmp/cgs30-final-20261105`, was cloned directly with the documented `git clone --branch codex/adaptation https://github.com/ScrabyQ/Codex-Game-Studios.git` command. Clone exited 0; `git rev-parse HEAD` exited 0 and matched `7facb4b52d8fd821c725d65560a19a6c24c4dd4f`. This published commit contains the guard correction. Both documented commands, `git remote add upstream https://github.com/Donchitos/Claude-Code-Game-Studios.git` and `git remote set-url --push upstream DISABLED`, passed explicit PreToolUse checks and exited 0. `git remote get-url --push upstream` exited 0 and returned `DISABLED`. PostToolUse checks exited 0.

`node scripts/codex/validate.mjs` exited 0 with the same 49/74/15/14/62 structural counts and 440 targets. `node scripts/codex/check-upstream.mjs --fetch` and `node scripts/codex/sync-upstream.mjs --dry-run` each exited 0; both reported baseline/upstream `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`, NO_UPSTREAM_CHANGES and no pending entries. `git status --porcelain` exited 0 and was empty. The fixture is retained; fetch modified local Git metadata.

The native Skill probes above apply to the earlier `1229523` clone; they were not rerun after the guard-only correction. This retry establishes the documented remote setup and structural checks at `7facb4b`, not native hook activation or additional engine behavior.
