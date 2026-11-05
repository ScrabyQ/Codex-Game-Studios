# Three specialist fallback reviews

These are **in-session role reviews; not independent**. The adapted instructions for gameplay-programmer, systems-designer, and qa-tester were read from the generated plans. No custom-role spawn occurred. The bounded brief was to inspect the three synthetic files in `fixtures/`, identify discrepancies and escalation, and make no changes to them. The design review used supplied file contents and did not run shell commands as that role. These observations are not engine, integration, or release tests.

## Gameplay programmer: code review

The design specifies normal damage is subtracted once and the result cannot fall below zero. `gameplay.js` doubles damage and never clamps. The observed call `(100, 10)` returned `80`, versus `90` under the stated normal-damage rule; `(5, 10)` returned `-15`, versus `0`. Negative damage was accepted and returned `100` from `(80, -10)`, although the design also says it must be rejected. The design contradicts itself about negative damage, so request a decision from systems-designer/game-designer before deciding that behavior. Hand the implementation discrepancy to gameplay-programmer; no gameplay change was made.

## Systems designer: design review

`design.md` says negative damage must be rejected and also says it restores health. Both cannot be the contract. Recommend retaining separate damage and healing actions, because the opening rule already defines them separately; alternatively, explicitly permit signed damage and define bounds. The design owner must choose. Escalate technical consequences to gameplay-programmer and unresolved design direction to game-designer. Do not invent a final mechanic or change the fixture.

## QA tester: test and defect review

The single existing test checks zero damage only. It exits 0 against this defective implementation, so it is not evidence that normal damage, clamping, or invalid inputs work. The direct observed calls above expose two unambiguous defects and one design-dependent behavior. Classify this as a Logic case; propose automated cases for normal damage (`100,10 → 90`), lower-bound clamp (`5,10 → 0`), zero damage, and negative input once the owner resolves the contradiction. The synthetic run supplies neither an actual build/platform nor a full project bug report; these remain **NOT ASSESSED**, and severity/release approval is not inferred. Route the code defect to gameplay-programmer and the test gap to QA ownership.

## Observations and limits

`node --experimental-default-type=module docs/codex/evidence/CGS-08/fixtures/gameplay.test.js` exited 0. A separate Node call returned the three actual values recorded above. Only the deliberately created evidence fixtures were read and exercised; they were not corrected. The successful zero case is intentionally insufficient. No independent child, native custom role, game engine, graphics, network, or engine SDK was tested.
