import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// Stage one generated family without changing another task's working files.
// Never commits, pushes, resets, or removes anything.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const prefixes = process.argv.slice(2);
const allowed = ['.agents/docs/', '.agents/skills/', '.agents/scripts/', '.agents/hooks/', '.agents/rules/', '.codex/agents/'];
const inventory = JSON.parse(readFileSync(resolve(root, 'docs/codex/upstream-inventory.json'), 'utf8'));
for (const file of inventory.files.filter(f => f.category === 'skill')) allowed.push(`.agents/skills/${file.path.split('/')[2]}/`);
const git = (args, options = {}) => execFileSync('git', args, { cwd: root, encoding: 'utf8', ...options }).trim();
try {
  if (!prefixes.length || prefixes.some(p => !allowed.includes(p))) throw new Error('Pass explicit generated-family prefixes, including their trailing slash');
  if (git(['diff', '--cached', '--name-only'])) throw new Error('Index already contains staged work; review it before staging another task');
  const path = 'docs/codex/generation-manifest.json';
  const base = JSON.parse(git(['show', `HEAD:${path}`]));
  const current = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const selected = current.entries.filter(e => prefixes.some(p => e.target.startsWith(p)));
  if (!selected.length) throw new Error('No registered targets in the selected family');
  for (const entry of selected) {
    const hash = createHash('sha256').update(readFileSync(resolve(root, entry.target))).digest('hex');
    if (hash !== entry.target_sha256) throw new Error(`Unreconciled target: ${entry.target}`);
  }
  const merged = new Map(base.entries.map(e => [e.target, e]));
  for (const entry of selected) merged.set(entry.target, entry);
  base.entries = [...merged.values()].sort((a, b) => a.target.localeCompare(b.target));
  const blob = git(['hash-object', '-w', '--stdin'], { input: JSON.stringify(base, null, 2) + '\n' });
  if (!/^[a-f0-9]{40}$/.test(blob)) throw new Error('Unexpected Git blob ID');
  git(['add', '--', ...selected.map(e => e.target)]);
  git(['update-index', '--add', '--cacheinfo', `100644,${blob},${path}`]);
  console.log(JSON.stringify({ staged_targets: selected.length, prefixes, staged_registry_entries: base.entries.length, working_registry_entries: current.entries.length, working_tree_unchanged: true }));
} catch (error) { console.error(`stage-generated: ${error.message}`); process.exitCode = 1; }
