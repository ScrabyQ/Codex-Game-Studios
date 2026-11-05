# Representative engine reviews

These are **in-session role reviews; not independent**. The relevant source role instructions, three synthetic fixtures and the repository's version references were read. They are not engine projects, do not establish editor or SDK availability, and were not compiled or run in an engine. No fixture was edited during review.

## Godot: GDScript specialist

`fixtures/godot-player.gd` has untyped state and an untyped function parameter/return, contrary to the specialist's explicit typing standard. It also resolves a node path on each frame, where the role calls for caching the reference. Recommend a typed, cached reference and verify behavior in the actual project; do not rewrite the fixture. The repository pins **Godot 4.7** in `docs/engine-reference/godot/VERSION.md`, whose installed-at-pin field says **NOT DETERMINED**. `current-best-practices.md` is version-specific; actual parser and editor behavior is **PENDING**.

## Unity: UI specialist

`fixtures/unity-ui.cs` writes the player's health from a UI update and uses a literal display string. The role directs UI to display state and dispatch actions, and user-facing text to localization. Hand the state mutation to the gameplay owner and request a localized label. The reference pin is **Unity 6.3 LTS**; `docs/engine-reference/unity/modules/ui.md` covers the UI Toolkit context, but the reference's installed-at-pin field says **NOT DETERMINED**. Compilation, binding, accessibility and runtime tests are **PENDING**.

## Unreal: replication specialist

`fixtures/unreal-network.cpp` subtracts the client-reported amount directly without any visible server-side validation. The role requires server authority and validation of the action and input. Request the relevant authority, bounds and rate-limit checks from the networking owner; this incomplete snippet alone does not prove how the real project routes RPCs. The repository pins **Unreal Engine 5.8**, and `docs/engine-reference/unreal/modules/networking.md` describes server-authoritative networking; the reference's installed-at-pin field says **NOT DETERMINED**. Compilation, replication and SDK tests are **PENDING**.

The observations are limited to these static fixture excerpts; no custom engine role was spawned, and no installed engine or API behavior is asserted.
