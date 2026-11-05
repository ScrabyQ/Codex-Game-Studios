import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

// The source is read from Git objects only; it never needs a checkout.
export function openSource({ root, repository = root, ref, expectedCommit, fallbackRef } = {}) {
  if (!root) throw Error('A product root is required');
  repository = resolve(repository);
  const git = (...args) => execFileSync('git', args, { cwd: repository, maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  const bare=git('rev-parse','--is-bare-repository').toString().trim()==='true';
  repository=resolve(git('rev-parse',bare?'--absolute-git-dir':'--show-toplevel').toString().trim());
  if (!ref) {
    for (const candidate of ['refs/heads/source/ccgs-main', 'refs/remotes/origin/source/ccgs-main', fallbackRef, expectedCommit]) {
      if (!candidate) continue;
      try { git('rev-parse', '--verify', `${candidate}^{commit}`); ref = candidate; break; } catch {}
    }
  }
  if (!ref || ref.startsWith('-') || /[\0\r\n]/.test(ref)) throw Error('No valid source ref is available; specify --source-ref');
  const commit = git('rev-parse', '--verify', `${ref}^{commit}`).toString().trim();
  if (expectedCommit && commit !== expectedCommit) throw Error(`Source commit mismatch: expected ${expectedCommit}, got ${commit}`);
  const tree = git('rev-parse', `${commit}^{tree}`).toString().trim();
  const files = git('ls-tree', '-r', '-z', '--full-tree', commit).toString('utf8').split('\0').filter(Boolean).map(line => {
    const match = /^([0-7]+) (\w+) ([a-f0-9]+)\t([\s\S]+)$/.exec(line);
    if (!match) throw Error('Invalid Git tree entry');
    return { path: match[4], mode: match[1], type: match[2], blob: match[3] };
  });
  const byPath = new Map(files.map(file => [file.path, file]));
  const read = path => {
    if (path.split('/').some(part => /^\.env/i.test(part))) throw Error(`Secret source path cannot be read: ${path}`);
    const file = byPath.get(path);
    if (!file || file.type !== 'blob' || file.mode === '120000') throw Error(`Missing or unsafe source file: ${path}`);
    return git('cat-file', 'blob', file.blob);
  };
  return { repository, ref, commit, tree, files, list: (prefix = '') => files.filter(f => f.path.startsWith(prefix)), read };
}
