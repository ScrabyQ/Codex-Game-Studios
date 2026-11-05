import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : e.isFile() ? [resolve(dir, e.name)] : []);
}
export function supportTargets() {
  return ['scripts', 'hooks'].flatMap(group => walk(resolve(root, '.claude', group))).map(file => {
    const source = relative(root, file).replaceAll('\\', '/');
    const target = source.replace(/^\.claude\//, '.agents/');
    let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replaceAll('.claude/', '.agents/').replaceAll('CLAUDE_PROJECT_DIR', 'CGS_PROJECT_DIR');
    const transform_ids = ['normalize-lf', 'mirror-claude-paths', 'neutral-project-env'];
    const nativeChecks = { '.claude/scripts/skill-lint.sh': ['skill', '6a66024bd66908915a76a21ad71fe3590278ef1b420b47aad889c99c243d3c8f'], '.claude/scripts/agent-check.sh': ['role', 'b8a1b78415ddc29760f21bb14f0c4502b0d49b8135ff70c7f2377c001cbb24f0'] };
    if (nativeChecks[source]) {
      const [kind, expected] = nativeChecks[source];
      const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
      if (actual !== expected) throw new Error(`Native validator source drift: ${source}`);
      content = `#!/usr/bin/env bash\n# Native structural observations; source-specific Claude analytics are not implemented.\n# Supports --root DIR.\nHERE="$(cd "$(dirname "$0")" && pwd)"\nexec node "$HERE/../../scripts/codex/native-helper-check.mjs" ${kind} "$@"\n`;
      transform_ids.push('native-structural-check-source-bound');
    }
    if (source === '.claude/hooks/yaml-helper.sh') {
      const anchor = 'if [ -z "${CGS_PROJECT_DIR:-}" ] || [ ! -f "$CGS_PROJECT_DIR/project.yaml" ]; then';
      if (!content.includes(anchor)) throw new Error('yaml-helper root anchor changed');
      content = content.replace(anchor, 'if [ -z "${CGS_PROJECT_DIR+x}" ]; then');
      const cdAnchor = '_yh_self_root=$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)\n      if [ -z "$_yh_self_root" ] || ! cd "$_yh_self_root"; then';
      if (!content.includes(cdAnchor)) throw new Error('yaml-helper lookup anchor changed');
      content = content.replace(cdAnchor, '_yh_self_root="${CGS_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." 2>/dev/null && pwd)}"\n      if [ -z "$_yh_self_root" ] || ! cd "$_yh_self_root"; then');
      transform_ids.push('explicit-project-root');
    }
    return { source, target, content, transform_ids, owner: 'CGS-25' };
  });
}
