# Helper adaptation evidence

`helper-inventory.json` records the 35 scripts and 18 hook files, their mirrored paths and runtime verification status. An adapted file is not automatically a verified native integration. In particular, event payloads and lifecycle registration are part of CGS-24 and remain pending.

On Windows 11, Node 22 and Git Bash, `node scripts/codex/helper-tests.mjs` exited 0 in disposable projects. It checked stage and its mirror, checkpoint narrative and CRLF, story facts and missing inputs, ADR facts, registry IDs, receipt hashing, read/write guard observations, and a missing engine. The test runner's success and failure rows used synthetic shell exit codes and do not establish that an engine ran. Named paths with spaces were passed as separate arguments. A restricted PATH without a Claude binary was used for a story-facts run. An unavailable Bash executable produced an error.

`node scripts/codex/helper-tests.mjs --syntax` exited 0 for all 51 shell files; this is a syntax check, not a runtime or native hook protocol check. The AWK reader is exercised through configuration fixtures. The Godot script still requires engine verification. One intermediate ADR-status invocation returned exit 1 without diagnostic output; a repeat and the subsequent complete runs passed, so intermittent Windows process behavior remains a limitation.

The native structural checker tests malformed and valid Skill and role fixtures. It accepts the generated Codex frontmatter and generated role TOML subset; unsupported layouts are reported as not assessed or invalid, not silently passed. It does not implement every Claude-specific analysis in the original scripts. Source originals are untouched.

Config precedence, all nine rigor/automation combinations, invalid enum fallthrough, locked local settings, project.yaml preservation, BOM/CRLF and checkpoint behavior were previously checked under CGS-06; see `docs/codex/evidence/CGS-06/config-policy.json`.

Linux, real Godot/Unity/Unreal execution, native client hook registration, and the untested helpers identified in the inventory remain pending. The write guard emits observations; it is not an enforcement boundary. The read/write guards and event-hook copies do not prove host permissions or `.env` and binary protections are enforced. Callers must honor active host permissions and any separately verified guards.
