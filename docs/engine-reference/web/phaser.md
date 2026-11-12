# Phaser 4 — Version Notes

Last verified against the upstream reference: 2026-10-29.

Reference pin: `phaser` 4.2.1. The upstream source reports Phaser 4.0.0 on 2026-04-10. A project using Phaser 3 must follow its own installed version instead.

Phaser 4 rewrote its renderer. Standard sprites, text and tilemaps are expected to remain broadly compatible, while renderer extension points and effects changed. Do not copy Phaser 3 rendering code into a Phaser 4 project without checking the migration guide.

| Phaser 3 pattern | Phaser 4 direction |
|---|---|
| WebGL pipelines and `setPipeline()` | Removed; custom rendering uses render nodes |
| `preFX` and `postFX` | Use the filter system |
| `Phaser.Geom.Point` | Use `Phaser.Math.Vector2` |
| `Phaser.Structs.Set/Map` | Use native JavaScript `Set` and `Map` |
| `roundPixels` assumed true | Defaults false; choose per-object vertex rounding where needed |
| Direct raw WebGL calls | Avoid; they can desynchronize renderer state |

For pixel art, verify pixel rounding and scaling at the target viewport and device pixel ratio. This is visual guidance; it does not replace a browser run and screenshot.

## Official sources

- Phaser 4 migration guide: https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md
- Phaser releases: https://github.com/phaserjs/phaser/releases
- Phaser 4.2.1 package: https://www.npmjs.com/package/phaser
