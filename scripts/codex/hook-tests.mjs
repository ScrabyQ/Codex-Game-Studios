import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import {bashPath} from './shell.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { handle, commandReason, patchFiles, projectRoot } from './hooks.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const temp = resolve(repo, '.codex-tmp'); mkdirSync(temp, { recursive: true });
const root = mkdtempSync(resolve(temp, 'hook fixture '));
for (const dir of ['hooks', 'scripts']) cpSync(resolve(repo, '.agents', dir), resolve(root, '.agents', dir), { recursive: true });
cpSync(resolve(repo, '.agents/framework-version'), resolve(root, '.agents/framework-version'));
function put(path, value) { const p = resolve(root, path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, value); }
put('project.yaml', 'project:\n  name: Hook fixture\nengine:\n  name: godot\nmodes:\n  rigor: standard\nupdates:\n  check: false\n');
put('production/session-state/active.md', '# State\n<!-- CHECKPOINT -->\nRecovery marker CGS24\n<!-- /CHECKPOINT -->\n');
mkdirSync(resolve(root, 'prototypes/no_docs'), { recursive: true });
const rows = [];
function test(id, fn) { try { const detail = fn(); rows.push({ id, status: 'PASS', detail }); } catch (e) { rows.push({ id, status: 'FAIL', detail: e.stack }); } }
function call(event, payload, opts = {}) { return handle(event, { cwd: root, session_id: 'fixture-session', ...payload }, { root, ...opts }); }
function good(result) { assert.equal(result.code, 0, result.reason); return result; }
function bad(result) { assert.equal(result.code, 2); return result; }
const dangerous = [
  'rm -rf sentinel', 'rm -r --force sentinel', 'Remove-Item sentinel -Recurse -Force',
  'git push origin --force', 'git -C . push origin -uf', 'git push origin +HEAD:main',
  'git reset --hard HEAD', 'git clean -dqxf', 'git push upstream main', 'git push --set-upstream upstream feature',
  'git push https://github.com/Donchitos/Claude-Code-Game-Studios.git main',
  'cat .env.local', 'Get-Content .env', 'cat Content/Map.umap', 'sudo true', 'chmod 777 file',
  'echo hello; git push --force origin main', 'bash -c "git reset --hard"', 'echo "hello"; git push --force; echo "bye"'
];
test('dangerous-sentinel-never-executes', () => {
  const sentinel = resolve(root, 'UNSAFE_EXECUTED');
  for (const command of dangerous) {
    const result = call('PreToolUse', { tool_name: 'Bash', tool_input: { cmd: command } });
    // The downstream operation is a harmless stub; the dangerous string is never executed.
    if (result.code === 0) writeFileSync(sentinel, command);
    bad(result); assert(!existsSync(sentinel), command);
    assert.equal(result.output.hookSpecificOutput.permissionDecision, 'deny');
  }
  return { cases: dangerous, sentinelAbsent: !existsSync(sentinel), execution: 'guard then harmless stub; dangerous strings never run' };
});
test('safe-and-false-positive-commands', () => {
  const safe = ['git status --short', 'git diff --stat', 'git push origin feature', 'rm ordinary.tmp', 'node --version', 'echo "git push --force is prohibited"'];
  for (const c of safe) assert.equal(commandReason(c), null, c);
  good(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git push --set-upstream origin feature' } }));
  good(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'printf safe' } }));
  return safe;
});
test('patch-all-paths-protected', () => {
  for (const path of ['.env', 'a/.env.local', 'Content/a.uasset', 'Content/a.umap', '../outside']) {
    bad(call('PreToolUse', { tool_name: 'apply_patch', tool_input: { command: `*** Begin Patch\n*** Add File: safe.txt\n+ok\n*** Add File: ${path}\n+unsafe\n*** End Patch` } }));
  }
  bad(call('PreToolUse', { tool_name: 'Read', tool_input: { file_path: '.env' } }));
});
test('patch-json-reconstruction', () => {
  put('data.json', '{"count":1}\n');
  const patch = '*** Begin Patch\n*** Update File: data.json\n@@\n-{"count":1}\n+{"count":2}\n*** Add File: extra.json\n+{"ok":true}\n*** End Patch';
  const files = patchFiles(patch, root); assert.equal(files.length, 2); assert.match(files[0].content, /2/);
  good(call('PreToolUse', { tool_name: 'apply_patch', tool_input: patch }));
  bad(call('PreToolUse', { tool_name: 'apply_patch', tool_input: { command: patch.replace('{"count":2}', '{broken') } }));
  bad(call('PreToolUse', { tool_name: 'apply_patch', tool_input: { unexpected: patch } }));
  bad(call('PreToolUse', { tool_name: 'apply_patch', tool_input: { command: patch.replace('{"count":1}', '{"absent":1}') } }));
});
test('malformed-payloads-and-dependencies', () => {
  bad(call('PreToolUse', {})); bad(call('PreToolUse', { tool_name: 'Bash', tool_input: {} }));
  bad(call('PreToolUse', { tool_name: 'mcp__fs__write', tool_input: {} }));
  bad(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'echo safe' } }, { bash: resolve(root, 'missing-shell') }));
  bad(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'echo safe' } }, { backendRoot: resolve(root, 'missing-backends') }));
});
test('postwrite-actual-json-and-skill', () => {
  put('assets/data/item.json', '{invalid');
  bad(call('PostToolUse', { tool_name: 'Write', tool_input: { file_path: 'assets/data/item.json', content: '{"pretend":"valid"}' } }));
  put('assets/data/item.json', '{"actual":"valid"}');
  good(call('PostToolUse', { tool_name: 'Write', tool_input: { file_path: 'assets/data/item.json' } }));
  const r = good(call('PostToolUse', { tool_name: 'Write', tool_input: { file_path: '.agents/skills/demo/SKILL.md' } }));
  assert.match(r.observations.join('\n'), /Skill modified: demo/);
  assert.match(r.observations.join('\n'), /Run \$skill-test static demo/);
});
test('read-guard-large-and-bounded', () => {
  put('design/large.md', '# Large\n' + 'detail '.repeat(10000));
  bad(call('PreToolUse', { tool_name: 'Read', tool_input: { file_path: 'design/large.md' } }));
  good(call('PreToolUse', { tool_name: 'Read', tool_input: { file_path: 'design/large.md', offset: 1, limit: 20 } }));
});
test('write-advisory-remains-nonblocking', () => {
  const r = good(call('PreToolUse', { tool_name: 'Write', tool_input: { file_path: 'project.yaml', content: 'modes:\n  rigor: invalid\n' } }));
  assert.match(r.observations.join('\n'), /warning|ENUM|rigor/i);
});
test('registry-removal-advisory', () => {
  put('design/registry/entities.yaml', 'entities:\n  - name: goblin\n    status: active\n    source: design/gdd/combat.md\nitems: []\nformulas: []\nconstants: []\n');
  const r = good(call('PreToolUse', { tool_name: 'Write', tool_input: { file_path: 'design/registry/entities.yaml', content: 'entities: []\nitems: []\nformulas: []\nconstants: []\n' } }));
  assert.match(r.observations.join('\n'), /removes|REMOVED/i);
});
test('commit-staged-json-blocks-without-commit', () => {
  function git(args) { const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); }
  git(['init', '--quiet']); put('assets/data/bad.json', '{bad'); git(['add', 'assets/data/bad.json']);
  const r = bad(call('PreToolUse', { tool_name: 'Bash', tool_input: { cmd: 'git commit -m fixture' } })); assert.match(r.reason, /JSON/);
  put('assets/data/bad.json', '{"ok":true}'); git(['add', 'assets/data/bad.json']);
  good(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git commit -m fixture' } }));
  git(['remote', 'add', 'origin', 'https://github.com/Donchitos/Claude-Code-Game-Studios.git']);
  bad(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git push origin main' } }));
  git(['remote', 'add', 'upstream', 'https://github.com/Donchitos/Claude-Code-Game-Studios.git']);
  good(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git remote set-url --push upstream DISABLED' } }));
  bad(call('PreToolUse', { tool_name: 'Bash', tool_input: { command: 'git remote set-url --push upstream DISABLED; git push upstream main' } }));
  return 'Only git init/add/remote were executed in fixture; commit and push were inspected only.';
});
test('session-checkpoint-gap-compaction-stop-audit', () => {
  const r = good(call('SessionStart', { source: 'compact' }));
  assert.match(r.observations.join('\n'), /Codex Game Studios/);
  assert.match(r.observations.join('\n'), /Recovery marker CGS24/); assert.match(r.observations.join('\n'), /undocumented prototype/);
  good(call('PreCompact', { trigger: 'manual' }));
  assert(existsSync(resolve(root, 'production/session-logs/compaction-log.txt')));
  good(call('SubagentStart', { agent_type: 'qa-tester', agent_id: 'fixture-agent' }));
  good(call('SubagentStop', { agent_type: 'qa-tester', agent_id: 'fixture-agent', expected_artifact: 'report.md' }));
  good(call('Stop', {}));
  const audit = readFileSync(resolve(root, 'production/session-logs/agent-audit.log'), 'utf8');
  assert.match(audit, /Agent invoked: qa-tester/); assert.match(audit, /Agent completed: qa-tester/);
  assert(existsSync(resolve(root, 'production/session-logs/session-cost.md')));
});
test('agent-contract-explicit-fallback', () => {
  const missing = good(call('SubagentStop', { agent_type: 'qa-tester', expected_artifact: 'report.md' }));
  assert.match(missing.observations.join('\n'), /Artifact missing/);
  put('report.md', '# Review\n');
  assert.match(good(call('SubagentStop', { agent_type: 'qa-tester', expected_artifact: 'report.md' })).observations.join('\n'), /Artifact present/);
  assert.match(good(call('SubagentStop', {})).observations.join('\n'), /PENDING/);
});
test('manual-notification', () => assert.match(good(call('Notification', { message: 'Review needed' })).observations.join('\n'), /Manual status: Review needed/));
test('root-subdir-spaces-nested-project', () => {
  mkdirSync(resolve(root, 'deep/path'), { recursive: true }); assert.equal(projectRoot(resolve(root, 'deep/path')), root);
  put('nested/project.local.yaml', 'modes:\n  rigor: minimal\n'); assert.equal(projectRoot(resolve(root, 'nested')), resolve(root, 'nested'));
});
test('actual-cli-run-deny-and-safe', () => {
  put('stubbin/git', '#!/bin/sh\nprintf STUB_EXECUTED > UNSAFE_EXECUTED\n'); chmodSync(resolve(root, 'stubbin/git'), 0o755);
  put('deny.json', JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git push --force; echo unsafe > UNSAFE_EXECUTED' } }));
  const denied = spawnSync(process.execPath, [resolve(repo, 'scripts/codex/hooks.mjs'), 'run', '--root', root, '--input', resolve(root, 'deny.json')], { cwd: resolve(root, 'deep/path'), encoding: 'utf8', env: { ...process.env, PATH: resolve(root, 'stubbin') + (process.platform === 'win32' ? ';' : ':') + process.env.PATH } });
  assert.equal(denied.status, 2, denied.stderr); assert(!existsSync(resolve(root, 'UNSAFE_EXECUTED')));
  put('safe.json', JSON.stringify({ tool_name: 'Bash', tool_input: { cmd: 'printf SAFE_EXECUTED > SAFE_EXECUTED' } }));
  const safe = spawnSync(process.execPath, [resolve(repo, 'scripts/codex/hooks.mjs'), 'run', '--root', root, '--input', resolve(root, 'safe.json')], { encoding: 'utf8' });
  assert.equal(safe.status, 0, safe.stderr); assert.equal(readFileSync(resolve(root, 'SAFE_EXECUTED'), 'utf8'), 'SAFE_EXECUTED');
  return { deniedExit: denied.status, safeExit: safe.status, unsafeSentinelAbsent: true, safeSentinel: 'SAFE_EXECUTED' };
});
test('actual-cli-malformed-input', () => {
  const r = spawnSync(process.execPath, [resolve(repo, 'scripts/codex/hooks.mjs'), 'PreToolUse', '--root', root], { input: '{bad', encoding: 'utf8' }); assert.equal(r.status, 2); return { exit: r.status };
});
test('registration-supported-fields-and-windows-launcher', () => {
  const config = JSON.parse(readFileSync(resolve(repo, '.codex/hooks.example.json'), 'utf8'));
  assert.equal(Object.keys(config.hooks).length, 7); assert(!('Notification' in config.hooks));
  for (const groups of Object.values(config.hooks)) for (const group of groups) for (const h of group.hooks) {
    assert.equal(h.type, 'command'); assert.equal(typeof h.commandWindows, 'string'); assert(h.timeout > 0);
  }
  put('scripts/codex/hooks.mjs', readFileSync(resolve(repo, 'scripts/codex/hooks.mjs')));
  put('scripts/codex/main-entry.mjs', readFileSync(resolve(repo, 'scripts/codex/main-entry.mjs')));
  put('scripts/codex/shell.mjs', readFileSync(resolve(repo, 'scripts/codex/shell.mjs')));
  const command = config.hooks.PreToolUse[0].hooks[0][process.platform === 'win32' ? 'commandWindows' : 'command'];
  // This is the static reviewed hook command, intentionally executed by a shell.
  const r = spawnSync(command, { shell: process.platform === 'win32' ? 'cmd.exe' : 'bash', cwd: resolve(root, 'deep/path'), input: JSON.stringify({ cwd: resolve(root, 'deep/path'), tool_name: 'Bash', tool_input: { command: 'echo launcher-safe' } }), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr); JSON.parse(r.stdout); return { command, exit: r.status, cwdHasSpaces: root.includes(' '), nativeActivation: 'not exercised' };
});
test('no-config-backend-root-fallback', () => {
  const noConfig = mkdtempSync(resolve(temp, 'unconfigured hook fixture '));
  cpSync(resolve(repo, '.agents/hooks'), resolve(noConfig, '.agents/hooks'), { recursive: true });
  cpSync(resolve(repo, '.agents/scripts'), resolve(noConfig, '.agents/scripts'), { recursive: true });
  cpSync(resolve(repo, '.agents/framework-version'), resolve(noConfig, '.agents/framework-version'));
  assert.equal(projectRoot(noConfig), noConfig);
  // Competing explicit root: a cwd with .agents must win even without project.yaml.
  // Both candidates are disposable; an old backend cannot write the working repository.
  const alternate = mkdtempSync(resolve(temp, 'alternate hook fixture '));
  const env = { ...process.env, CGS_PROJECT_DIR: alternate };
  const shell = bashPath();
  const r = spawnSync(shell, [resolve(noConfig, '.agents/hooks/pre-compact.sh')], { cwd: noConfig, input: '{}', env, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr); assert(existsSync(resolve(noConfig, 'production/session-logs/compaction-log.txt')));
  return { selectedRoot: noConfig, absentProjectYaml: !existsSync(resolve(noConfig, 'project.yaml')) };
});
const hashes = Object.fromEntries(['scripts/codex/hooks.mjs', 'scripts/codex/hook-tests.mjs', '.codex/hooks.example.json', 'docs/codex/hooks.md'].map(p => [p, createHash('sha256').update(readFileSync(resolve(repo, p))).digest('hex')]));
const report = { schema: 1, task: 'CGS-24', timestamp: new Date().toISOString(), platform: process.platform, node: process.version, model: null, command: 'node scripts/codex/hook-tests.mjs', fixture: root, fixture_recipe_sha256: hashes['scripts/codex/hook-tests.mjs'], hashes, tests: rows, nativeActivation: 'PENDING: optional reviewed hooks not trusted or activated by this runner', linux: process.platform === 'linux' ? 'tested here' : 'PENDING: Windows Git Bash execution is not Linux', status: rows.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL' };
const testMap = {
  'session-start': ['session-checkpoint-gap-compaction-stop-audit', 'no-config-backend-root-fallback'], 'detect-gaps': ['session-checkpoint-gap-compaction-stop-audit'],
  'validate-commit': ['commit-staged-json-blocks-without-commit', 'dangerous-sentinel-never-executes'], 'validate-push': ['safe-and-false-positive-commands', 'commit-staged-json-blocks-without-commit'],
  'validate-registry': ['registry-removal-advisory', 'patch-json-reconstruction'], 'validate-write': ['write-advisory-remains-nonblocking', 'patch-all-paths-protected'],
  'validate-read': ['read-guard-large-and-bounded', 'patch-all-paths-protected'], 'validate-assets': ['postwrite-actual-json-and-skill'], 'validate-skill-change': ['postwrite-actual-json-and-skill'],
  notify: ['manual-notification'], 'pre-compact': ['session-checkpoint-gap-compaction-stop-audit', 'no-config-backend-root-fallback'], 'session-stop': ['session-checkpoint-gap-compaction-stop-audit'],
  'log-agent': ['session-checkpoint-gap-compaction-stop-audit'], 'log-agent-stop': ['session-checkpoint-gap-compaction-stop-audit'], 'validate-agent-artifact': ['agent-contract-explicit-fallback']
};
const inventory=JSON.parse(readFileSync(resolve(repo,'docs/codex/upstream-inventory.json'),'utf8'));
const nativeConfig=JSON.parse(readFileSync(resolve(repo,'.codex/hooks.example.json'),'utf8'));
assert.equal(inventory.hooks.length,15,'Expected 15 reviewed hook declarations');
for(const item of inventory.hooks){
  const handler=/\/([^/]+)\.sh/.exec(item.command)?.[1];
  assert.ok(handler&&testMap[handler], 'Unmapped hook declaration: '+item.id);
  assert.ok(existsSync(resolve(repo,'.agents/hooks',handler+'.sh')), 'Missing native hook backend: '+handler);
  for(const id of testMap[handler])assert.equal(rows.find(r=>r.id===id)?.status,'PASS',handler+': '+id);
  if(item.event!=='Notification')assert.ok(nativeConfig.hooks[item.event], 'Missing native binding: '+item.event);
}
const hookFiles=inventory.files.filter(x=>x.path.startsWith('.claude/hooks/')&&x.path.endsWith('.sh'));
assert.equal(hookFiles.length,18,'Expected 18 reviewed source hook mechanisms');
const registry=JSON.parse(readFileSync(resolve(repo,'docs/codex/generation-manifest.json'),'utf8'));
for(const item of hookFiles){
  const entries=registry.entries.filter(x=>x.source===item.path);
  assert.equal(entries.length,1,'Expected one reviewed native mapping: '+item.path);
  assert.ok(entries[0].target && existsSync(resolve(repo,entries[0].target)),'Missing native equivalent for '+item.path+': '+entries[0].target);
}
console.log(JSON.stringify(report, null, 2)); process.exitCode = report.status === 'PASS' ? 0 : 1;
