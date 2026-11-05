# Testing

Use Node.js 22 or 24 and Git. CI runs quick and backend checks on both versions, with Windows, Linux and macOS coverage on Node 22. Bash and Python 3 are required for the configuration and backend suites. Missing dependencies must produce a diagnostic; an unexecuted check is PENDING.

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

`node scripts/codex/generate.mjs --check --complete` validates the maintained native product offline. It does not regenerate bodies from an original checkout. Explicit importer fixtures exercise source reads, transformation families, source and overlay guards, and reviewed upstream changes separately. See [maintenance](upstream-sync.md) before accepting source updates or recording changed targets; do not change hashes merely to make a check green.

`tests/generator-negative.mjs` and the fixtures under `tests/fixtures/` are maintained test inputs. Negative tests must assert the refusal reason and preservation of unrelated content, rather than only a nonzero exit.

`tests/native-registration.mjs` exercises registration of newly authored Skills and roles without Git objects or source files, including invalid input, unrelated drift, structural rollback and later reviewed edits. These are authoring/integrity tests, not model-behavior tests.

The `studio-tests/` catalog contains written behavior specifications and review rubrics. Its existence is not a set of executed model tests. [Native criteria](studio-tests/native-criteria.md) describe the distinction.

## Optional engine and native-client runs

Engine integration is opt-in. Select an installed executable explicitly with `--exe`, the documented engine environment variable, or PATH; no author installation is assumed.

```powershell
node scripts/codex/engine-e2e.mjs --help
node scripts/codex/engine-e2e.mjs --engine godot --phase test
```

The engine harness copies minimal fixtures to temporary storage. Rendering uses synthetic engine input; it does not establish physical input, human feel, performance or export readiness. Unity and Unreal need their actual editor/toolchain, license and project prerequisites. Missing prerequisites stay PENDING.

Native model probes require an explicitly available model and a disposable fixture. Structural checks, in-session role reviews and synthetic tests must never be presented as native discovery, independent model review or human playtesting.

The opt-in cases in `tests/fixtures/native/` exercise `$help`, returning-user
`$start`, an unanswered `$settings` confirmation, and one explicitly approved
configuration change. Select a model actually advertised for your CLI/account:

```powershell
node scripts/codex/native-smoke.mjs --case tests/fixtures/native/help.json --model MODEL_ID --output native/help.json
```

Run other cases by replacing the filename. The runner creates a disposable local
clone without a remote and saves traces under ignored `.scratch/`. These cases
use the CLI's `--approve-for-me` mode; their read-only intent is checked by
comparing all fixture bytes. A separate `read_only` case can test the stricter
sandbox. On Windows that sandbox may reject shell startup even for reads;
report the failed attempt and use supported per-invocation review where allowed.
Never change global trust to make a probe pass.

CLI model catalogs can differ from the desktop host. Resolve the repository's
policy against actual capabilities, then record the selected ID, its source and
whether effort was overridden. A CLI `--model` argument or catalog default is
not independent attestation of the serving model or effective reasoning effort.
Test a custom role with a real separate child and its native role type; reading
its TOML in the parent is an in-session fallback. Preserve initial FAIL results
when correcting a fixture assertion and rerunning it. These paid/client checks
remain opt-in, outside ordinary CI.

## Contributions

Add regression source and small deterministic inputs. Send execution results to the PR, CI or issue tracker. Do not add task journals, raw traces, screenshots from test runs, credentials or machine-specific dumps to the product tree. Hygiene tests exercise both forbidden artifacts and legitimate configuration/test cases.
