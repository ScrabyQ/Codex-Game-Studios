# $setup-engine — Web projects

Use this path when `engine.name` is `Web`. Web means a browser game toolchain, not a single runtime library. The project package manifest and lockfile define its actual bundler, language, game library, scripts and versions.

## Existing project

If `package.json` exists, inspect it and its lockfile. Preserve its dependencies, scripts and source layout. Do not convert the project or replace its lockfile. Record the actual package manager, build/run/test commands, code root, language, bundler and browser library. If the code root is not `src/`, record its relative path in `engine.code_root`. If a test root is explicit, record it as `engine.test_root`.

Use the project's own scripts for `commands.build`, `commands.test`, `commands.run` and `commands.smoke`; omit commands the package does not define. Do not infer a passing test runner from an absent script. The package manifest is authoritative for Phaser, PixiJS, Three.js and other libraries.

## New browser game

Recommend Vite with TypeScript for a new project. For a 2D game, Phaser is an optional starter library; plain Canvas 2D remains a smaller option. The framework currently documents the Vite and Phaser toolchain but does not generate or install a game project. Show the proposed commands and files before creating a project or installing packages. Never overwrite existing project files or rewrite an existing lockfile.

Before writing `project.yaml`, confirm these values from the project choice:

```yaml
engine:
  name: Web
  version: "<Vite version from the project lockfile, when Vite is used>"
  language: TypeScript
  code_root: src
  rendering: "Phaser 4" # when Phaser is selected; otherwise record the actual renderer
  physics: none

specialists:
  code: lead-programmer
  shader: lead-programmer
  ui: lead-programmer
  additional: []
```

Do not record Phaser's package version as `engine.version`; it belongs in `package.json` and the lockfile. For an existing project with a different language, source root, renderer or test setup, record its actual values instead of these starter examples.

## Version-aware work

Read `docs/engine-reference/web/VERSION.md` and the relevant library page before suggesting version-specific APIs. The reference pins are guidance for new work; an existing project's installed version takes precedence. Phaser 4 is a major change from Phaser 3, so consult `phaser.md` before porting code or writing renderer and filter APIs.

Do not claim editor, browser-device or mobile-wrapper verification from a package build. A web build, automated tests and an observed browser run are separate evidence.
