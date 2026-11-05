# Source work

Resolve the engine and `specialists` from project settings. Before engine APIs, consult the selected `docs/engine-reference/<engine>/VERSION.md` and relevant reference; do not guess signatures. Follow `.agents/docs/coding-standards.md` and select applicable native path rules with `scripts/codex/rules.mjs`.

Document public APIs, keep gameplay values data-driven and prefer dependency injection over singletons. Resolve workflow before requiring ADRs: all architecture decisions at full, critical decisions at standard, and the decision log at minimal. If committing is authorized, reference the relevant story or design document.

Route code, shader and UI work through the configured specialist for the actual engine, using available delegation or a disclosed in-session fallback. `$setup-engine` maintains routing; an agent name is not proof of native availability.

Keep gameplay tests in `tests/`, scaffold with `$test-setup` when needed and authorized, and cover formulas and edge cases. Write tests first for new gameplay systems. Verify UI work with actual screenshots and compare observed to expected results. Structural checks alone cannot establish engine execution, visual quality or human playtest acceptance.
