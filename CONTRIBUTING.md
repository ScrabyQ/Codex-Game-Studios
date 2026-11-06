# Contributing to Codex Game Studios

Contributions can fix bugs, improve native skills and roles, strengthen adapters,
or correct guidance. For substantial features, discuss the workflow gap and
scope in an issue first. Keep game-specific designs and generated production
artifacts in the game's repository.

## Native source contracts

Skills live in `.agents/skills/<name>/SKILL.md`. Their required frontmatter
is `name` and `description`; do not require client-specific tool grants or
model fields. Invoke with `$name` or the available host skill UI. Helpers run
explicitly; imports and shell interpolation in skill text do not execute
automatically.

Role definitions live in `.codex/agents/<name>.toml` and require `name`,
`description`, and `developer_instructions`. Preserve documented domain
ownership, collaboration rules, and `shell_tool` ceilings. Use delegation only
when authorized and supported by the active client; disclose an in-session
role-guidance fallback and any missing independent review.

Model resolution uses `.codex/model-policy.json` and actual host/account
capabilities. Do not hardcode a model as guaranteed or broaden permissions
when a preferred model is unavailable.

For a newly authored Skill or role, prepare its native files, model-policy entry,
catalog entry, spec and references, then register the reviewed files without an
upstream source:

```powershell
node scripts/codex/generate.mjs --register-native --targets .agents/skills/example/SKILL.md --review "Reviewed native workflow and its spec"
```

Select a role TOML or multiple comma-separated files as needed, including newly
authored Skill resources. Registration checks all existing target hashes and
native structure, restores the registry on failure and records authored provenance.
It does not invent a migration result. Existing registered edits use
`--record-native --targets <paths>` after review. Neither action overwrites bodies.

Configuration changes must preserve precedence, provenance, invalid-enum
diagnostics, and rigor expansion. Do not seed the six rigor-controlled knobs
with defaults that shadow rigor. Consult `.agents/docs/` guidance relevant
to the change rather than preloading every role or document.

## Safe, reviewable changes

Read `AGENTS.md` and select matching path policies before editing:

```powershell
node scripts/codex/rules.mjs --path path/to/file --content
```

Check the exact proposed action and validate written files using
[the explicit hook adapter](docs/codex/hooks.md). Native hook activation is
PENDING until verified in the installed client. Preserve unrelated work,
secret-path restrictions, Unreal binary restrictions, and protected Git
operations. Backends must report missing essential dependencies and failures
honestly; never replace an unknown result with success.

For unresolved decisions, prepare a concrete draft, explain alternatives,
and wait for the required answer. Prior user authorization persists; do not
request confirmation again for each already-authorized routine edit. See
[the collaborative principle](docs/COLLABORATIVE-DESIGN-PRINCIPLE.md).

## Validation

Run the repository checks:

```powershell
node scripts/codex/ci.mjs
```

See [testing guidance](docs/codex/testing.md) for focused commands, dependency
requirements, CI artifacts, and client verification. Update affected reference
docs and examples with behavioral changes.

Static structure validation, helper/backend tests, and actual model/host
execution establish different things. Test a changed skill in an available
Codex session when possible; otherwise explicitly report that it was not
exercised by a model. Similarly, an explicit CLI hook test does not prove
native registration or event delivery. Include meaningful results and limits
in the PR, without committing generated runtime reports or evidence.

Use portable shell features; Bash helpers should avoid `grep -P`. Respect
documented dependency requirements rather than silently masking failures.
Do not submit secrets, private session logs, or machine-specific configuration.

## Pull requests

Keep each PR focused on a concrete problem and final behavior. Explain why the
change is needed, which contracts changed, how it was validated, and what
remains unassessed. Use the PR checklist where applicable. CODEOWNERS requests
review according to repository settings; it does not itself enforce approval.

Conventional Commit-style titles are useful, for example:

```text
fix: preserve invalid configuration diagnostics
feat: add a bounded asset review skill
docs: explain explicit hook verification
```

Do not commit or push without the user's authorization when working as an
agent. Normal contributors submit changes to this fork; optional provenance
and maintainer synchronization are documented in
[upstream sync](docs/codex/upstream-sync.md). A normal contribution needs no
historical source tree.

## Maintaining branch rules

The active `main` ruleset requires a pull request and passing `quick`,
`node24`, and the three `backend` checks for Ubuntu, Windows and macOS Intel,
provided by GitHub Actions. Require the branch to be current with `main`, block
force pushes and deletion, and resolve review conversations. Zero external
approvals lets a solo maintainer merge their own reviewed PR; no bypass actor
is needed. Keeping merge commits preserves the reviewed commit history.

Repository settings need the owner's separate approval. Before enabling or
changing a ruleset, inspect its exact branch, check names and provider, and save
the previous JSON outside tracked files. Validate a normal PR after the change.
If a workflow check is renamed, update the required context alongside the
workflow; otherwise the old name can leave PRs waiting indefinitely.

For recovery, the owner can open **Settings → Rules → Rulesets → Protect main**
and correct the specific context or rule. If temporary deactivation is needed,
obtain explicit approval, record the reason in the maintenance PR, restore the
ruleset, and verify the API and PR checks again. Agents must not disable rules
or add bypass actors merely to finish a merge. CI failures should be fixed in
the branch before merging.

If Actions reports that the repository or account is disabled while its
permissions remain enabled, follow [GitHub's Actions guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
and contact GitHub Support for review. Keep the required checks in place while
service access is restored; local results do not replace those server checks.
