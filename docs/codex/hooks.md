# Explicit hooks and host integration

The adapter is `scripts/codex/hooks.mjs`; its backends live in `.agents/hooks/`. Native activation is optional and must be verified in the installed client. `.codex/hooks.example.json` is an inactive example, not an automatic registration or permission grant. Review and merge it with any existing host configuration rather than overwriting it.

## Explicit event commands

```powershell
node scripts/codex/hooks.mjs PreToolUse --root . --input proposal.json
node scripts/codex/hooks.mjs PostToolUse --root . --input written.json
node scripts/codex/hooks.mjs SessionStart --root . --input session.json
node scripts/codex/hook-tests.mjs
```

JSON may arrive on stdin instead. A shell proposal is `{"tool_name":"Bash","tool_input":{"command":"git status --short"}}`; `cmd` also accepts direct exec payloads. A patch uses `tool_name: "apply_patch"` with its patch text in `tool_input.command` or a freeform string. Explicit Read/Write/Edit payloads use `file_path` and their normal content/replacement fields.

Before an authorized shell action, `hooks.mjs run --root . --input proposal.json` checks that exact proposal and executes only an allowed command. Direct file actions remain the caller's responsibility: require exit 0 before the write, then invoke PostToolUse for the affected paths. Post-write validation cannot undo a completed write. A successful proposal check never supplies missing user authorization.

The backends require Bash and Python 3 for their applicable configuration and staged-data checks. Select a nondefault installed Bash with `CGS_BASH`. A failed process or essential dependency returns a diagnostic, not a successful check. Host execution and nested client execution are distinct; one working does not establish the other.

## Safety contract and limits

The explicit guard checks protected secret paths and Unreal binary assets, destructive Git operations, force pushes, upstream destinations, malformed JSON and ambiguous patch reconstruction. Every patch destination is inspected. Unsupported critical tool payloads are refused with an actionable reason. The complete `git remote set-url --push upstream DISABLED` configuration command is allowed; this is not permission for a chained push.

Registry removal and write-policy warnings remain advisory where the backend returns exit 0. Do not describe them as enforced prohibitions. PostToolUse inspects actual data bytes and reports naming/Skill-change observations.

This is a finite conservative detector, not a universal shell parser or replacement permission boundary. Aliases, encoded programs, indirect script effects, interactive stdin and unrelated specialized tools cannot be completely inferred. Shell-produced file changes need explicit affected paths and validation. Conservative false positives are possible. Native timeout/startup behavior may differ by client; only a completed explicit denial establishes a fallback denial. Do not weaken global trust or host permissions to suppress a failure.

## Lifecycle and review handoffs

Lifecycle inputs contain `session_id` and applicable `agent_type`, `agent_id` or `source`. SessionStart previews the ignored checkpoint and gaps; PreCompact records a checkpoint; Stop archives session state. These are observations, not phase verdicts.

At delegated return, call SubagentStop with `expected_artifact` from the actual assignment, then review its content. Presence alone does not establish quality. Without a known artifact contract the check remains PENDING; no unstable transcript parser is treated as a native contract extractor.

`Notification` is a manual CLI status with a `message` field. It does not invent an automatic approval event or native toast. Native custom-role loading and trusted hook activation require separate client verification; explicit CLI and in-session fallbacks must be labeled accurately.

Run results belong on stdout, in temporary/ignored storage, or in CI artifacts. See [testing](testing.md).
