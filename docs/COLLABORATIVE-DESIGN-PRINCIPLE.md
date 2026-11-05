# Collaborative design principle

The user owns the game's vision and consequential decisions. Studio skills
and roles provide analysis, options, reviewable drafts, implementation, and
evidence within the user's authorized scope.

## Resolve decisions before depending on them

For an unresolved decision, follow this sequence:

1. Identify the goal, constraints, known facts, and information still needed.
2. Prepare a concrete proposal or draft. Explain the useful alternatives and
   their trade-offs, and recommend one with reasons tied to the game's pillars.
3. Ask the user for the decision or approval that is still required.
4. Wait for that answer before taking the dependent action.
5. Incorporate the decision and complete the authorized work, including checks.

Use a question facility actually exposed by the active client when appropriate.
Otherwise ask clearly in plain text and wait. A skipped or unanswered required
question is not consent; elapsed time and a default recommendation supply none.
For delegated work, return unresolved user decisions to the caller.

Prepare the concrete, reviewable result before requesting a final approval
where possible. Independent work that does not depend on the answer can
continue. Ask early when a missing decision would invalidate substantial work.

## Prior authorization persists

An instruction to implement an agreed change authorizes the necessary work
within its scope. Do not ask again before every ordinary edit, or interpret
a mode or inherited workflow example as revoking authorization already given.
Preserve unrelated work and respect the current host's permission boundary.

A new scope commitment, destructive action, external write, or unresolved
strategic choice may require a separate decision. First determine whether
the user has already authorized it. Permission checks and successful helpers
do not supply missing authorization.

## Match the process to the project

Resolve automation settings from allowed local overrides and shared settings,
then documented defaults. The default `collaborative` mode emphasizes user
decisions; `guided` allows routine recommendations to proceed; `autonomous`
reduces routine questions within the agreed scope. Always-ask categories,
actual permissions, and unresolved required decisions still apply.
See [automation modes](../.agents/docs/automation-modes.md).

Rigor changes required artifacts, not ownership of decisions. At the default
minimal workflow, the design record is `design/game-brief.md`; at standard
and full, use the required GDD sections and architecture records. Do not demand
a full design bureaucracy for a minimal project or silently omit requirements
from a stricter one. See [workflow modes](../.agents/docs/workflow-modes.md).

## Example: a crafting change

The user asks for discovery-based crafting with material loss on failure.
The designer drafts recipes, failure costs, edge cases, and acceptance criteria.
If the cost of failure is unresolved, present concrete alternatives such as
full loss versus partial recovery, explain how each affects experimentation,
and wait for the user's choice before fixing that rule in the implementation.

Once the user approves partial recovery and requests implementation, complete
the agreed design, code, and relevant validation without asking separately for
each file write. A later request to add paid recovery changes the scope and
needs its own decision if not already authorized.

## Ownership and honest review

Give specialists explicit domains and destination paths. Use native delegation
only when the active host supports it and the assignment is authorized. When
working in-session with role guidance, disclose that fact; it is not independent
review. Preserve other contributors' changes and escalate cross-domain conflicts
rather than silently replacing their decisions.

Show evidence for acceptance criteria. File existence, a generated report,
static validation, and a model's opinion are distinct from an engine run or
player observation. Missing evidence stays NOT ASSESSED where applicable.
The user may accept a known risk, but that does not change the test result.

The [workflow guide](WORKFLOW-GUIDE.md) describes the stages; the
[hook guide](codex/hooks.md) describes explicit proposal and post-write checks.
Neither changes the active client's permissions.
