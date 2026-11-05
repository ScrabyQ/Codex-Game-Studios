# Native studio test criteria

`studio-tests/catalog.yaml` maps installed native Skills and roles to written specs and category rubrics. Those maintained specs describe intended behavior. Their existence is not an executed model test; correcting source-client assumptions must preserve meaningful assertions rather than make current bugs pass.

For a requested component, read its catalog entry, named spec, matching rubric section, applicable native instructions and referenced phases. Missing or unreadable required inputs make the affected scope NOT ASSESSED. An unassigned category is not a zero-failure category. Native runtime discovery, static inspection, a model-guided fixture and an actual engine run are distinct observations.

Run `node scripts/codex/native-helper-check.mjs skill NAME --root PROJECT` or its `role` mode for supported structural checks. The helper checks a bounded native format subset; unsupported valid shapes require inspection, not a fabricated clean pass. Skills require matching name and nonempty description. Roles require matching name, description and developer_instructions. Optional model preferences, invocation policy and tool restrictions must be assessed against the actual host; source-client model/tool frontmatter is not required native metadata.

## Seven static observations

1. **Identity:** check native metadata and component identity. Malformed supported syntax fails; an unreadable input or unsupported valid syntax is NOT ASSESSED until reviewed.
2. **Phases:** inspect distinct phase or level-two headings across the Skill and its referenced phases, ignoring fenced examples. Preserve the rubric's two-heading structural threshold; an unreadable phase makes the observation NOT ASSESSED.
3. **Outcome:** reviews, audits and gates need a meaningful declared verdict or severity vocabulary, including inability to assess when evidence is missing. A value/artifact-only Skill without a verdict receives WARN rather than an invented failure.
4. **Authorization and capability:** inspect the actual responsibility ceiling, read-only boundaries, decisions and writes. Write-capable instructions need an authorization rule; inherited permission is never expanded by a role or mode. Prior authorization persists, so this observation creates no extra confirmation request. A read-only Skill without write-consent wording may receive the rubric's warning.
5. **Handoff:** inspect the ending for a concrete follow-up or next step. Absence is WARN; recommending a Skill does not claim it ran.
6. **Branch complexity:** if the native instructions explicitly require separate delegated or isolated phases, inspect their actual phase structure and preserve the five-heading complexity warning. Otherwise record N/A. Source fork metadata cannot create a native fork or runtime setting.
7. **Arguments:** compare documented native invocation modes and argument guidance with the actual procedure. Missing guidance or inconsistent modes is WARN. No source-client argument-hint field is required in native frontmatter.

Utility U1 covers all seven applicable observations, not only frontmatter. Unrun observations remain NOT ASSESSED. U2 applies only where a director gate applies. Preserve the other category rubrics and their verdict ordering, evidence floors and failure meanings.

Default fixtures use minimal rigor and collaborative automation unless the case overrides them. Explicit sub-knobs outrank rigor; absent/unset-mode cases omit the fixture block and no local override exists unless declared. A case changing these assumptions must pin its setting and reason.

For Skill improvement, preserve exact pre-edit bytes and unrelated work, inspect a bounded diff, run actual before/after checks, and keep or restore only the authorized candidate change. A static score change is not proof of better task behavior. Use actual model/host execution for behavioral claims, a separate agent for independent review, actual engine execution for engine claims, and human observations for human playtests.

Run output belongs in temporary or ignored storage, CI, PR or the issue tracker. Do not track execution reports, raw traces or catalog tracking updates. See [testing](../testing.md).
