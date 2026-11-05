# Codex Skill Authoring Contract

This compact contract is for a new Codex Skill. Use only frontmatter fields supported by the current Codex Skills specification. The minimal example below uses the required identity fields; add optional fields only after checking that specification. The preserved upstream Claude contract remains alongside this file as a source example.

## Minimal supported frontmatter

~~~yaml
---
name: [skill-name]
description: [one sentence describing when to use this skill]
---
~~~

## Authoring contract

- State the skill's purpose, trigger conditions, and boundaries in SKILL.md body text.
- Preserve its required inputs, outputs, checks, and approval boundaries.
- Keep referenced resources inside the skill directory or use stable repository paths.
- Do not assume dynamic shell preprocessing, Claude-specific tools, hooks, or model pins.
- For questions, use a facility exposed by the active client; otherwise ask in plain text and wait.
- Request only permissions needed for the documented workflow.
- Validate the skill with the current Codex tooling and record runtime evidence separately from structural review.
