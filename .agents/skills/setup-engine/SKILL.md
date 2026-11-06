---
name: setup-engine
description: "Configure an engine and version in project settings, verify installed version, and maintain sourced engine references with user consent."
---

## Codex execution contract

**Runtime and consent:** Resolve the project root and run the explicit bootstrap. If a required helper fails, use a documented factual fallback only where precedence can be established; otherwise report NOT ASSESSED and stop that dependent step. Use native questions when available or plain text and wait for required decisions. Existing authorization and host permissions govern. Do not auto-run a recommended skill.

Resolve engine, version, language and specialist routing from project configuration; read the selected pinned VERSION.md on demand. Record the actual editor version, probe method and time in docs/project/engine-version.md when authorized. Preserve existing project files, scoped configuration changes, reference-update safeguards and coherence reporting. Never overwrite an existing Godot project or fabricate Unity/Unreal projects. Verify current release and licensing claims against official sources. Native Skills, roles and guidance are maintained product sources; project setup configures routing rather than editing those shared definitions.

Resolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: `Read, Glob, Grep, Write, Edit, WebSearch, WebFetch, Agent, user-question facility, Bash(bash "*/.agents/skills/setup-engine/../../hooks/yaml-helper.sh" resolve_config *), Bash(godot --version), Bash(godot --headless --path . --import), Bash(command -v godot), Bash(uname -s), Bash(bash .agents/scripts/project-coherence.sh*)`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: "[engine] | [engine version] | refresh | upgrade [old-version] [new-version] | no args for guided selection". 


# Engine Setup

When this skill is invoked:

**Explicit bootstrap (execute before using this output, from the resolved project root):** `bash ".agents/hooks/yaml-helper.sh" resolve_config --keys workflow`. If unavailable, report the missing dependency and do not invent results.

**Tier awareness.** The `workflow` tier resolved above governs which design
artifact this skill expects and the finish path it recommends in §12:
- **`minimal`** — the design artifact is the one-page `design/game-brief.md`
  (no GDDs, systems decomposition, or per-system design at this tier).
  `$setup-engine` runs *first* in the minimal path, so a missing brief here is
  normal, not a gap. The finish path is the 4-step floor.
- **`standard` / `full`** — the design artifact is `design/gdd/game-concept.md`
  and the finish path is the full pipeline.

If the bootstrap did not run or its output is unavailable, resolve the workflow through the documented configuration chain; if that cannot be established, report NOT ASSESSED and stop tier-dependent steps. Do not infer a default from a failed bootstrap.

## 1. Parse Arguments

Four modes:

- **Full spec**: `$setup-engine godot 4.7` — engine and version provided
- **Engine only**: `$setup-engine unity` — engine provided, version will be looked up
- **No args**: `$setup-engine` — fully guided mode (engine recommendation + version)
- **Refresh**: `$setup-engine refresh` — update reference docs (see Section 10)
- **Upgrade**: `$setup-engine upgrade [old-version] [new-version]` — migrate to a new engine version (see Section 11)

---

## 2. Guided Mode (No Arguments)

**Read `references/2-guided-mode.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 3. Look Up Current Version

**Read `references/3-version.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 4. Select engine and language

**Read `references/4-claude-md-stack.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 5. Populate Technical Preferences

**Read `references/5-technical-preferences.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 5.5 Populate `project.yaml` (Primary Config Store)

**Read `references/5.5-project-yaml.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 6. Determine Knowledge Gap

**Read `references/6-knowledge-gap.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 7. Populate Engine Reference Docs

**Read `references/7-reference-docs.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 7.5 Scaffold the Engine Project

**Read `references/7.5-scaffold.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 8. Verify engine and reference

**Read `references/8-verify.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 9. Verify Specialist Routing and Version Awareness

Resolve specialist routing from project settings and inspect the applicable native role definitions in .codex/agents/. Confirm the relevant role knows to consult the selected VERSION.md, deprecated APIs and relevant breaking changes, and verify uncertain APIs using available official sources. Report missing roles or guidance as NOT ASSESSED. Setup does not edit shared role definitions merely to configure a project; propose separate scoped maintenance if a defect needs correction.

### Optional external engine Skills

When the user asks to explore extra engine guidance, run:

    node scripts/codex/engine-skills.mjs list --root <selected-project-root>

Listing is offline and installs nothing. An explicit installed --exe permits
a version probe; a missing/unverified editor makes compatibility NOT ASSESSED.
The documentation-only MVP has one pinned Godot package; an engine with no
approved package must be reported as such.

Use [the external Skills guide](../../../docs/codex/engine-skills.md) for a
reviewable plan. Do not contact external sources without an explicit network
choice, or install/update without approval of the exact source, license, diff
and plan hash. Preserve user/native files and all conflict refusals. Imported
instructions grant no extra permissions and do not replace engine references.
Never auto-install these packages as part of setup or source synchronization.

---

## 10. Refresh Subcommand

If invoked as `$setup-engine refresh`:

1. Read the existing `docs/engine-reference/<engine>/VERSION.md` to get
   the current engine and version
2. Use WebSearch to check for:
   - New engine releases since last verification
   - Updated migration guides
   - Newly deprecated APIs
3. Update all reference docs with new findings
4. Update "Last verified" dates on all modified files
5. Report what changed

---

## 11. Upgrade Subcommand

**Read `references/11-upgrade.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## 12. Output Summary

**Read `references/12-output-summary.md` now and follow it** — this phase's steps are in that file, not here. Read it again if the conversation was compacted or resumed during this phase.

## Guardrails

- NEVER guess an engine version — always verify via WebSearch or user confirmation
- project.yaml is the shared configuration source. Resolve applicable local overrides and legacy fallbacks using the documented chain; do not change shared guidance merely to configure a project.
- NEVER overwrite existing reference docs without asking — append or update
- If reference docs already exist for a different engine, ask before replacing
- Preserve existing authorization; prepare a reviewable draft for unresolved decisions or actions outside it.
- If WebSearch returns ambiguous results, show the user and let them decide
- When the user chose **GDScript**: use the GDScript language choices in **A1** in `references/godot-language-config.md` exactly. NEVER add "C++ via GDExtension" to the Language field. GDScript projects may use GDExtension, but it is not a primary project language. The `godot-gdextension-specialist` in the routing table is available for when native extensions are needed — it does not make C++ a project language.

---

## Appendix A — Godot Language Configuration

Moved out of this file so it costs nothing on non-Godot runs.

**When the chosen engine is Godot, read**
`references/godot-language-config.md`
and use the subsection for the chosen language:

- **A1** — language reference examples (GDScript / C# / Both)
- **A2** — naming conventions
- **A3** — engine specialist routing and file-extension tables

**Load discipline.** On any engine other than Godot, **never load it** — nothing in Sections 4, 5 or 5.5 needs it, and reading it anyway spends the tokens the split exists to save. On Godot, read it once when you first reach Section 4 and keep using it for Sections 5 and 5.5; do not re-read it at each reference.
