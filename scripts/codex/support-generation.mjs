import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { openSource } from './source.mjs';
import { safeProjectPath } from './safe-path.mjs';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sourcePins = new Map(Object.entries(JSON.parse(readFileSync(safeProjectPath(root, 'docs/codex/transform-source-pins.json'), 'utf8'))));
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : e.isFile() ? [resolve(dir, e.name)] : []);
}
export function supportTargets(selectedRoot = root, gitSource = openSource({root:selectedRoot}), overlayRoot = selectedRoot) {
  return ['scripts', 'hooks'].flatMap(group => gitSource.list(`.claude/${group}/`)).map(file => {
    const source = file.path;
    const target = source.replace(/^\.claude\//, '.agents/');
    const bytes = gitSource.read(source);
    let content = bytes.toString('utf8').replace(/\r\n/g, '\n').replaceAll('.claude/', '.agents/').replaceAll('CLAUDE_PROJECT_DIR', 'CGS_PROJECT_DIR');
    const transform_ids = ['normalize-lf', 'mirror-claude-paths', 'neutral-project-env'];
    if (source.startsWith('.claude/hooks/')) {
      content = content.replaceAll('".claude"', '".agents"').replaceAll('*/.claude|*\\\\.claude)', '*/.agents|*\\\\.agents)');
      transform_ids.push('native-hook-root-markers-v1');
    }
    const overlayPath = safeProjectPath(overlayRoot, 'docs/codex/overlays/helpers/'+basename(source)+'.json');
    if (existsSync(overlayPath)) {
      const patch = JSON.parse(readFileSync(overlayPath, 'utf8'));
      const sourceHash = createHash('sha256').update(bytes).digest('hex');
      if (patch.source !== source || patch.source_sha256 !== sourceHash) throw new Error('Helper overlay source mismatch: ' + source);
      if (patch.edits && (patch.anchor !== undefined || patch.replacement !== undefined)) throw new Error('Ambiguous helper overlay: ' + source);
      const edits = patch.edits ?? [{ find: patch.anchor, replace: patch.replacement }];
      if (!Array.isArray(edits) || !edits.length) throw new Error('Empty helper overlay: ' + source);
      for (const edit of edits) {
        if (typeof edit.find !== 'string' || !edit.find || typeof edit.replace !== 'string' || content.split(edit.find).length !== 2) throw new Error('Helper overlay anchor mismatch: ' + source);
        content = content.replace(edit.find, edit.replace);
      }
      transform_ids.push((patch.edits ? 'helper-overlay-v2:' : 'helper-overlay-v1:') + createHash('sha256').update(readFileSync(overlayPath)).digest('hex'));
    }
    const nativeChecks = { '.claude/scripts/skill-lint.sh': 'skill', '.claude/scripts/agent-check.sh': 'role' };
    if (nativeChecks[source]) {
      const kind = nativeChecks[source], expected = sourcePins.get(source);
      const actual = createHash('sha256').update(bytes).digest('hex');
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
    if (source === '.claude/scripts/story-status.sh') {
      const actual = createHash('sha256').update(bytes).digest('hex');
      if (actual !== sourcePins.get(source)) throw new Error('story-status source drift');
      const anchor = 'cd "$(dirname "${BASH_SOURCE[0]}")/../.." 2>/dev/null || { echo "STORIES      none"; exit 0; }';
      if (content.split(anchor).length !== 2) throw new Error('story-status root anchor changed');
      content = content.replace(anchor, '# CGS_STORY_ROOT_V1: explicit selected project or the helper repo.\ncd "${CGS_PROJECT_DIR:-$(dirname "${BASH_SOURCE[0]}")/../..}" 2>/dev/null || { echo "story-status: cannot read selected root" >&2; exit 1; }');
      transform_ids.push('story-status-selected-root-v1');
    }
    return { source, target, content, transform_ids, owner: 'CGS-25' };
  });
}
