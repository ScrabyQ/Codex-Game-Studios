# Runtime and maintenance architecture

Codex Game Studios provides project instructions, Skills, role definitions and deterministic tools. It does not install another agent runtime, scheduler or permission system.

## Runtime boundaries

- Root and scoped `AGENTS.md` files define project policy and point to relevant guidance on demand.
- `.agents/skills/` contains Skill instructions and resources. Execute documented bootstrap steps explicitly; do not assume shell preprocessing or inline imports.
- `.codex/agents/` contains role definitions. If the current host cannot load a custom role, read its instructions and perform a disclosed in-session fallback. That does not establish independent review.
- `.agents/scripts/` and `.agents/hooks/` provide Bash/Python backends; `scripts/codex/` dispatches them with explicit arguments, root selection and dependency checks.
- `.agents/rules/index.json` drives the explicit path selector. Scoped instructions and a selector are not automatic host enforcement.

Missing tools and unknown project facts remain visible. Helpers emit observations; the responsible reviewer evaluates acceptance criteria.

## Configuration and authorization

`project.yaml` is shared configuration. Resolve allowed `project.local.yaml` overrides, shared values, legacy mirrors, rigor expansion and defaults in that order. Invalid enums fall through with diagnostics. Do not seed settings derived from rigor.

Model preferences live in `.codex/model-policy.json`; actual host capabilities determine whether an override is available. Unknown availability inherits the session model. Role instructions cannot grant permissions or weaken existing user constraints.

Authorization persists across steps. Ask only for decisions that remain required, and wait for a real answer. Automatic modes do not grant authorization. Never discard unrelated user changes.

## Integrity and maintenance

The maintained native files in `.agents/` and `.codex/` are the product source of truth. Normal validation and generation checks inspect these files and versioned metadata without opening a source repository, fetching a remote or requiring historical Git objects.

The generation registry records target hashes and source provenance. Deliberately authored changes can be registered with `generate.mjs --record-native --targets <comma-separated-paths>` after review; unrelated drift is refused and failed validation restores metadata. This records integrity, not a new behavioral acceptance.

The separate importer reads an explicitly selected repository and ref through Git objects. Its five transformation families produce review candidates outside the product; they do not overwrite canonical native files. Upstream synchronization compares source commits and prepares a product branch for reviewed adaptation, without merging the original tree. Component coverage is derived from current metadata and discovered files, rather than fixed totals in algorithms.

The [upstream guide](upstream-sync.md) describes source inspection and review. Source provenance is separate from runtime behavior: preserving a file or matching a hash does not establish a successful model or engine run.

## Verification and transient state

Use [the maintained test commands](testing.md). Test source and minimal fixtures are versioned; run output belongs on stdout, in temporary or ignored storage, or in Actions artifacts. Historical execution dumps and task journals are not product dependencies.

Project checkpoints and role memory use ignored runtime directories. Explicit lifecycle CLI actions can assist recovery, but native hooks remain optional until verified and trusted in the current client. See [hook contracts](hooks.md).
