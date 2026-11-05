# Native interpretation of studio-tests

The tracked `studio-tests/catalog.yaml`, legacy Skill specifications and `quality-rubric.md` remain the source for names, categories, spec locations and the meaning of their written assertions. They describe the upstream Claude format and are not themselves a Codex runtime test. Do not edit or silently rewrite those files to make a native check pass.

For a requested Skill, find its catalog entry and read its named spec and category rubric. If an entry, spec, rubric, installed Skill or required input cannot be read, report the affected check **NOT ASSESSED**. An absent category is unassigned, not a zero-failure category. Spec assertions test the written instructions unless an actual separately recorded runtime fixture was executed.

For native frontmatter, run `node scripts/codex/native-helper-check.mjs skill NAME --root PROJECT`. It checks the generated frontmatter subset, including matching name and nonempty description; it rejects malformed examples. It does not implement every valid YAML shape or all seven upstream static checks. An unsupported shape or unreadable file is not a clean pass. Do not require Claude-only `argument-hint`, `user-invocable` or `allowed-tools` fields in native Skill frontmatter.

## Seven native-mapped static observations

Run these on the installed native Skill and all of its referenced phase files. Match the source Skill to its pinned source hash before using source metadata. If an input or check cannot be read, mark that check **NOT ASSESSED**; never convert missing data into zero failures.

1. **Frontmatter:** run the native structural helper. It checks the generated name/description subset, including a matching name and nonempty description. A clearly malformed field is a failure; an unsupported valid YAML shape or unreadable file remains NOT ASSESSED. Claude-only fields are not required.
2. **Phases:** count distinct phase-like or level-two headings across SKILL.md and its references, ignoring fenced examples. Two or more satisfy the legacy structural threshold; fewer fail it. An unreadable reference makes the count NOT ASSESSED.
3. **Outcome:** inspect actual declared outcomes and the skill's purpose. A review, audit or gate needs a meaningful verdict or severity vocabulary; absence fails. An artifact/value-only skill with no verdict gets the source's WARN, not an invented failure.
4. **Collaboration and writes:** inspect the generated capability ceiling and pinned source metadata, then locate the actual write/decision protocol in the body. A write-capable skill without a consent or authorization rule fails; a genuinely read-only skill may receive the source's warning when the language is absent. Existing user authorization persists; this check does not create an extra permission request.
5. **Handoff:** inspect the ending for a concrete follow-up or next-step path; absent handoff is WARN.
6. **Fork complexity:** inspect the pinned source metadata for fork context. If declared, five or more phase headings satisfy the source rule; fewer WARN. When the source does not declare fork context, record N/A, not a fabricated fork or warning.
7. **Argument guidance:** compare the source argument hint and the native contract's `Source argument guidance` with the modes in the body. Empty guidance or a mode mismatch is WARN. The legacy hint does not need to be native frontmatter.

The utility rubric's legacy U1 means **all seven** checks, not just valid frontmatter. Assess U1 only after each applicable native-mapped observation actually ran; for unrun Skills it remains **NOT ASSESSED**. U2 is evaluated only when a director gate applies; a skill with no gate is not assessed as if a gate ran. Preserve the rubric's other categories and meaning rather than turning the category into a made-up score.

For `skill-improve`, record a bounded candidate and actual before/after check outcomes. Preserve exact pre-edit bytes, show the specific diff, and restore only the authorized candidate change without discarding unrelated edits. A static change is not proof of better task behavior; no cyclic self-scoring or automatic rewrite loop is required.

Human playtest observations, actual test execution, and independent role review require their respective real evidence. A structural, written-spec, or category observation cannot substitute for any of them.
