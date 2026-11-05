# $setup-engine — Sections 8 and 8.5: Verify and Read Back

Resolve the selected engine and version from project configuration and read the corresponding docs/engine-reference/<engine>/VERSION.md. Check agreement without assuming an automatic import.

## 8.5 Read Back What You Just Wrote

Section 5.5.1's rendering/physics table warns against the two mistakes most
often made here, and it is still easy to make **both** of them, writing
`Forward+` and `Jolt` for a 2D browser game. Section 3's `Installed at pin time`
row is just as easy to drop silently, because a missing row leaves no trace.
Catch both by verifying the files after writing them:

```bash
bash .agents/scripts/project-coherence.sh
```

It compares `project.yaml` against `docs/engine-reference/<engine>/VERSION.md`,
against `project.godot`, and against the engine binary actually on PATH, and it
checks that the files `commands.build` and `commands.test` name exist.

**Report every `[DIFFERS]` line to the user and resolve it before finishing.**
Each one means two files this skill just wrote disagree, or describe something
that is not there.

One is expected on a new Godot project: `commands.test` names the gdUnit4
runner under `addons/gdUnit4/`, which `$test-setup` installs later. Report that
line as expected, name `$test-setup` as the step that clears it, and never edit
`commands.test` to make it go away. Every other `[DIFFERS]` line is resolved here.

**`[NOT CHECKED]` is not a pass.** Each such line names why a comparison could
not be made -- an absent binary, a missing `project.godot`. Say which ones
applied. A comparison that could not run has not established agreement.

The script emits observations and never a verdict, per the convention in
AGENTS.md. The judgement is yours and the user's.

---
