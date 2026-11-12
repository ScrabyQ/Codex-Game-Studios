# Web — Version Reference

Last verified against the upstream reference: 2026-10-29.

`engine.name: Web` describes a browser toolchain. It is not a single game engine. The project's package manifest and lockfile pin the actual packages; `engine.version` records its bundler version when applicable.

| Package | Reference version | Use |
|---|---:|---|
| Vite | 8.3.4 | Bundler and dev server |
| TypeScript | 7.0.2 | Optional project language |
| Vitest | 5.0.5 | Optional unit test runner |
| Playwright | 1.64.1 | Optional browser test runner |
| Phaser | 4.2.1 | Optional 2D game framework |
| PixiJS | 8.22.0 | Optional 2D rendering library |
| Three.js | 0.186.1 | Optional 3D rendering library |

These are upstream reference pins, not dependencies installed by this repository. Check the game's lockfile or installed package metadata before using version-specific APIs.

## Knowledge gap

The upstream reference dates these pins to 2026-10-29 and reports a May 2025 model knowledge cutoff. Vite 8, TypeScript 7, Vitest 5 and Phaser 4 are post-cutoff major versions. Read `breaking-changes.md` and the relevant library page before implementation.

## Sources

Pins and release notes are adapted from the upstream Codex Game Studios Web reference, which cites the npm registry and official project release notes. Phaser-specific changes and official links are in `phaser.md`.
