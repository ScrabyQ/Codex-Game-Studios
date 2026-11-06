

# Explicit hook backends

The adapter dispatches these backends for explicit events. Event/Trigger columns describe requested checks, not automatically registered hooks:

| Hook | Event | Trigger | Action |
| ---- | ----- | ------- | ------ |
| `validate-commit.sh` | PreToolUse (Bash, PowerShell) | `git commit` commands | Validates design doc sections, JSON data files, hardcoded values, TODO format |
| `validate-push.sh` | PreToolUse (Bash, PowerShell) | `git push`, `git tag`, `git merge` and release commands | Warns on pushes to protected branches (`main`, `master` and `release/*`), and on the steps that ask first: `git tag` (not a listing), `git merge` (not `--abort`), `gh release`, `butler push` and `steamcmd` with `+run_app_build`. Which commands count is `bash .agents/scripts/write-guard.sh git` |
| `validate-registry.sh` | PreToolUse (Write/Edit) | Writes and edits of `design/registry/entities.yaml` and `docs/architecture/tr-registry.yaml` | Warns, and never blocks, when the change would delete or renumber an entry or set a status outside the values the file's header lists. It runs before the write, while the old file can still be compared; the check itself is `bash .agents/scripts/registry.sh compare`. The skills that write a registry also run `registry.sh validate` after writing, because hooks do not run in every tool |
| `validate-write.sh` | PreToolUse (Write/Edit) | Writes and edits the rules below name | Warns, and never blocks, when a write would replace a file skills never overwrite (an existing `EPIC.md`, `project.godot`, `tests/helpers/*`, the tech-debt register, an engine reference doc, the files `$test-setup` creates), set a config value outside its list or a key `project.local.yaml` cannot hold, set the review mode, leave a prototype file without its `PROTOTYPE` or `VERTICAL SLICE` header or reach between `prototypes/` and the code root, change a string table during an active freeze, or, from a subagent, write anything but a new file under `production/`, `docs/` or `tests/`. The check is `bash .agents/scripts/write-guard.sh check`, which the skills that write these files also run themselves |
| `validate-read.sh` | PreToolUse (Read) | A Read with no offset and no limit under `design/`, `docs/architecture/` or `production/session-state/` | Blocks a whole-file read of a doc over 40 KB (`features.read_guard_kb`) and answers with the doc's headings by line, so the retry reads one section; a ranged read always passes. `features.read_guard: off` turns it off. The check is `bash .agents/scripts/read-guard.sh check` |
| `validate-agent-artifact.sh` | SubagentStop | A subagent stops | Warns you, and never blocks, when the file its return contract named ("Write your full output to `<path>`") is not on disk, a failed phase however its reply reads. The caller checks the path and reviews its actual contents |
| `validate-assets.sh` | PostToolUse (Write/Edit) | Asset file changes | Checks data-file JSON under `assets/`, `Assets/` or `Content/`, and asset naming in Godot's `assets/` only |
| `session-start.sh` | SessionStart | Session begins | Loads sprint context, milestone, git activity; detects and previews active session state file for recovery, with one line when its checkpoint names a different branch from the one you are on; legacy automatic release polling is retired |
| `detect-gaps.sh` | SessionStart | Session begins | Detects fresh projects (suggests $start) and missing documentation when code/prototypes exist, suggests $reverse-document or $project-stage-detect |
| `pre-compact.sh` | PreCompact | Context compression | Appends one line to `production/session-logs/compaction-log.txt` and prints nothing: the explicit checkpoint command does not inject context. `session-start.sh`, which must be invoked explicitly for recovery, is what restores context |
| `notify.sh` | Notification (`permission_prompt`, `idle_prompt`) | Explicit status/notification request | Reports explicit CLI status; native notification delivery requires separate verification |
| `session-stop.sh` | Stop, async | Explicit Stop invocation | Updates the session log and writes the subagent spawn tally to `production/session-logs/session-cost.md`; prints nothing. Archives `active.md` only when its content hash changed; without that guard a long session appended the whole file on every turn. Runs in the background, so the turn does not wait for it |
| `log-agent.sh` | SubagentStart | Agent spawned, resumed, or a teammate handles a new message | Audit trail start — logs subagent invocation with timestamp and session id. SubagentStart fires for a resume and for each agent-team message too, so the spawn tally counts those |
| `log-agent-stop.sh` | SubagentStop | Agent stops | Audit trail stop — completes subagent record. Unidentified entries never establish a named role invocation |
| `validate-skill-change.sh` | PostToolUse (Write/Edit) | Skill file changes | Advises running `$skill-test` after any `.agents/skills/` file is written or edited |

Adapter diagnostics are observations. Exit-0 advisory warnings do not block; denials and process failures must be surfaced. See [payloads](hooks-reference/hook-input-schemas.md).

### Subagent cost visibility

The three hooks above form one chain. `log-agent.sh` writes a record per spawn
to `production/session-logs/agent-audit.log` in a fixed three-field shape:

```
YYYYMMDD_HHMMSS | <session_id> | Agent invoked: <agent_type>
```

`session-stop.sh` greps the literal string `" | $SESSION_ID | Agent invoked: "`
to tally the current session, then writes a count plus a per-agent breakdown to
`production/session-logs/session-cost.md`.

The field order of that record is fixed. `session-stop.sh` matches it literally,
so a different order silently zeroes the spawn count instead of raising an error.

When the hook input has no session id, `session-stop.sh` writes no total. A
total spanning every session in the log would look plausible and be wrong, which
is worse than none.

`agent_type` — not `agent_name` — is the field carrying the agent name. See
`hooks-reference/hook-input-schemas.md`.

## Native activation and explicit fallback

Native activation requires installed-client verification. `.codex/hooks.example.json` is inactive; merge supported declarations with existing host settings only when authorized. Event names above are adapter input vocabulary, not proof of native automatic delivery.

Run the explicit adapter for exact proposals, written paths, checkpoints and known delegated-artifact contracts. See [hooks.md](../../docs/codex/hooks.md) and [hook-input-schemas.md](hooks-reference/hook-input-schemas.md). Automatic toasts, per-response execution, source-client internal events, context delivery and background cancellation are not claimed. Missing verification remains PENDING.
