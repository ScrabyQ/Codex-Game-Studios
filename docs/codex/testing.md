# Testing

Use Node.js 22 or later and Git. Bash and Python 3 are required for the configuration and backend suites. Missing dependencies must produce a diagnostic; an unexecuted check is PENDING.

From the repository root:

```powershell
node scripts/codex/validate.mjs
node scripts/codex/ci.mjs
node scripts/codex/hygiene.mjs
```

Validation checks component coverage, native formats, references and registered hashes. CI also executes configuration precedence, model policy, path rules, engine-role selection, unsafe-command denials, corruption cases, generator and upstream regressions. Expected component sets come from current metadata and discovered files. Exit 0 applies only to the suite that actually ran.

Backend integration can be run in a disposable checkout:

```powershell
node scripts/codex/backend-tests.mjs --disposable-checkout
```

Tests write transient results outside the tracked product. Confirm `git status --porcelain` has no unexpected changes after a run. CI artifacts are diagnostic output, not committed evidence or a permanent assertion that later revisions passed.

## Generation and upstream checks

`node scripts/codex/generate.mjs --check --complete` verifies the selected generation family. The full CI runner selects all applicable families and roles. See [maintenance](upstream-sync.md) before accepting source updates or recording changed targets; do not change hashes merely to make a check green.

`tests/generator-negative.mjs` and the fixtures under `tests/fixtures/` are maintained test inputs. Negative tests must assert the refusal reason and preservation of unrelated content, rather than only a nonzero exit.

The `studio-tests/` catalog contains written behavior specifications and review rubrics. Its existence is not a set of executed model tests. [Native criteria](studio-tests/native-criteria.md) describe the distinction.

## Optional engine and native-client runs

Engine integration is opt-in. Select an installed executable explicitly with `--exe`, the documented engine environment variable, or PATH; no author installation is assumed.

```powershell
node scripts/codex/engine-e2e.mjs --help
node scripts/codex/engine-e2e.mjs --engine godot --phase test
```

The engine harness copies minimal fixtures to temporary storage. Rendering uses synthetic engine input; it does not establish physical input, human feel, performance or export readiness. Unity and Unreal need their actual editor/toolchain, license and project prerequisites. Missing prerequisites stay PENDING.

Native model probes require an explicitly available model and a disposable fixture. Structural checks, in-session role reviews and synthetic tests must never be presented as native discovery, independent model review or human playtesting.

## Contributions

Add regression source and small deterministic inputs. Send execution results to the PR, CI or issue tracker. Do not add task journals, raw traces, screenshots from test runs, credentials or machine-specific dumps to the product tree. Hygiene tests exercise both forbidden artifacts and legitimate configuration/test cases.
