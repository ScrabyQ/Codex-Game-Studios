import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { hash } from './upstream-common.mjs';
import { baseline as readBaseline, HISTORICAL } from './baseline.mjs';

const root = process.cwd();
const fixture = resolve(root, '.codex-tmp', `upstream-${Date.now()}`);
mkdirSync(fixture, { recursive: true });
const upstream = resolve(fixture, 'upstream'), fork = resolve(fixture, 'fork');
const results = [];
function git(cwd, ...args) { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
function write(dir, path, text) { const p = resolve(dir, path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); }
function commit(dir, msg) { git(dir, 'add', '.'); git(dir, '-c', 'core.hooksPath=', 'commit', '-m', msg); return git(dir, 'rev-parse', 'HEAD'); }
function identity(dir) { git(dir, 'config', 'user.name', 'CGS Local Fixture'); git(dir, 'config', 'user.email', 'fixture@example.invalid'); git(dir, 'config', 'core.autocrlf', 'false'); }
function run(script, args, expected = 0) {
  const command = ['node', `scripts/codex/${script}.mjs`, '--root', fork, ...args];
  const r = spawnSync(process.execPath, [resolve(root, command[1]), ...command.slice(2)], { cwd: root, encoding: 'utf8' });
  results.push({ command, exit: r.status, expected, stderr: r.stderr });
  assert.equal(r.status, expected, r.stderr);
  return JSON.parse(r.stdout);
}
mkdirSync(upstream); git(upstream, 'init', '-b', 'main'); identity(upstream);
write(upstream, '.claude/skills/demo/SKILL.md', '# Demo\nOriginal skill\n');
write(upstream, '.claude/hooks/demo.sh', '#!/bin/sh\necho original\n');
write(upstream, '.claude/rules/retired.md', '# Retired\n');
write(upstream, '.gitignore', '/.codex/worktrees/\n');
const baseline = commit(upstream, 'Original source');
git(fixture, '-c', 'core.autocrlf=false', 'clone', upstream, fork); identity(fork); git(fork, 'remote', 'add', 'upstream', upstream);
const overlay = '# Codex manual overlay\n';
write(fork, '.agents/skills/demo/SKILL.md', overlay);
write(fork, '.agents/rules/index.json', '{}\n');
write(fork, 'docs/codex/migration-manifest.json', JSON.stringify({ source_commit: baseline, entries: [{ id: 'file:.claude/skills/demo/SKILL.md', source: '.claude/skills/demo/SKILL.md', target: '.agents/skills/demo/SKILL.md', status: 'EQUIVALENT' }] }));
write(fork, 'docs/codex/generation-manifest.json', JSON.stringify({ source_commit: baseline, entries: [{ source: '.claude/skills/demo/SKILL.md', target: '.agents/skills/demo/SKILL.md', target_sha256: hash(overlay), ownership: 'generated', transform_ids: ['manual-overlay'] }, { sources: ['.claude/rules/retired.md'], target: '.agents/rules/index.json', target_sha256: hash('{}\n'), ownership: 'generated-derived' }] }));
commit(fork, 'Codex adaptation');
write(upstream, '.claude/skills/demo/SKILL.md', '# Demo\nUpdated upstream skill\n');
write(upstream, '.claude/hooks/demo.sh', '#!/bin/sh\necho upstream-updated\n');
write(upstream, '.claude/agents/new.md', '# New role\n');
git(upstream, 'rm', '.claude/rules/retired.md');
const next = commit(upstream, 'Changed skill and hook, added role, retired rule');
write(fork, 'dirty-user.txt', 'Preserve this uncommitted user edit\n');
write(fork, '.agents/skills/demo/SKILL.md', overlay + 'Local unstaged edit\n');
const originalHead = git(fork, 'rev-parse', 'HEAD'), originalStatus = git(fork, 'status', '--porcelain=v1');
const a = run('sync-upstream', ['--dry-run', '--fetch']);
const b = run('sync-upstream', ['--dry-run']);
assert.deepEqual(a, b); assert.equal(a.groups.skill, 1); assert.equal(a.groups.hook, 1); assert.equal(a.groups.agent, 1); assert.equal(a.groups.rule, 1);
assert.equal(a.changes.find(x => x.category === 'rule').change, 'deleted');
assert.equal(a.changes.find(x => x.category === 'rule').targets[0].target, '.agents/rules/index.json');
assert.equal(a.changes.find(x => x.category === 'skill').targets[0].status, 'PENDING');
assert.equal(a.target_drift.length, 1);
function refused(args, pattern) {
  const command = ['node', 'scripts/codex/sync-upstream.mjs', '--root', fork, ...args];
  const before = git(fork, 'for-each-ref', '--format=%(refname) %(objectname)');
  const r = spawnSync(process.execPath, [resolve(root, command[1]), ...command.slice(2)], { encoding: 'utf8' });
  results.push({ command, exit: r.status, expected: 2, stderr: r.stderr });
  assert.equal(r.status, 2); assert.match(r.stderr, pattern);
  assert.equal(git(fork, 'for-each-ref', '--format=%(refname) %(objectname)'), before);
}
refused(['--prepare', '--fetch', '--fetch'], /Duplicate option/);
refused(['prepare', '--fetch'], /Malformed option/);
refused(['--prepare', '--branch', '-malformed'], /Unknown or incomplete option/);
const variant = process.platform === 'win32' ? fork.toUpperCase() : fork;
const unsafeNested = resolve(variant, 'unignored-sync');
refused(['--prepare', '--branch', 'codex/unsafe-nested', '--worktree', unsafeNested], /Nested worktree must be Git-ignored/);
assert.equal(existsSync(unsafeNested), false);
const prepared = run('sync-upstream', ['--prepare']);
assert.equal(prepared.preparation, 'MERGED_UNCOMMITTED_REVIEW_REQUIRED');
assert.equal(readFileSync(resolve(prepared.worktree, '.agents/skills/demo/SKILL.md'), 'utf8'), overlay);
assert.equal(git(fork, 'rev-parse', 'HEAD'), originalHead); assert.equal(git(fork, 'status', '--porcelain=v1'), originalStatus);
assert.equal(git(prepared.worktree, 'rev-parse', 'MERGE_HEAD'), next);
commit(prepared.worktree, 'Fixture review complete; integrate source only');
const repeat = spawnSync(process.execPath, [resolve(root, 'scripts/codex/sync-upstream.mjs'), '--root', prepared.worktree, '--prepare'], { encoding: 'utf8' });
results.push({ command: ['node', 'scripts/codex/sync-upstream.mjs', '--root', prepared.worktree, '--prepare'], exit: repeat.status, expected: 0 });
assert.equal(repeat.status, 0, repeat.stderr); assert.equal(JSON.parse(repeat.stdout).preparation, 'NO_OP_ALREADY_IN_HISTORY');
// Commit a conflicting source change only in the disposable fork checkout.
write(fork, '.claude/skills/demo/SKILL.md', '# Demo\nConflicting local source edit\n');
git(fork, 'add', '.claude/skills/demo/SKILL.md'); git(fork, '-c', 'core.hooksPath=', 'commit', '-m', 'Conflicting source change');
const conflictHead = git(fork, 'rev-parse', 'HEAD'), conflictStatus = git(fork, 'status', '--porcelain=v1');
const conflict = run('sync-upstream', ['--prepare', '--branch', 'codex/conflict', '--worktree', resolve(fixture, 'conflict')], 1);
assert.equal(conflict.preparation, 'CONFLICT_REVIEW_REQUIRED'); assert.deepEqual(conflict.conflicts, ['.claude/skills/demo/SKILL.md']);
git(conflict.worktree, 'merge', '--abort');
assert.equal(git(conflict.worktree, 'rev-parse', 'HEAD'), conflictHead);
assert.equal(git(fork, 'status', '--porcelain=v1'), conflictStatus);
assert.equal(readFileSync(resolve(fork, '.agents/skills/demo/SKILL.md'), 'utf8'), overlay + 'Local unstaged edit\n');
write(fork, 'docs/codex/active-baseline.json', JSON.stringify({ schema: 1, historical_source_commit: HISTORICAL, source_commit: next, reconciliation_evidence: ['fixture-plan.json'], state: 'pending', pending: { plan: 'fixture-plan.json' } }));
assert.equal(readBaseline(fork, { allowPending: true }).state, 'pending');
const pending = run('check-upstream', []);
assert.equal(pending.changes.length, 0); assert.equal(pending.status, 'RECONCILIATION_PENDING'); assert.equal(pending.reconciliation.pending, true);
const evidence = { schema: 1, status: 'PASS', fixture, baseline_sha: baseline, upstream_sha: next, results, assertions: ['real fetch detects changed Skill and hook', 'added role and deleted rule accounted', 'dry-run deterministic and no worktree writes', 'changed target coverage PENDING', 'local target drift detected', 'isolated merge preserves committed overlay', 'root dirty state and HEAD preserved', 'second prepare after integration is no-op', 'conflict exits 1 and is recoverable with merge --abort', 'derived index source impact included', 'duplicate and malformed options rejected without ref mutation', 'unignored nested worktree refused including Windows case variant', 'pending reconciliation remains visible with unchanged upstream'], limitations: ['No remote writes, hosted PR, or automatic background updater tested or installed.', 'Fixtures retained; original repository Git state is not mutated by tests.'] };
const output = resolve(root, 'docs/codex/evidence/CGS-29/tests.json'); mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
