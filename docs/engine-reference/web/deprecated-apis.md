# Web Libraries — Deprecated and Removed APIs

Last verified against the upstream reference: 2026-10-29.

This reference tracks the Phaser 3 to Phaser 4 changes listed in `phaser.md`. Verify against the installed Phaser version before changing a project.

| Avoid in Phaser 4 | Use or check |
|---|---|
| `WebGLPipeline`, `setPipeline()` | Phaser 4 render nodes |
| `preFX`, `postFX` | Phaser 4 filter system |
| `Phaser.Geom.Point` | `Phaser.Math.Vector2` |
| `Phaser.Structs.Set`, `Phaser.Structs.Map` | JavaScript `Set`, `Map` |
| Direct raw WebGL state changes | Phaser's supported rendering extension points |

Source: https://github.com/phaserjs/phaser/blob/master/changelog/v4/4.0/MIGRATION-GUIDE.md
