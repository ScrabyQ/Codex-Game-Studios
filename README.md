# Codex Game Studios

A community toolkit for solo and indie game development with OpenAI Codex. Adapted and maintained by [ScrabyQ](https://github.com/ScrabyQ).

```sh
git clone https://github.com/ScrabyQ/Codex-Game-Studios.git
cd Codex-Game-Studios
```

Open the folder in Codex and invoke `$start` for onboarding or `$help` for the next useful step. These are prompts in Codex, not shell commands. Ordinary use needs no original-source checkout or upstream remote. See [onboarding](docs/codex/onboarding.md) and the [workflow guide](docs/WORKFLOW-GUIDE.md).

Skills live in `.agents/skills/`, native role definitions in `.codex/agents/`, and shared settings in `project.yaml`. Resolve allowed local overrides and workflow defaults through the [configuration guide](.agents/docs/config-resolution.md). Modes do not grant permissions. Actual host capabilities determine native delegation and hook availability; a disclosed in-session fallback does not establish independent review.

Run `node scripts/codex/validate.mjs` and `node scripts/codex/ci.mjs` with Node.js 22+, Git, Bash and Python 3. Engine editors and toolchains are optional prerequisites for actual engine tests. Unrun client, engine and human checks remain PENDING. See [testing](docs/codex/testing.md), [upgrading](UPGRADING.md) and the separate [upstream maintenance guide](docs/codex/upstream-sync.md).

Based on the MIT-licensed [Claude Code Game Studios by Donchitos](https://github.com/Donchitos/Claude-Code-Game-Studios). The original copyright and [MIT license](LICENSE) are preserved.
