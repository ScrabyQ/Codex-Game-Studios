# Validation before an authorized push

A push remains a separate explicitly authorized external action. This guide defines validation to perform before it; no Git hook is installed by this document. Use actual project commands, engine/version and runner configuration.

## Scope

For an ordinary development branch, assess the build, unit tests and critical smoke path. For `main` or `release/*`, include integration tests and applicable performance baselines. A narrower scope must name the omitted checks and its reason; it cannot be reported as full release readiness.

| Check | Required observation |
| --- | --- |
| Build | Actual selected engine/editor-target command, exit code and log; a missing editor/SDK is NOT ASSESSED |
| Unit tests | Executed runner, test counts, failures and zero-test detection |
| Integration | Actual integration runner on protected/release branches; missing runner is NOT ASSESSED |
| Smoke | Critical-path runner and observed output; apply `testing.strict.*` and the smoke gate's blocking default |
| Performance | Captured profile compared with project budgets/baselines; no invented metrics |

## Explicit execution

Inspect the project's `commands.test` and the test-run adapter interface. For example, after resolving the engine:

```powershell
node scripts/codex/helper.mjs test-run --root . godot --dry-run
```

This previews a Godot command; it runs no test and is not PASS. Remove `--dry-run` only for an authorized actual run with its dependencies available. Unity and Unreal use their selected runner and editor/build prerequisites. The helper reports observations: command, timeout, exit code, count/zero-test markers and engine-specific ladder row. `$smoke-check` applies the actual gate verdict.

Keep logs in ignored/temporary storage or CI artifacts. Report failed, skipped and unassessed checks by name. Never print “all gates passed” when a command is only a placeholder.

## Handoff

Build failures go to lead-programmer; test failures to qa-tester and the owning programmer; measured performance regressions to performance-analyst. Use authorized available delegation or a disclosed in-session review; independent checks remain PENDING if unavailable.
