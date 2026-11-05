# Codex Game Studios

A community toolkit for building games with OpenAI Codex, from the first idea to tested builds and release preparation.

Adapted and maintained by [ScrabyQ](https://github.com/ScrabyQ). Built for solo and indie developers who want useful specialist guidance, repeatable workflows and quality checks that fit the size of their project.

## What you get

- **Skills for the whole development loop:** concepts, prototypes, systems design, architecture, implementation, testing, polish and release preparation.
- **Specialist role definitions:** design, programming, art, audio, narrative, production and QA, with guidance for Godot, Unity and Unreal Engine.
- **Project templates and shared configuration:** choose how much process you need while keeping decisions and dependencies clear.
- **Practical verification tools:** configuration checks, path policies, test helpers, safety checks and reproducible fixtures.
- **Native authoring:** maintain your own Skills and roles without an original-source checkout or a migration pipeline.

Use the parts your task needs. The toolkit does not automatically launch an entire team or grant agents extra permissions.

## Quick start

Have Git and a configured Codex client available. The documented helpers and automated checks also require Node.js 22+, Bash and Python 3. On Windows, Git for Windows supplies Bash; `CGS_BASH` can select a different installation. Engine editors and toolchains are needed only for their actual engine work.

```sh
git clone https://github.com/ScrabyQ/Codex-Game-Studios.git
cd Codex-Game-Studios
```

Open this folder in Codex and enter:

```text
$start
```

`$start` reads the project, walks through onboarding and recommends the next step. Use `$help` when you already have a project and want the next useful action. These are conversation inputs in Codex, not shell commands. No upstream remote or original client setup is required.

If your client does not discover the Skill, ask:

> Read `.agents/skills/help/SKILL.md` and apply its factual read-only fallback to this project. Cite the files you inspect and report unknowns.

See [onboarding](docs/codex/onboarding.md) for client and dependency details.

## How it works

Skills read relevant project state and guide a bounded task. Role definitions provide specialist responsibilities; use actual supported delegation when available, or a disclosed in-session fallback. An in-session fallback does not count as independent review.

Choose process depth through `modes.rigor`:

| Rigor | Typical approach |
| --- | --- |
| `minimal` | A game brief, a decision log and short build/test iterations |
| `standard` | System design, critical architecture decisions and broader checks |
| `full` | Comprehensive design and architecture artifacts with formal reviews |

Workflow requirements follow the resolved settings. Missing inputs and unavailable checks stay visible as NOT ASSESSED or PENDING. Helpers report observations; the responsible reviewer evaluates quality. Prior authorization persists, and unresolved required decisions still need an answer. Modes never grant permissions.

Follow the [workflow guide](docs/WORKFLOW-GUIDE.md) for the practical stages, quality gates and handoffs.

## Engine support and limits

| Engine | Toolkit guidance | Real execution needs |
| --- | --- | --- |
| Godot | GDScript, C#, shaders, scene workflows and engine test helpers | A suitable installed Godot editor and the project's test setup |
| Unity | C#, UI, shaders, assets and engine test workflows | The matching Unity editor, license and project dependencies |
| Unreal Engine | C++, Blueprints, GAS, replication, UMG and test workflows | A suitable Unreal project, editor, compiler and required SDKs |

Resolve the project's engine and consult its pinned [engine references](docs/engine-reference) before using APIs. Reference availability does not establish that an installed editor matches the pin.

Native Skill discovery, custom role loading and hook activation depend on the actual Codex client. The [hook example](.codex/hooks.example.json) is inactive until reviewed, installed and verified. Explicit CLI checks remain available. Structural tests do not prove model behavior, engine execution, visual quality or human playtesting; unperformed checks remain PENDING.

## Project structure

| Path | Purpose |
| --- | --- |
| [AGENTS.md](AGENTS.md) and scoped instructions | Project policy and relevant guidance |
| [.agents/skills](.agents/skills) | Skills and their phase resources |
| [.codex/agents](.codex/agents) | Native role definitions |
| [.agents/docs](.agents/docs) and [templates](.agents/docs/templates) | Workflow references and document templates |
| [.agents/rules](.agents/rules), [.agents/scripts](.agents/scripts), [.agents/hooks](.agents/hooks) | Selected path policies and explicit backends |
| [scripts/codex](scripts/codex) | Portable adapters, integrity and maintenance commands |
| [tests](tests) and [studio-tests](studio-tests) | Executable regressions, minimal fixtures and written behavior specs |
| [project.yaml](project.yaml) | Shared project settings |

## Configuration and customization

Shared settings live in `project.yaml`. Allowed values in ignored `project.local.yaml` override them; legacy mirrors, rigor expansion and defaults follow. Invalid enums fall through with diagnostics. See [configuration resolution](.agents/docs/config-resolution.md) before pinning individual settings that override rigor.

Roles inherit the parent session's permissions and model. The [model policy](.codex/model-policy.json) expresses preferences that are resolved against actual host capabilities.

Native files are maintained product sources. Reviewed edits use integrity checks; newly authored Skills and roles have a separate source-free registration workflow. See [contributing](CONTRIBUTING.md) for the policy, catalog and spec requirements. Keep game-specific designs and generated artifacts in your own game repository.

## Testing and contributing

From the repository root:

```sh
node scripts/codex/validate.mjs
node scripts/codex/ci.mjs
```

The maintained CI covers native structure, configuration, helpers, unsafe-action refusals, authoring and reviewed source updates. Written specs are not automatically executed model tests. See [testing](docs/codex/testing.md) for backend, engine and client checks. Keep run output in temporary or ignored storage, CI or PR; do not commit raw reports or machine-specific dumps.

For existing projects, read [upgrading](UPGRADING.md) before replacing customized files.

## Optional upstream maintenance

Maintainers can inspect and adapt original-source changes through a separate [reviewed Git import workflow](docs/codex/upstream-sync.md). It creates isolated candidates and product worktrees instead of merging the original tree. Ordinary installation and use do not require this setup.

## Credits and license

Based on the MIT-licensed [Claude Code Game Studios by Donchitos](https://github.com/Donchitos/Claude-Code-Game-Studios). The original copyright notice and [MIT license](LICENSE) are preserved.
