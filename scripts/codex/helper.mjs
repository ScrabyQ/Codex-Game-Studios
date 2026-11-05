import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export function runHelper(name, args = [], root = process.cwd(), stdio = 'inherit') {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error('Invalid helper name');
  const candidates = ['scripts', 'hooks'].map(d => resolve(repo, '.agents', d, name + '.sh'));
  const script = candidates.find(existsSync);
  if (!script) throw new Error(`Unknown helper: ${name}`);
  // Most upstream helpers default to the directory containing the script,
  // not cwd. Forward the selected project root when the helper supports it.
  if (name !== 'yaml-helper' && readFileSync(script, 'utf8').includes('--root') && !args.some(a => a === '--root' || a.startsWith('--root='))) args = [...args, '--root', resolve(root)];
  const shell = process.env.CGS_BASH || (process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : 'bash');
  const out = spawnSync(shell, [script, ...args], { cwd: resolve(root), env: { ...process.env, CGS_PROJECT_DIR: resolve(root) }, stdio, encoding: 'utf8' });
  if (out.error) throw out.error;
  return out;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); const name = args.shift();
    if (!name) throw new Error('Usage: helper.mjs HELPER [--root DIR] [arguments]');
    const i = args.indexOf('--root'); let root = process.cwd();
    if (i >= 0) { if (!args[i + 1]) throw new Error('--root needs a value'); root = args[i + 1]; args.splice(i, 2); }
    const result = runHelper(name, args, root); process.exitCode = result.status ?? 1;
  } catch (e) { console.error(e.message); process.exitCode = 2; }
}
