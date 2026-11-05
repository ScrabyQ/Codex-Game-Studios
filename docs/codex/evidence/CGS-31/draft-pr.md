# Adapt game-studio workflows for Codex with verified fallbacks

The original studio depends on Claude-specific metadata, imports, hooks and tools. This adaptation adds Codex Skills, scoped instructions, role definitions and explicit adapters while preserving the upstream Git history, original source, MIT license and Donchitos attribution.

- Accounts for all 638 original tracked files and 15 hook declarations: 653 migration rows, with 12 PORTED, 637 EQUIVALENT and four explicit UNSUPPORTED automatic integrations.
- Includes 74 Skills, 49 role definitions, 14 path rules, 62 templates and 15 hook-declaration fallbacks; 440 generated targets have guarded source/target hashes.
- Resolves configuration and rigor without seeding derived knobs; maintains recovery state and preserves existing authorization.
- Adds safe upstream detection, isolated no-commit merges, conflict recovery and reviewed reconciliation. Additions/deletions require explicit onboarding/retirement; no force push, automatic conflict choice or main merge.
- Documents setup on `codex/adaptation`, a verified read-only first-Skill fallback, engine limits and Windows troubleshooting.

Validation: [frozen candidate CI](https://github.com/ScrabyQ/Codex-Game-Studios/actions/runs/42046593063) passed quick checks and six Linux backend suites. Windows checks, actual published-clone installation, upstream conflict/reconciliation fixtures and a fresh Godot 4.7.2 import/parse/eight-assertion/render scenario are recorded in the [independent release checklist](https://github.com/ScrabyQ/Codex-Game-Studios/blob/codex/adaptation/docs/codex/evidence/CGS-31/release-checklist.md). The small start → story-done scenario uses the documented in-session fallback and existing portable source.

Limits remain explicit: native custom-role loading, trusted native hook activation, desktop/IDE discovery and some nested Windows commands are unverified. Unity's Editor was unavailable; Unreal lacked the required Windows SDK and its installed patch differed from the requested pin. Human playtests, physical input, export and universal model behavior are not certified. Four Claude automatic integrations remain unsupported; their source and documented alternatives are retained. See the [migration matrix](https://github.com/ScrabyQ/Codex-Game-Studios/blob/codex/adaptation/docs/codex/migration-manifest.json).

This is a draft for user review. The default `main` remains the original upstream snapshot. No official release or automatic merge is requested. Repository adaptation commits use `ScrabyQ <scraby2016@yandex.ru>`.
