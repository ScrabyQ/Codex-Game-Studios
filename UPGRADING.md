# Updating Codex Game Studios

Keep game content, custom roles, Skills and project settings under your own version control. Start with a clean working tree or preserve unrelated edits before updating; never reset or overwrite them to make an upgrade succeed.

## Product updates

For an uncustomized clone of this repository, fetch your `origin` and review the incoming Codex product changes before a fast-forward update. For a customized game project, use a separate review branch or worktree, compare the desired product revision and resolve conflicts deliberately. Do not copy the whole template over your game, replace local settings or automatically choose one side of a conflict.

Review root/scoped `AGENTS.md`, native Skills, role instructions, helpers, selected rules and their integrity metadata together. Preserve project-specific content and the original license. Shared settings are in `project.yaml`; only allowed `project.local.yaml` overrides apply. Follow [configuration resolution](.agents/docs/config-resolution.md), including legacy mirrors and rigor expansion, without seeding the six derived knobs.

Run [validation and relevant tests](docs/codex/testing.md), inspect actual output and the final diff, and record unrun client or engine checks as PENDING. Changes to registered native files need a deliberate selected hash update after review; see the [maintenance contract](docs/codex/upstream-sync.md). Do not change hashes simply to silence a failure. Commit and publish only within existing authorization.

Existing projects using old configuration files can follow the maintained [configuration migration guide](docs/migration-guide-v1.1.md). It describes the converter's actual dry-run, apply and finalize behavior; it does not require an original client tree.

## Importing original-source changes

Normal users need no upstream setup. Maintainers use [reviewed Git-source import](docs/codex/upstream-sync.md): fetch/select an explicit source ref, inspect every change, prepare a worktree from product HEAD, review candidates and mappings, then reconcile and test. No original-tree merge belongs in the product branch. The source mirror is a separate reference branch; these tools do not modify it.

Original project release history remains in Git and in the [upstream repository](https://github.com/Donchitos/Claude-Code-Game-Studios). Its client-specific installation and overwrite procedures are not Codex update instructions. No automatic main merge, history rewrite, force push or release is part of this guide.
