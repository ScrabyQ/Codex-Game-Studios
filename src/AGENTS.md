# Source work

Before using engine APIs, check the selected engine's pinned `docs/engine-reference/<engine>/VERSION.md` and relevant API reference; do not guess signatures. Resolve engine and `specialists` from project settings. Follow `.claude/docs/coding-standards.md` and select applicable `.claude/rules/` by path.

Document public APIs, keep gameplay values data-driven, and prefer dependency injection to singletons. Place gameplay tests under `tests/`; write tests first for new gameplay systems and cover formulas and edge cases. Verify UI changes with screenshots and compare actual to expected results. The resolved workflow governs ADR requirements: full for all decisions, standard for critical decisions, minimal uses the decision log. If committing is authorized, reference the relevant story ID or design document.
