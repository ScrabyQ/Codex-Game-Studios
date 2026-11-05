# Starting Codex in a studio project

Open the repository in the Codex client you use. From a terminal, run `codex --cd <project-directory>`; consult `codex --help` for the installed client's options and authentication.

Inside Codex, invoke `$start` for onboarding or `$help` for the next step. These are conversation inputs, not PowerShell commands. If automatic discovery or a bootstrap helper is unavailable, ask Codex to read `.agents/skills/help/SKILL.md` and apply its documented factual read-only fallback. It must cite actual project settings and artifacts, report missing inputs and name the next Skill without silently invoking it.

Root and scoped `AGENTS.md` files provide compact policy. References are instructions to read relevant guidance; they are not automatic inline imports. Do not load every role or Skill into every prompt. Before relevant edits, select path policies explicitly:

```powershell
node scripts/codex/rules.mjs --path <repository-relative-path> --content
```

`project.yaml` is shared configuration; allowed `project.local.yaml` values override it. Configure the project and selected engine before relying on engine-specific references. Do not infer a completed phase from an unknown code root or an unavailable helper.

If the host cannot load a custom role or delegate work, read the selected role and disclose the in-session fallback. It cannot satisfy an independent-review requirement. Native role loading, client discovery and hook activation must be verified in the actual client; no universal client behavior is promised.

Bash-backed helpers need an available Bash and Python 3. `CGS_BASH` can select an installed Bash executable. On Windows, a nested client may be blocked separately from ordinary terminal commands. Report failures; do not weaken host permissions or change global trust to make a check pass. See [hooks](hooks.md) and [testing](testing.md).

After interruption or compaction, read the project's ignored `production/session-state/active.md` checkpoint when present. Helpers report observations, not quality verdicts. User authorization persists; unanswered required decisions are not consent.
