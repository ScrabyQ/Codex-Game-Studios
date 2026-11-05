# Six scoped in-session reviews

These are **in-session role fallbacks, not independent reviews**. The six generated skill instructions and the relevant generated role instructions were read; the observations below come from files in the disposable `.scratch/cgs16-audit-463824bf` fixture. The `standard` workflow, `lean` review mode and collaborative automation were resolved through the existing config helper. No report, code or data change was requested inside the fixture.

## Security audit — finding; broader audit NOT ASSESSED

`src/networking/damage.gd:4-6` marks a method `@rpc("any_peer", ...)` and subtracts the received amount from health without a visible server-authority check or input bounds check. The fixture explicitly configures multiplayer and online as true. The pinned `docs/engine-reference/godot/modules/networking.md` illustrates an any-peer request with server validation; this code does not show that protection. A caller who can reach the method may supply unexpected damage values. Treat authority bypass as a **HIGH candidate** for investigation under the source table, with multiplayer escalation applicable if confirmed. RPC reachability, an actual exploit, installed engine behavior, remaining categories and a ship verdict are **NOT ASSESSED**. Recommend server-side authorization and bounds validation, then retest; no exploit or fix was performed.

## Consistency check — CONFLICTS FOUND

`design/registry/entities.yaml:5-10` records `player_damage_base = 100`; `design/gdd/combat.md:9-10` states `140` in a standard-required Detailed Design section. The registry helper returned the entry and its declared source. The values conflict; this fixture does not establish which version should win, so review ownership/history before any correction. No registry or GDD was edited.

## Scope check — FAIL for this measured fixture

`design/gdd/sprint.md:3-7` lists four original scope items. The six `production/epics/sprint/story-*.md` titles and their `In Progress` states contain those four plus `craft` and `multiplayer-trading`. Two additions and zero removals produce `(6 - 4) / 4 = +50%`; the source's >25–50% band is **FAIL**. This is a comparison of the enumerated fixture scope, not a schedule estimate. Escalate the two additions for a user-owned cut or re-plan; no story was changed.

## Balance check — definite outlier; remaining domains NOT ASSESSED

`assets/data/combat/balance.json:2` sets `player_damage_base` to `140`. The intended range is `90–110` in `design/gdd/combat.md:10` and is also recorded as min/max in the registry. The value exceeds the upper bound by `30` (about `27.3%` of 110). This is an observed outlier, not a playtest-based balance conclusion. Damage rates, time-to-kill, progression, and multiplayer outcomes lack required inputs and remain **NOT ASSESSED**; do not infer an overall healthy verdict. Reconcile the intended source value with the design owner before a tuning edit.

## Design review — NEEDS REVISION in the checked scope

At `standard`, the numeric damage rule in `design/gdd/combat.md:9-10` requires a Formulas section, but the observed headings contain none. The acceptance criterion at line 19, “Combat feels balanced,” is subjective and not independently measurable. For example, a replacement could require the configured base damage to be within the agreed 90–110 range, once the conflicting intended value is resolved. Overview, Detailed Design, Edge Cases, Dependencies and Acceptance Criteria headings exist; their presence alone is not full quality approval. This review is in-session and does not substitute for an independent or full-mode specialist review. Do not update the GDD or review tracking without the relevant authorization.

## Content audit — EARLY in this narrow count

The MVP Combat overview at `design/gdd/combat.md:6-7` specifies three named enemies: slime, bat and moth. The actual fixture scan under `assets/` and `src/` found one enemy definition, `assets/data/enemies/slime.json`; the observed file count is 1/3 (33.3%), gap 2/3, so the source status band is **EARLY** and the MVP gap is high priority. A definition file is only an approximate content proxy, not proof that the enemy is playable or shipped; scene integration and other engine formats are **NOT ASSESSED**. No content was created.

## Verification and limits

The actual read-only observations used `config.mjs resolve`, `helper.mjs registry ... slice`, `helper.mjs story-status`, `rg` with line numbers, full file reads, and a recursive enumeration of the fixture's assets and source. `fixture-before.json` and `fixture-after.json` list the entire fixture's SHA-256 hashes; the comparison found no added, removed, or changed files. Review artifacts are stored outside the fixture in this evidence directory. These are focused defect demonstrations, not full autonomous skill runs, security certification, a playable engine build, or independent sign-off.
