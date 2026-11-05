# Starting Codex in the studio

Open a terminal at the repository root and run `codex`. Codex discovers the root `AGENTS.md` and, when working in the corresponding directory, its scoped `AGENTS.md`. For command-line use from a subdirectory, select that directory with `codex --cd <directory>` (or start there). Keep the repository accessible so parent instructions can be discovered. Consult the native CLI's `codex --help` for installed options and authentication setup.

The root instructions load compact policy and point to references as needed; they do not load all 49 agent definitions or 74 skills. Unlike Claude `@` imports, references in `AGENTS.md` are explicit instructions to read a file when relevant, not an automatic inline import. Source `.claude/docs/`, `.claude/rules/` and templates remain the current fallback until adapted mirrors and the rule selector are delivered. A reference to an upstream Claude skill is not evidence that a Codex skill is installed or runnable. Native hooks, rule selection and full skill migration are separate work and remain unverified here.

The primary config is `project.yaml`, with allowed personal overrides in `project.local.yaml`; legacy mirrors, rigor expansion and defaults follow the documented resolution chain. Settings and stage may change between sessions. The current template has no engine selected: configure a project before relying on engine-specific references. On recovery read `production/session-state/active.md` if it exists.

CGS-04 native discovery probes and their limits are recorded in `docs/codex/evidence/CGS-04/`. They check that instructions can be read from root and three subdirectories, not that all workflows, permissions, rules, or engine behavior work end to end.
