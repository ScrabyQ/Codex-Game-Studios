# CGS-24 evidence

`checks.json` records actual deterministic execution, runtime, command, fixture path, individual assertions, and adapter hashes. `parity.json` maps all 15 declarations and records all 18 source/target script hashes. Its native and Linux statuses remain separate from the fallback test result. Reproduce with `node scripts/codex/hook-tests.mjs` from the repository root; it creates disposable fixtures under ignored `.codex-tmp/` and never commits or pushes. Native shell startup may require the host's ordinary authorized execution path on Windows.

The test harness uses both normalized fixture protocol calls and actual Node CLI subprocesses. Dangerous command strings are inspected before a harmless sentinel stub; the CLI negative case additionally shadows Git with a local stub so a regression cannot push. The safe CLI case actually executes and writes its expected sentinel. Git init/add/remote are used only inside disposable fixtures to test staged JSON and destination inspection; commit and push commands are never executed.

`backend-proposal.json` is the exact source-hash-bound engine-reference adaptation proposed for the integrator-owned generator. Root-selector changes also belong to the generator, not direct edits of `.agents/hooks/`.

The optional `.codex/hooks.example.json` has seven supported event groups. No trust-store updates, active hook install, user Git hook installation, or permission bypass occurred. Its Windows launcher is exercised from a nested directory in a path with spaces. That verifies command execution, not Codex event activation. Trusted native event activation is PENDING. Notification is an explicit manual status fallback; artifact-contract checks require `expected_artifact` instead of pretending Codex transcripts use Claude's format. Linux execution is PENDING on this Windows host.

See [integration instructions](../../hooks.md) for protocol examples, dependency behavior, known conservative false positives, unsupported dynamic shell effects, and postwrite versus prewrite semantics.
