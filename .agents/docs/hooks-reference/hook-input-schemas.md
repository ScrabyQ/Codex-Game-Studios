# Explicit hook input contract

The adapter contract is [hooks.md](../../../docs/codex/hooks.md). Invoke `scripts/codex/hooks.mjs` explicitly.

A shell proposal is `{"tool_name":"Bash","tool_input":{"command":"git status --short"}}`. File payloads use `Write` or `Edit` with `tool_input.file_path` and content/replacement fields. Patches use `apply_patch` with patch text in `tool_input.command` or a freeform string. Every destination is checked. Unsupported critical payloads are refused.

Require exit 0 from `PreToolUse` before an already-authorized action. Call `PostToolUse` for actual affected paths afterward; it cannot undo a write. Advisory warnings returning exit 0 are not enforced prohibitions. Malformed input or completed denial is not success. A check never supplies authorization.

Lifecycle inputs use `session_id` and applicable `agent_type`, `agent_id` or `source`. Delegated-return checks receive the actual assignment's `expected_artifact`; without a known contract the check remains PENDING. `Notification` accepts `message` as explicit CLI status, not an automatic approval event.

Native registration, timeout behavior, output delivery, payloads and custom-role loading require installed-client verification. CLI invocation does not establish automatic native delivery. Capture observed exit/output and distinguish process failure from a finding.
