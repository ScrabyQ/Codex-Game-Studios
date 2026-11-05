# CGS-07 bounded native-role diagnostic

Observed 2026-11-05 with Codex CLI 0.148.0 and explicit `gpt-5.6-luna` selection. **Custom-role spawning remains PENDING.** Two isolated read-only probes were performed; neither spawned a child. Existing disclosed EQUIVALENT in-session behavior remains valid and is not upgraded to native-role verification.

## Observations

| Probe | Fixture role files | Invocation difference | Actual runtime outcome |
|---|---:|---|---|
| technical-director | All 49 original TOMLs, byte hashes recorded | `--enable multi_agent_v2` | Router error: `unknown agent_type 'technical-director'` |
| technical_director | Same 49 originals plus one alias with identical full instructions and an underscore name | Same v2 setting | Router error: `unknown agent_type 'technical_director'` |

Both used `exec --ignore-user-config --ephemeral --strict-config --sandbox read-only`, the existing Windows elevated sandbox implementation, and no generic-role fallback. CLI exited zero and fixture hashes remained unchanged in both cases. These harness assertions are **not successful delegation evidence**: the saved response and router stderr establish unknown-type failures; there is no successful spawn/type/handle/child-result trace. The stderr errors are runtime evidence, beyond the model merely claiming a type unavailable.

Local `features list` reports `multi_agent=true`, `multi_agent_v2=false`; a process-local `--enable multi_agent_v2` reports both true. Therefore v2 enablement alone did not make project custom types available in these fixtures. An underscore alias alone also did not solve it. This does not identify the underlying loader cause or prove that v2 is unnecessary in other configurations.

## Documented prerequisites and unresolved configuration

Current official documentation defines standalone custom TOMLs in project `.codex/agents/`, requires `name`, `description`, and `developer_instructions`, and identifies the role by its name field. Roles inherit parent permissions; supported capability toggles include `features.shell_tool=false`. The fetched page does not state a `multi_agent_v2` requirement. [Official subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Official configuration guidance requires trust before loading project `.codex/` configuration layers. [Official config basics](https://learn.chatgpt.com/docs/config-file/config-basic). Local `exec --help` says `--ignore-user-config` omits the user config while retaining authentication. Whether this fixture's missing custom types are specifically caused by trust-layer omission remains **unverified**: neither probe emitted an explicit trust rejection or a role-file parsing error. We did not change trust/settings, bypass permission checks, or retry against a different trust regime.

The creative-director shell restriction was not probed because custom-role loading never succeeded. Its TOML declaration remains structurally verified, with native enforcement PENDING. No global settings, generated roles, central metadata, upstream files, or external state were modified. The fixture-only alias was an input to the second test, not a repository migration change.

## Evidence and bounded reproduction

- `native-v2-environment.json`: CLI observations, 49 original-role hashes, official references and explicitly unverified hypotheses.
- `native-v2-technical.json`, `native-v2-underscore.json`: exact invocation, prompt, fixture hashes, response, router stderr and harness assertions.
- `native-v2-assessment.json`: semantic outcome separated from harness PASS, including preserved-original and no-write assertions.
- `scripts/codex/cases/cgs07-v2-technical.json` and `cgs07-v2-underscore.json`: reproducible isolated cases.

```powershell
node scripts/codex/native-smoke.mjs --case scripts/codex/cases/cgs07-v2-technical.json --model gpt-5.6-luna --output docs/codex/evidence/CGS-07/native-v2-technical.json --timeout 180000
node scripts/codex/native-smoke.mjs --case scripts/codex/cases/cgs07-v2-underscore.json --model gpt-5.6-luna --output docs/codex/evidence/CGS-07/native-v2-underscore.json --timeout 180000
```

No further native probes were performed. This diagnostic does not block the remaining skill migration work.
