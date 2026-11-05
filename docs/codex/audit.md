# CGS-01 upstream baseline audit

The source is the tracked Git tree at `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418` (commit date 2026-10-19T13:09:09+11:00, "Release 1.2.0 — the main path, rebuilt and tested"). At audit time HEAD and the locally recorded `upstream/main` both resolved to this commit; no fetch is implied. `LICENSE` in that tree is MIT, Copyright (c) 2026 Donchitos. The original tree and history have not been rewritten.

The inventory enumerates all 638 tracked blobs, including engine references, studio tests, scripts, templates, documentation, skeleton files and skill resources; SHA-256 is calculated over the exact Git blob bytes, not checkout bytes. `upstream-snapshot.json` pins commit/tree/license; `upstream-inventory.json` contains paths, blob IDs, hashes, categories, indicative purposes and static dependency flags. `migration-manifest.json` contains one entry per file plus one per hook declaration (653 total), with proposed destinations, verification and status. Every status is **PENDING**; a proposed destination is not evidence that a port exists. The task's TODO corresponds to the project-wide PENDING status. Future PORTED/EQUIVALENT/UNSUPPORTED entries require evidence, and unsupported behavior needs a reason in that evidence.

README's advertised counts match the relevant categories, but directory totals are wider:

- 49 agent definitions and 74 `SKILL.md` files; there are a further 112 skill resources.
- 15 command declarations in `.claude/settings.json` refer to 15 distinct handler scripts. `.claude/hooks/` has 18 scripts total: those 15, the two sourced helpers `yaml-helper.sh` and `update-check.sh`, and the opt-in `log-instructions.sh` diagnostic. Declarations are represented separately from their files.
- 14 rule files.
- 62 user-facing templates. The templates directory additionally has 8 guidance files and `SKILL-CONTRACT-TEMPLATE.md`, a skill-authoring template: 71 files altogether. Counting all files as user templates would inflate the advertised number.

Static flags locate `AskUserQuestion`, Agent tool patterns, Claude dynamic `!` backtick shell expansions, `CLAUDE_*` environment variables, model/tool frontmatter, imports and hook-protocol identifiers. They are lexical review aids, not proof of runtime dependence or an exhaustive semantic analysis. Review each flagged use: map questions to supported user interaction, Agent to permitted delegation, shell interpolation to explicit safe commands, Claude environment and imports to supported paths/instructions, and Claude model names to available model configuration; hooks need a verified event integration or documented manual/CI fallback. The matrix proposes targets and verification, not claims of feature parity. Other references can require adaptation even without a flag; manual review remains PENDING.

Reproduce from the repository root with Node.js and Git (the commit and all blobs must be present):

```powershell
node scripts/codex/inventory.mjs --check
```

Observed: exit 0, `PASS: 638 tracked files and 15 hook declarations accounted for`. This PASS covers baseline identity/completeness, not migration behavior. `--check` reads but never writes; it detects changed source blobs/inventory, missing or duplicate matrix IDs, missing mandatory fields and non-PENDING rows without evidence. It checks the pinned tree, not future upstream changes; compare/fetch upstream separately during a later sync. Initial generation uses `node scripts/codex/inventory.mjs` and intentionally fails if any output already exists, to avoid overwriting migration work.

Negative completeness check performed (Node v22.19.0):

```powershell
node -e "const fs=require('fs');let x=JSON.parse(fs.readFileSync('docs/codex/migration-manifest.json'));x.entries.pop();fs.writeFileSync(process.env.TEMP+'/cgs01-negative-manifest.json',JSON.stringify(x))"
node scripts/codex/inventory.mjs --check --manifest "$env:TEMP/cgs01-negative-manifest.json"
```

Observed: fixture creation exit 0; checker exit 1 with `Manifest header or entry count mismatch`. `git rev-parse HEAD` and `git rev-parse refs/remotes/upstream/main` each exited 0 and returned the pinned SHA. Actual adaptation, behavior tests, model mappings, event support and latest upstream drift remain PENDING.
