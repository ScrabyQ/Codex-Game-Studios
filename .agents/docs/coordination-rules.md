
# Agent Coordination Rules

1. **Vertical Delegation**: Leadership agents delegate to department leads, who
   delegate to specialists. Never skip a tier for complex decisions.
2. **Horizontal Consultation**: Agents at the same tier may consult each other
   but must not make binding decisions outside their domain.
3. **Conflict Resolution**: When two agents disagree, escalate to the shared
   parent. If no shared parent, escalate to `creative-director` for design
   conflicts or `technical-director` for technical conflicts.
4. **Change Propagation**: When a design change affects multiple domains, the
   `producer` agent coordinates the propagation.
5. **No Unilateral Cross-Domain Changes**: An agent must never modify files
   outside its designated directories without explicit delegation.
6. **Read Design Docs by Section**: A brief names the sections an agent needs
   by heading. Find a heading in a GDD, ADR or the art bible with `rg -n "^#"` and read the required range; read a doc
   whole only when the task needs all of it, and say why. The explicit `read-guard` helper can refuse a whole-file read of a doc over 40 KB.
7. **External changes**: Preserve upstream history. Draft issues, pull requests or messages when authorization is unresolved; external writes require explicit user authorization.

## Model and delegation policy

Role tiers define domain responsibility. Consult [model-tiers.md](model-tiers.md) and `.codex/model-policy.json` when relevant; inherit the session unless a supported authorized override exists.

Delegate only when exposed by the host and authorized by the user or invoked workflow. No agent is always active and no complete hierarchy is spawned by default. Native role `developer_instructions` define responsibilities and capability ceilings, not permissions.

Give bounded briefs with objective, named input sections, owned paths, non-goals, inherited authorization, expected output, evidence criteria and escalation conditions. Preserve others' edits. Issue independent work before waiting where supported; keep dependencies sequential. Collect all results before dependent phases, surface BLOCKED immediately and return partial reports.

If delegation or role loading is unavailable, label an **in-session role review; not independent**. Required independent review remains PENDING. See [agent-teams.md](agent-teams.md).

## Authorization and decisions

Prior user authorization persists. Prepare a reviewable draft and ask when a decision or action still needs authorization. Use an exposed question facility when appropriate; otherwise ask in plain text and wait. Skipped, dismissed and empty required answers are not consent. Modes do not grant or revoke permission. External writes require explicit authorization.
