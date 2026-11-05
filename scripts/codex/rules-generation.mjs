import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSource } from './source.mjs';

const defaultRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
function metadata(root, gitSource = openSource({root})) {
  return gitSource.list('.claude/rules/').map(f=>f.path.slice('.claude/rules/'.length)).filter(n => n.endsWith('.md')&&!n.includes('/')).sort().map(name => {
    const source = `.claude/rules/${name}`;
    const text = gitSource.read(source).toString('utf8').replace(/\r\n/g, '\n');
    const match = text.match(/^---\npaths:\n((?:  - "[^"\n]+"\n)+)---\n/);
    if (!match) throw new Error(`Unsupported rule frontmatter: ${source}`);
    const original = [...match[1].matchAll(/^  - "([^"\n]+)"$/gm)].map(m => m[1]);
    const patterns = [...original];
    for (const p of original) {
      const adapted = p.replace(/^\.claude\/agent-memory\//, '.agents/agent-memory/').replace(/^\.claude\/skills\//, '.agents/skills/').replace(/^\.claude\/agents\//, '.codex/agents/');
      if (adapted !== p) patterns.push(adapted);
    }
    const target = `.agents/rules/${name}`;
    const body = text.slice(match[0].length).replaceAll('.claude/agent-memory/', '.agents/agent-memory/').replaceAll('.claude/skills/', '.agents/skills/').replaceAll('.claude/agents/', '.codex/agents/').replaceAll('.claude/docs/', '.agents/docs/').replaceAll('.claude/rules/', '.agents/rules/');
    const note = '> Selected on demand by `node scripts/codex/rules.mjs --path <repository-relative-path>`. Source collaboration and permission language is historical guidance; current user authorization and host permissions govern. This rule does not itself enforce access controls.\n\n';
    return { id: name.slice(0, -3), source, target, patterns, content: note + body };
  });
}
export function ruleTargets(root = defaultRoot, gitSource) {
  return metadata(root, gitSource).map(({ source, target, content }) => ({ source, target, content, transform_ids: ['normalize-lf', 'scope-to-index', 'adapt-reference-paths', 'codex-permission-context'], owner: 'CGS-23' }));
}
export function ruleIndex(root = defaultRoot, gitSource) {
  const rules = metadata(root, gitSource).map(({ id, source, target, patterns }) => ({ id, source, target, patterns }));
  return { schema: 1, case_sensitive: true, match_semantics: 'Repository-relative paths; slash normalized; * and ? never cross a slash; **/ matches zero or more directories; {...} is alternation. All matching rules apply.', enforcement: 'On-demand selection only; this is not a host hook or a permission boundary.', rules };
}
