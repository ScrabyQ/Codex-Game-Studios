# Skill overlays

Use `<skill-name>.json` for reviewed, source-bound edits applied after mechanical transforms. `source_sha256` is the pinned Git-blob SHA-256 of that skill's `SKILL.md`. Each edit has `find` and `replace` strings, an optional positive integer `count` (default 1), and an optional `target` relative to the skill directory (default `SKILL.md`). Exact literal anchors must occur exactly `count` times; unknown targets, changed hashes, and mismatches fail without writing. The generator records the overlay SHA-256 among transform IDs. Example shape:

```json
{"source_sha256":"<64 hex digits>","edits":[{"target":"SKILL.md","find":"exact existing text","replace":"reviewed text","count":1}]}
```

Overlays do not permit overwriting a manually edited target: reconcile and register such changes separately. Source updates require reviewing and rebasing the overlay. Skill migration remains pending until review and behavior evidence exist.
