# Documentation work

Use `.agents/docs/templates/architecture-decision-record.md` for ADRs. Include Title, Status, Context, Decision, Consequences, ADR Dependencies, Engine Compatibility and GDD Requirements Addressed. Follow Proposed → Accepted → Superseded, preserving the applicable recorded acceptance decision and domain ownership. Stories that need an Accepted ADR remain blocked while it is Proposed. Use `$architecture-decision` and review related ADRs with `$architecture-review` within the authorized workflow.

`docs/architecture/tr-registry.yaml` owns stable requirement IDs linking GDD requirements to stories. Never renumber or reuse existing IDs; append new requirements and preserve retired IDs. `$architecture-review` maintains the registry. `docs/architecture/control-manifest.md` contains Required / Forbidden / Guardrails per layer and a date-stamped `Manifest Version:`. Stories embed that version; `$story-done` checks staleness. Preserve those contracts when editing architecture.

Resolve the engine from actual project settings, then consult `docs/engine-reference/<engine>/VERSION.md` and the relevant pinned reference before using an API. Missing sourced facts remain NOT SOURCEABLE or NOT ASSESSED as applicable. Select other path rules explicitly; this scope does not replace them.
