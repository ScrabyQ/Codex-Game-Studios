# Focused native static, written-spec and category assessment

The selected target is `.agents/skills/bug-report/SKILL.md`, generated from the source-hash-bound overlay for `.claude/skills/bug-report/SKILL.md`. The five-skill generator check returned exit 0 after final regeneration. The native structural helper returned exit 0 for this actual generated target; the separately recorded deliberately malformed fixture returned exit 1. This is an in-session inspection, not an executed model workflow.

| Native-mapped static observation | Result and observed basis |
| --- | --- |
| 1. Supported name and description | PASS: `node scripts/codex/native-helper-check.mjs skill bug-report` returned `structural=ok`. The distinct malformed fixture was rejected. The helper checks only its supported YAML subset. |
| 2. Phases and references | PASS: an actual Node assertion found seven phase headings at target lines 28, 41, 106, 116, 150, 175 and 194. This generated skill has no references directory. |
| 3. Outcomes | PASS: target lines 140–144 and 184–190 contain verification outcomes and COMPLETE/BLOCKED write outcomes. |
| 4. Capability and authorization | PASS: the native execution contract at target line 10 records source capabilities and argument guidance; the write/update decision appears at lines 150–190. Existing explicit authorization remains valid. |
| 5. Handoff | PASS: the Next Steps phase starts at target line 194. |
| 6. Source fork metadata | N/A: source frontmatter does not declare `context: fork`; no fork is inferred. |
| 7. Argument guidance | PASS: source frontmatter line 4 and generated contract line 10 describe the modes; target phases implement description, analyze, verify and close guidance. Native frontmatter need not carry the source-only field. |

The assertions for observations 2–7 were executed over the actual source and target by a Node command with exit 0; they check stated patterns and do not claim deeper semantic execution. The focused inspection does not certify other catalog entries.

## Written specification

`studio-tests/catalog.yaml:569` selects `studio-tests/skills/utility/bug-report.md`. Its static assertions at lines 42–46 request frontmatter, phases, verdicts, write protocol and a handoff. The generated written instructions satisfy those selected assertions under the documented native frontmatter substitution: structural helper PASS, seven phases, explicit outcomes, write/update decisions and next steps. The spec's separate functional scenarios were not run as autonomous Skill executions. The synthetic bug reproduction and in-session report/triage evidence in README is a separate bounded exercise.

## Utility category

`studio-tests/quality-rubric.md:160` describes the utility category; lines 168–174 define U1 as seven static observations and U2 as applicable director-gate behavior. For this one target, U1's native-mapped observations were assessed above, including the N/A fork condition. U2 is N/A because the selected written spec explicitly states at line 52 that no director gates apply. Other Skills and unrun cases remain NOT ASSESSED. No numerical quality score or runtime verdict is inferred.
