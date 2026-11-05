# Setup requirements

Use [onboarding](../../docs/codex/onboarding.md) for supported installation and entry points.

| Requirement | Purpose |
| --- | --- |
| Codex client with repository Skills support | Discover `.agents/skills/*/SKILL.md`; verify actual discovery in that client |
| Node.js | Run `scripts/codex/*.mjs` adapters and checks |
| Git | Versioned work and optional external source review |
| Bash | Applicable `.agents/scripts/` and `.agents/hooks/` backends; Git for Windows supplies Bash on Windows |
| Python 3 | Applicable configuration/data parsing and validation |
| Selected engine and test framework | Corresponding real parse, build, test and render checks |

Use `CGS_BASH` for a nondefault Bash. Resolve engine/version from project state and consult `docs/engine-reference/<engine>/VERSION.md`. A missing editor, SDK or runner is a limitation, never a passing build.

## Local preferences and client settings

Allowed personal preferences belong in ignored `project.local.yaml`. [Config resolution](config-resolution.md) defines the whitelist and full precedence; locked settings remain shared in `project.yaml`. Do not seed the six rigor-fronted knobs.

Supply communication style, shell/interpreter paths, editor preferences and personal shortcuts in conversation or the installed client's supported personal instructions. Model choices and context controls depend on that client/account. This repository does not automatically load a personal Markdown override or source settings JSON.

Manage host permissions in the actual client's settings. Preserve existing configuration. Permission modes, automatic edits, hook events and notifications are not portable promises. Workflow/automation choices never change host permissions or revoke prior user authorization.

## Explicit hooks

Use [the hook adapter contract](../../docs/codex/hooks.md). Check exact proposals before authorized shell/file changes and validate affected paths afterward. `.codex/hooks.example.json` is inactive until installed and tested; native activation/payload behavior are separate client checks.
