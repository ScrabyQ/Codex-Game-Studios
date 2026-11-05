# [SKILL_NAME] handoff contract

**Version:** [contract version]
**Updated:** [date]

**Skill:** `.agents/skills/[SKILL_NAME]/SKILL.md`
**Behavioral specification:** `studio-tests/skills/[category]/[SKILL_NAME].md`
**Metadata:** required `name` and `description`; optional invocation policy in `agents/openai.yaml`.

## Inputs consumed

| Input | Required? | Source and validation |
| --- | --- | --- |
| [artifact/settings] | [yes/no] | [real path, relevant sections, freshness/schema] |

## Files that must exist

[List prerequisites. An absent expected artifact is a finding; an unavailable input yields NOT ASSESSED when assessment is prevented.]

## Preconditions

[Resolved config/provenance, authorization, engine reference/version, dependencies and scope.]

Validate required input paths and types before starting. Name optional inputs and their documented fallback. An unset setting is different from an unreadable configuration file. If an enum or schema is invalid, record the diagnostic and use only the documented resolver behavior. Do not substitute a guessed input.

## Outputs produced

| Output | Destination | Consumer |
| --- | --- | --- |
| [artifact/response] | [actual path or caller] | [next Skill/role] |

## Output guarantees

[Required structure/identifiers, gate-specific vocabulary, skipped/unassessed scope. Distinguish observations from verdicts.]

## Immutability rules

[Files and identifiers to preserve; append/update conditions; preserve unrelated work. Existing authorization persists. Ask only for unresolved decisions or unauthorized actions after preparing reviewable work.]

## Hard and soft constraints

| Constraint | Kind | Detection | Response |
| --- | --- | --- | --- |
| [permission, immutable ID, required schema] | Hard | [actual check or review] | Stop the dependent action and identify the unmet condition |
| [preferred density, optional detail] | Soft | [observable criterion] | Apply the documented fallback and disclose the trade-off |

A hard constraint cannot be waived by an automation mode. A soft constraint cannot silently replace a required acceptance criterion. A schema written here documents the interface; it is not automatically enforced unless an implemented validator is named and executed.

## Valid and invalid examples

- Valid: [minimal input with required fields and the expected output shape].
- Invalid: [missing/invalid field], producing [specific diagnostic and affected scope].
- Interrupted: [partial output], with [checkpoint, preserved bytes and next safe step].

Use concrete project examples where available; placeholders in this template are not fixtures that have run.

## Validation and evidence

Name real structural checks, written specifications and category metrics. State command/model assessment, selected root, observed result and limitations. Written cases are not executed PASS. Record actual host/model for behavior; label in-session review as nonindependent. Unavailable native execution remains PENDING.

Run artifacts belong in temporary/ignored storage or CI artifacts. Do not invent TESTS.md, golden datasets, drift monitors or runners. Extend a real runner only when authorized and implemented.

## Handoff

[Next consumer, exact inputs, readiness, unresolved decisions and escalation path.]

List upstream and downstream dependencies in order. For example, story authoring produces an identified story for implementation, and completion review consumes that story plus actual evidence; recommending either Skill does not execute it. Specify which outputs are mandatory before the next phase, which can be partial, and which verdict blocks the dependency. A named artifact must exist and its contents must meet the contract; existence alone is insufficient.

If delegated work fails, retain completed authorized output, report the failed/unassessed scope, and retry only the bounded missing work when appropriate. Never invent an independent reviewer, passing runner, artifact or user decision to complete the handoff.
