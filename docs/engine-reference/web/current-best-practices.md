# Web Games — Current Practices

Last verified against the upstream reference: 2026-10-29.

Reference reviewed: upstream Web setup notes, 2026-10-29. Confirm all versions against the project's lockfile before relying on these details.

- Treat `package.json` scripts and the lockfile as the source of truth for build, test, run and dependency versions.
- Keep browser-specific code in the configured code root and avoid assuming a native editor or runtime exists.
- Separate build success, automated test results and observed browser behavior in reports.
- For Phaser 4, consult `phaser.md` before using renderer, filter, mask or pipeline APIs carried over from Phaser 3.
- For touch-first games, test pointer sizing, viewport scaling and orientation in a real mobile browser; desktop emulation is not device proof.

## Sources

- Vite guide: https://vite.dev/guide/
- Phaser documentation: https://docs.phaser.io/
- Phaser 4 migration guide: https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md
