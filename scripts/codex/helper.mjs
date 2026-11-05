import { spawnSync } from 'node:child_process';
import {bashPath} from './shell.mjs';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainEntry } from './main-entry.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const samePath = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
const namedRoot = new Set(['adr-status', 'agent-check', 'asset-scan', 'bug-stats', 'code-markers', 'config-set', 'content-count', 'debt-register', 'flaky-stats', 'hook-input', 'inputs-check', 'plan-math', 'project-state', 'read-guard', 'registry', 'session-state', 'set-stage', 'skill-lint', 'story-facts', 'test-run', 'test-scaffold', 'write-guard']);
const cwdSafe = new Set(['md-section', 'review-receipts']);
function appendPositionalRoot(name, args, root) {
  const withValue = name === 'artifact-check' ? new Set(['--phase', '--path']) : new Set(['--skill', '--agent']);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (withValue.has(arg)) { if (++i >= args.length) throw new Error(`${arg} needs a value`); }
    else if (arg === '-h' || arg === '--help' || [...withValue].some(k => arg.startsWith(k + '='))) continue;
    else throw new Error(`${name}: pass the project via --root, not a positional root`);
  }
  return [...args, root];
}
export function runHelper(name, args = [], root = process.cwd(), stdio = 'inherit') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error('Invalid helper name');
  const candidates = ['scripts', 'hooks'].map(d => resolve(repo, '.agents', d, name + '.sh'));
  const script = candidates.find(existsSync);
  if (!script) throw new Error(`Unknown helper: ${name}`);
  let selected;
  try { selected = realpathSync(resolve(root)); if (!statSync(selected).isDirectory()) throw new Error('not a directory'); }
  catch { throw new Error(`Selected project root is missing or not a directory: ${root}`); }
  args = [...args];
  if (namedRoot.has(name)) {
    for (let i = 0; i < args.length; i++) {
      let value;
      if (args[i] === '--root') { if (i + 1 >= args.length) throw new Error('--root needs a value'); value = args[i + 1]; args.splice(i, 2); i--; }
      else if (args[i].startsWith('--root=')) { value = args[i].slice(7); args.splice(i, 1); i--; }
      if (value !== undefined && !samePath(realpathSync(resolve(value)), selected)) throw new Error('Conflicting project roots');
    }
    args.push('--root', selected);
  } else if (name === 'artifact-check' || name === 'compat-inventory') args = appendPositionalRoot(name, args, selected);
  else if (name === 'adr-dep-graph') { if (!args.length) args.push(join(selected, 'docs/architecture')); }
  else if (name === 'story-status') { if (!readFileSync(script, 'utf8').includes('CGS_STORY_ROOT_V1')) throw new Error('story-status selected-root adaptation is not installed'); }
  else if (name === 'project-coherence') { if (!existsSync(join(selected, 'project.yaml'))) throw new Error('project-coherence needs project.yaml in the selected root; refusing fallback to another project'); }
  else if (name !== 'yaml-helper' && !cwdSafe.has(name) && !samePath(realpathSync(repo), selected)) throw new Error(`${name} has no verified selected-root interface; refusing to inspect the helper repository`);
  const shell = bashPath();
  const out = spawnSync(shell, [script, ...args], { cwd: selected, env: { ...process.env, CGS_PROJECT_DIR: selected }, stdio, encoding: 'utf8' });
  if (out.error) throw out.error;
  return out;
}
if (isMainEntry(import.meta.url)) {
  try {
    const args = process.argv.slice(2); const name = args.shift();
    if (!name) throw new Error('Usage: helper.mjs HELPER [--root DIR] [arguments]');
    let root = process.cwd(), seenRoot = false;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--root' || args[i].startsWith('--root=')) {
        if (seenRoot) throw new Error('Only one --root is allowed'); seenRoot = true;
        if (args[i] === '--root') { if (!args[i + 1]) throw new Error('--root needs a value'); root = args[i + 1]; args.splice(i, 2); }
        else { root = args[i].slice(7); if (!root) throw new Error('--root needs a value'); args.splice(i, 1); }
        i--;
      }
    }
    const result = runHelper(name, args, root); process.exitCode = result.status ?? 1;
  } catch (e) { console.error(e.message); process.exitCode = 2; }
}
