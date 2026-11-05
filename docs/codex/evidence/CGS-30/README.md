# CGS-30 documentation review

The README, upgrade guide, Codex onboarding and path guidance were revised additively. The original README and upgrade history remain in place and are explicitly labeled historical. MIT LICENSE was not changed. Upstream baseline observed locally during the initial review: `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`; HEAD then was `b9019d8d5688333fccddb1afc02a4c69ee9f1584`, with concurrent CGS-29 work. The integrator subsequently reported CGS-29 committed as `9baaf056150cb573eefb17e86b0c25191550e3bd`; the earlier command results below are historical observations, not assertions about the later tree.

- Matching rule selector for each edited path: exit 0, no matching rules returned.
- Explicit PreToolUse and PostToolUse checks: exit 0 outside the sandbox. Initial sandboxed PreToolUse failed because Git Bash could not create its Windows MSYS object; it did not authorize a write. No global trust or bypass was used.
- `codex --help`: exit 0 and reports `--cd`, with sandbox warnings about inaccessible temporary aliases.
- `node scripts/codex/check-upstream.mjs` and `node scripts/codex/sync-upstream.mjs --dry-run`: exit 0 against the locally fetched ref, same baseline and upstream SHA. The report separately listed a PENDING source entry; no fetch or merge was performed here.
- `git diff --check -- README.md UPGRADING.md AGENTS.md docs/codex/onboarding.md`: exit 0; Git reported a line-ending warning.
- Existing [help fallback evidence](../CGS-05/native-help-fallback.json) exercised a read-only Skill fallback in a fixture with CLI 0.148.0. It is not a new clean-machine test. A fresh clone at the eventual published commit, desktop/IDE discovery, native role and hook activation, Unity/Unreal execution and human playtests remain PENDING.

The documentation reviewer did not commit, push, merge or perform external writes. A final published-branch clean clone remains for the integrator to verify.

The initial review above is superseded for completion by the integrator's [acceptance](acceptance.md), [actual clean installation](clean-install.md), [setup guard regression](hook-fix.md) and [passing remote CI](remote-ci.json). The independent CGS-31 audit remains a separate requirement.
