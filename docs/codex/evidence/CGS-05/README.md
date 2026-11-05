# CGS-05 evidence

The generator uses the 05ad7c8 baseline inventory and refuses unknown, missing, or changed skill source paths; it writes only registered generated targets whose current raw bytes match their prior hashes, and refuses unregistered targets and `--force`. `--check` is read-only. `--family skills --names help` is the only skill generated so far; 74 source skills and their 112 resources are accounted, but all 74 migration entries remain PENDING. A mechanical candidate is not a behavioral port. Generated bodies and resource adaptations need individual review and tests. The registry also records verified CGS-26 reference and CGS-25 support outputs; their implementation and review are separate. Source-bound overlays are described in `docs/codex/overlays/README.md`.

Observed on Windows, Node 22.19.0 and Codex CLI 0.148.0:

- `node scripts/codex/validate.mjs` — exit 0; 74 skills accounted; 74 PENDING.
- `node scripts/codex/generate.mjs --family references --check` — exit 0 against 132 registered targets.
- `node scripts/codex/inventory.mjs --check` — exit 0.
- `node docs/codex/evidence/CGS-05/negative-tests.mjs` — exit 0 for the harness: new unmapped skill, malformed source frontmatter, edited target, stale overlay source hash, and bad overlay anchor each made the checker/generator exit 1; the edited target was preserved. A valid anchored overlay applied successfully (exit 0). Fixture was a disposable Git repository; see `negative-results.json`.
- `node scripts/codex/generate.mjs --check --force` — exit 1; unsupported option rejected.

`native-help.json` records a real native `$help` invocation that loaded the skill, but host policy blocked Bash, so the model correctly declined to fabricate a result. `native-help-fallback.json` records a separate native read-only run in a disposable minimal fixture with Godot 4.4 and a brief, no stories or helper scripts. The model read the actual config and catalog, correctly recommended creating stories, and reported unavailable helpers. Both exited 0. The latter used an explicitly instructed factual fallback, not a working Bash helper; it establishes one sample behavior, not full help coverage or all skills. The rerun with corrected mirror paths and native invocation transformation recommended `$create-stories` and cited the adapted catalog. CLI explicitly selected `gpt-5.6-luna` after the earlier `gpt-6-luna` HTTP 400; JSON events do not independently expose the selected model.

Native shell execution and Windows sandbox permissions, full dependency adaptation in resource files, native invocation of the other 73 skills, review-only permission behavior, model policy and engine workflows remain PENDING. Validator link checks cover relative Markdown links in generated SKILL.md files; they do not prove all dynamic references or commands are available. Reference and helper mirrors have separate owners. User authorization and runtime permissions remain authoritative.
