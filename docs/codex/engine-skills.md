# Optional external engine Skills

The documentation-only MVP provides a pinned Godot4.x package. Native CGS
guidance still supports Godot, Unity and Unreal; the external catalog currently
has no approved Unity or Unreal package. Missing entries and unverified editor
versions are reported, not treated as compatible.

External packages contain only SKILL.md, bundled Markdown references and the
complete pinned MIT LICENSE. The installer never runs downloaded scripts,
clones a repository, installs an engine or changes host permissions.

## List and inspect

Run from the toolkit checkout, selecting the actual game root:

    node scripts/codex/engine-skills.mjs list --root GAME_ROOT

Listing is offline. It distinguishes first-party, registered/unregistered user,
and externally managed Skills. It reads effective engine settings using the
existing configuration helper. No editor executable runs by default.

For compatibility checks, explicitly select a trusted installed Godot binary:

    node scripts/codex/engine-skills.mjs list --root GAME_ROOT --exe ABSOLUTE_GODOT_BINARY

The probe must match the configured engine/version. A missing helper/editor,
an incompatible version, or an engine without an implemented probe remains
NOT ASSESSED and blocks application. On Windows, quote paths containing spaces.
Host execution permissions still apply; the CLI does not elevate itself.

## Review a plan before approving any install

All four commands (list, plan, install, update) avoid package writes by default.
Install and update print a plan unless --apply is also present.

    node scripts/codex/engine-skills.mjs plan --root GAME_ROOT --id godot-gdscript-patterns --exe ABSOLUTE_GODOT_BINARY

The default is offline. A cache miss produces a BLOCKED plan with NEEDS_FETCH
files and does not trigger a network fallback. --offline or --network deny
makes that choice explicit; combining --offline with --network allow is refused.

To read the reviewed, immutable source into the ignored content-addressed cache:

    node scripts/codex/engine-skills.mjs plan --root GAME_ROOT --id godot-gdscript-patterns --exe ABSOLUTE_GODOT_BINARY --network allow

This downloads documentation only. It still installs nothing. Inspect:

- Source repository, immutable commit, version range and complete license.
- The review scope and limitations. Generic examples need project/version review;
  the catalog is not a certification of every engineering pattern.
- Every proposed path, current/incoming hash and full-document diff.
- Any local-modification or unmanaged-file conflict. When the old cache is
  available, the plan also shows base-to-local and base-to-incoming diffs.
- The READY status and exact approval hash.

For an agent, computing the hash is not permission. Obtain the owner's actual
approval of that concrete plan before executing --apply. Do not invent an
answer, silently approve a source, or infer consent from a mode or a cache hit.

After approval, repeat the same inputs with the printed hash:

    node scripts/codex/engine-skills.mjs install --root GAME_ROOT --id godot-gdscript-patterns --exe ABSOLUTE_GODOT_BINARY --apply --approve REVIEWED_PLAN_HASH

The cache is sufficient for this offline application. Changes to project/local
configuration, root instructions, managed targets, catalog, source content,
compatibility facts or manifest invalidate approval.
The command returns written relative paths and an ignored recovery-record path.

## Updates and local edits

A maintainer must review a new catalog revision, including its immutable commit,
file checksums, references and license. The tool never tracks a floating main
branch, searches for a latest release, or switches source repositories.

    node scripts/codex/engine-skills.mjs update --root GAME_ROOT --id godot-gdscript-patterns --exe ABSOLUTE_GODOT_BINARY

An unchanged package is a byte-identical NO_OP. New pinned content needs an
explicit network choice if absent from cache and a fresh approved plan.
An existing user/native directory is never adopted or overwritten. Modified,
missing or unmanaged imported files block updates. Three-way information is for
review; the tool does not automatically merge local edits or delete removed
documents. Resolve that migration deliberately, preserving local work.

404/deleted sources, bad checksums, malformed frontmatter, escaping references,
symlinks, unsupported files and suspicious operational instructions are refusals.
The instruction screen is finite and conservative, not a proof that arbitrary
text is safe. Imported instructions remain subordinate to user/project policy
and inherit the session's permissions/model.

## Ownership and integrity

First-party and user-authored native entries stay in
docs/codex/generation-manifest.json. External provenance lives separately in
.codex/external-engine-skills.json: source URL/commit, package version, engine,
license/hash, install path and hashes for every installed file. It contains no
machine-specific executable path, credential or run transcript.

The manifest records update_status: AT_REVIEWED_PIN for the last applied approved
pin. Offline listing compares that pin with the current reviewed catalog and
reports a newly reviewed pin, source-review requirement or local changes. This
status does not claim that an online latest version was queried.

The normal validator accepts only the external manifest's safe, disjoint paths,
checks their hashes and native Skill format, and continues checking every native
target, model-policy entry and behavior-spec registration. Do not relabel external
packages as native-authored with --register-native or change native hashes just to
hide external drift. CGS original-source synchronization remains a separate,
reviewed workflow and cannot silently adopt these external targets.

The complete MIT notice is retained beside each imported Skill. The catalog
contains links, identities and hashes; third-party bodies are fetched only after
an explicit network choice.

## Failure recovery

Application locks the selected project, rechecks approval/current bytes, and
keeps an ignored transaction backup before writing. Ordinary write or validation
failure restores every file this operation changed. Only its own empty
directories are removed, without recursive deletion. A concurrent user edit is
preserved and reported for manual reconciliation instead of being overwritten.

After interruption, do not blindly delete a stale lock or rerun with a different
approval. Inspect .codex-tmp/engine-skills-operation.lock and the matching backup
under .codex-tmp/engine-skills-transactions/. The backup records original bytes
and expected written hashes. Prepare a recovery diff, obtain any still-needed
authorization, restore only files whose current state is understood, then run
validation again. Crash recovery is deliberately manual; no unattended rollback
or uninstall command is promised.

Keep cache, backups and raw output ignored. Package manifests and reviewed
catalog changes are functional configuration, not execution reports.

## Tests and scope

    node tests/engine-skills.mjs
    node scripts/codex/validate.mjs
    node scripts/codex/ci.mjs

The deterministic filesystem suite uses synthetic source/editor inputs and
mocked network responses. It covers initial install, no-op, update, approval,
version/offline/source/frontmatter refusals, user conflicts, checksum integrity
and rollback, including concurrent edits. It does not install a real third-party
Skill, invoke a paid model or certify third-party engine examples. Live source
plans/editor probes are separate opt-in checks.
