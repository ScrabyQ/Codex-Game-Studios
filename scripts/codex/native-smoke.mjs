import { spawnSync, execFileSync } from 'node:child_process';
import { isMainEntry } from './main-entry.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, lstatSync, copyFileSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sha256 = data => createHash('sha256').update(data).digest('hex');
function nativeCliLock() {
  const directory = resolve(root, '.scratch');
  mkdirSync(directory, { recursive: true });
  const file = resolve(directory, 'native-cli.lock'), token = randomUUID(), deadline = Date.now() + 600000;
  let announced = false;
  while (true) {
    try {
      const fd = openSync(file, 'wx');
      writeFileSync(fd, JSON.stringify({ schema: 1, purpose: 'cgs-native-smoke', pid: process.pid, token }));
      closeSync(fd);
      return () => {
        const state = JSON.parse(readFileSync(file, 'utf8'));
        if (state.token !== token) throw new Error('Native CLI lock ownership changed; leaving it untouched');
        unlinkSync(file);
      };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const state = JSON.parse(readFileSync(file, 'utf8'));
      if (state.purpose !== 'cgs-native-smoke' || !Number.isInteger(state.pid)) throw new Error('Unknown native CLI lock; review it manually');
      try { process.kill(state.pid, 0); }
      catch (check) { if (check.code === 'ESRCH') { unlinkSync(file); continue; } }
      if (Date.now() >= deadline) throw new Error('Another native smoke process still owns the lock; no CLI run attempted');
      if (!announced) { console.error('Waiting for the active native CLI smoke process.'); announced = true; }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }
}
function inside(base, name) {
  const target = resolve(base, name), rel = relative(base, target);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) throw new Error(`Path must stay within ${base}: ${name}`);
  // Reject symlink ancestors rather than allowing a fixture to escape its directory.
  let path = base;
  for (const segment of rel.split(/[\\/]/)) {
    path = join(path, segment);
    if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error(`Symlink not allowed: ${path}`);
  }
  return target;
}
function copyTree(source, target) {
  if (!existsSync(source)) return;
  if (lstatSync(source).isSymbolicLink()) throw new Error(`Unexpected symlink: ${source}`);
  if (lstatSync(source).isDirectory()) {
    mkdirSync(target, { recursive: true });
    for (const name of readdirSync(source)) copyTree(join(source, name), join(target, name));
  } else {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
}
function snapshot(directory, prefix = '') {
  const result = {};
  for (const name of readdirSync(directory).sort()) {
    if (['.git', '.godot', 'node_modules'].includes(name)) continue;
    const file = join(directory, name), rel = prefix + name, stat = lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Unexpected fixture symlink: ${file}`);
    if (stat.isDirectory()) Object.assign(result, snapshot(file, `${rel}/`));
    else result[rel] = sha256(readFileSync(file));
  }
  return result;
}
export function createNativeFixture(spec) {
  const id = `${spec.id}-${randomUUID().slice(0, 8)}`;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Invalid fixture ID');
  const scratch = inside(root, '.scratch/native-smoke');
  mkdirSync(scratch, { recursive: true });
  const fixture = inside(scratch, id);
  if (existsSync(fixture)) throw new Error('Fixture already exists');
  // Local clone preserves the actual baseline history; no network or shared object store.
  execFileSync('git', ['clone', '--local', '--no-hardlinks', '--quiet', root, fixture], { stdio: 'pipe' });
  execFileSync('git', ['remote', 'remove', 'origin'], { cwd: fixture });
  // A cloned fixture has no local identity. Preserve this checkout's choice;
  // never ship a maintainer identity that impersonates them on another machine.
  for (const key of ['user.name', 'user.email']) {
    const identity = spawnSync('git', ['config', '--get', key], { cwd: root, encoding: 'utf8' });
    if (identity.status === 0 && identity.stdout.trim()) execFileSync('git', ['config', '--local', key, identity.stdout.trim()], { cwd: fixture });
  }
  for (const path of ['.agents', '.codex/agents', '.codex/model-policy.json', 'scripts/codex', 'AGENTS.md', 'src/AGENTS.md', 'design/AGENTS.md', 'docs/AGENTS.md', 'studio-tests/AGENTS.md', 'docs/codex/generation-manifest.json', 'docs/codex/upstream-inventory.json', 'docs/codex/migration-manifest.json']) copyTree(join(root, path), join(fixture, path));
  // Hook registration is deliberately absent: hook behavior has a separate trusted test.
  // Clone may contain it once the hook task is committed, so refuse rather than silently disable.
  if (existsSync(join(fixture, '.codex/hooks.json'))) throw new Error('Use a fixture baseline without active hooks for skill-only smoke');
  for (const [path, content] of Object.entries(spec.files || {})) {
    const target = inside(fixture, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
  }
  return fixture;
}
export function runNativeSmoke(spec, { model, output, timeout = 300000 } = {}) {
  if (!model) throw new Error('Pass an explicitly verified available --model');
  if (!spec.id || !spec.prompt || !Array.isArray(spec.components)) throw new Error('Case needs id, prompt and components');
  const fixture = createNativeFixture(spec), before = snapshot(fixture);
  const prompt = `This is an isolated Codex Game Studios acceptance fixture. Work only inside this fixture. Do not install software, commit, push, access credentials, contact other people, publish, or modify external state. Any permissions and scripted answers below apply only to this fixture. Report actual PASS/FAIL/PENDING and do not invent engine execution.\n\n${spec.prompt}`;
  if (spec.auto_review && spec.read_only) throw new Error('Automatic review uses workspace-write; use no_writes assertions for a read-only task intent.');
  const permissions = spec.auto_review ? ['--approve-for-me'] : ['--sandbox', spec.read_only ? 'read-only' : 'workspace-write'];
  const args = ['exec', '--ignore-user-config', '--ephemeral', '--strict-config', ...permissions, '--cd', fixture, '--model', model, '--json', '-'];
  for (const feature of spec.features || []) {
    if (!['multi_agent', 'multi_agent_v2'].includes(feature)) throw new Error('Unsupported native smoke feature override');
    args.splice(1, 0, '--enable', feature);
  }
  if (process.platform === 'win32' && spec.windows_sandbox) {
    if (!['elevated', 'unelevated', 'mxc'].includes(spec.windows_sandbox)) throw new Error('Invalid requested Windows sandbox');
    args.splice(1, 0, '-c', `windows.sandbox="${spec.windows_sandbox}"`);
  }
  const start = new Date().toISOString();
  const unlock = nativeCliLock();
  let run;
  try { run = spawnSync(process.env.CGS_CODEX_BINARY || 'codex', args, { input: prompt, encoding: 'utf8', timeout, maxBuffer: 32 * 1024 * 1024, windowsHide: true }); }
  finally { unlock(); }
  const end = new Date().toISOString(), events = [];
  for (const line of (run.stdout || '').split(/\r?\n/)) {
    try { events.push(JSON.parse(line)); } catch { /* CLI warnings remain in the private raw trace. */ }
  }
  const after = snapshot(fixture);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(path => before[path] !== after[path]).sort();
  const messages = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message').map(e => e.item.text).join('\n');
  const assertions = [{ name: 'CLI completed', passed: run.status === 0 && events.some(e => e.type === 'turn.completed') }];
  const completedCommands = events.filter(e => e.type === 'item.completed' && e.item?.type === 'command_execution');
  for (const pattern of spec.expect_commands || []) assertions.push({ name: `Successful command observed: ${pattern}`, passed: completedCommands.some(e => e.item.exit_code === 0 && new RegExp(pattern, 'i').test(e.item.command || '')) });
  if (spec.no_writes || spec.read_only) assertions.push({ name: 'No fixture writes', passed: changed.length === 0, changed });
  for (const path of spec.expect_files || []) assertions.push({ name: `Artifact exists: ${path}`, passed: existsSync(inside(fixture, path)) });
  for (const [path, pattern] of Object.entries(spec.expect_content || {})) {
    const target = inside(fixture, path);
    assertions.push({ name: `Artifact condition: ${path}`, passed: existsSync(target) && new RegExp(pattern, 'im').test(readFileSync(target, 'utf8')) });
  }
  for (const text of spec.expect_report || []) assertions.push({ name: `Report contains: ${text}`, passed: messages.toLowerCase().includes(text.toLowerCase()) });
  const evidence = { schema: 1, case: spec.id, components: spec.components, source_head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), model, model_note: 'Explicit CLI selection; events do not independently attest the serving model.', runtime: execFileSync(process.env.CGS_CODEX_BINARY || 'codex', ['--version'], { encoding: 'utf8' }).trim(), fixture: relative(root, fixture).replaceAll('\\', '/'), fixture_sha256: sha256(JSON.stringify(before)), before_sha256: before, changed_files: changed.map(path => ({ path, before: before[path] ?? null, after: after[path] ?? null })), command: ['codex', ...args.map(a => a === fixture ? '<fixture>' : a)], prompt, started_at: start, ended_at: end, exit_code: run.status, error: run.error?.message ?? null, assertions, result: assertions.every(a => a.passed) ? 'PASS' : 'FAIL', behavioral_scope: spec.scope || 'Only this scenario and assertions; further cases and engine combinations remain PENDING.', response: messages, tool_trace: events.filter(e => e.type.startsWith('item.') && e.item?.type !== 'agent_message'), stderr: (run.stderr || '').slice(0, 16000) };
  writeFileSync(join(fixture, 'native-events.jsonl'), run.stdout || '');
  writeFileSync(join(fixture, 'native-stderr.txt'), run.stderr || '');
  const target = inside(resolve(root, '.scratch'), output || `native/${spec.id}.json`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(evidence, null, 2) + '\n');
  return { result: evidence.result, evidence: relative(root, target).replaceAll('\\', '/'), fixture: evidence.fixture, exit_code: run.status, assertions };
}
if (isMainEntry(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { case: { type: 'string' }, model: { type: 'string' }, output: { type: 'string' }, timeout: { type: 'string' } } });
    if (!values.case) throw new Error('Usage: native-smoke.mjs --case PATH --model VERIFIED_MODEL [--output PATH]');
    const result = runNativeSmoke(JSON.parse(readFileSync(resolve(values.case), 'utf8')), { model: values.model, output: values.output, timeout: values.timeout ? Number(values.timeout) : undefined });
    console.log(JSON.stringify(result));
    if (result.result !== 'PASS') process.exitCode = 1;
  } catch (error) { console.error(`native-smoke: ${error.message}`); process.exitCode = 1; }
}
