import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, realpathSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { openSource } from '../source.mjs';
import { safeProjectPath } from '../safe-path.mjs';

const repository = mkdtempSync(path.join(realpathSync(tmpdir()), 'cgs source fixture '));
const git = (...args) => execFileSync('git', args, { cwd: repository, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
git('init');
mkdirSync(path.join(repository, '.claude/skills/demo'), { recursive: true });
writeFileSync(path.join(repository, '.claude/skills/demo/SKILL.md'), 'source body\n');
writeFileSync(path.join(repository, '.env.fixture'), 'never read this\n');
git('add', '-f', '.claude/skills/demo/SKILL.md', '.env.fixture');
git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture');
const commit = git('rev-parse', 'HEAD');
const source = openSource({ root: repository, repository, ref: 'HEAD', expectedCommit: commit });
const nested = openSource({ root: repository, repository: path.join(repository,'.claude','skills'), ref: 'HEAD', expectedCommit: commit });
// Git and Node can spell the same Windows directory with long and 8.3 names.
assert.equal(statSync(nested.repository).dev, statSync(repository).dev);
assert.equal(statSync(nested.repository).ino, statSync(repository).ino);
assert.deepEqual(nested.files, source.files);
assert.equal(source.commit, commit);
assert.equal(source.read('.claude/skills/demo/SKILL.md').toString(), 'source body\n');
assert.equal(source.list('.claude/skills/').length, 1);
assert.throws(() => source.read('.env.fixture'), /Secret source path/);
assert.throws(() => source.read('../outside'), /Missing or unsafe/);
assert.throws(() => openSource({ root: repository, repository, ref: 'HEAD', expectedCommit: '0'.repeat(40) }), /commit mismatch/);
assert.throws(() => safeProjectPath(repository,'.env.fixture'), /Unsafe project path/);
assert.throws(() => safeProjectPath(repository,'C:/outside'), /Unsafe project path/);
assert.throws(() => safeProjectPath(repository,'../outside'), /Unsafe project path/);
try {
  symlinkSync(tmpdir(),path.join(repository,'outside-link'),'dir');
  assert.throws(() => safeProjectPath(repository,'outside-link/anything'), /Symlink/);
} catch(e) { if(!['EPERM','EACCES','ENOTSUP'].includes(e.code))throw e; console.log('PENDING symlink creation unavailable on this host'); }
console.log('PASS read-only Git source fixture');
