# Web Toolchain — Breaking Changes

Last verified against the upstream reference: 2026-10-29.

Version-specific guidance is package-specific. Read the project's lockfile first; do not assume the reference pins match an existing project.

- **Vite 8:** the upstream reference flags a major bundler transition. Check Vite's migration guide before carrying forward plugin or configuration options.
- **TypeScript 7:** the upstream reference notes changed defaults and removed deprecated options.
- **Vitest 5:** the upstream reference pins Node 22.12 or later for its toolchain.
- **Phaser 4:** renderer extensions and effects differ from Phaser 3; see `phaser.md`.

## Sources

- Vite migration guide: https://vite.dev/guide/migration
- TypeScript 7 announcement: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- Phaser 4 migration guide: https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md
