import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { git, inspect, options, within } from './upstream-common.mjs';
try {
  const o = options(process.argv.slice(2));
  if (!!o.prepare === !!o['dry-run']) throw new Error('Choose exactly one of --dry-run or --prepare');
  const report = inspect(o);
  if (!o.prepare) console.log(JSON.stringify(report, null, 2));
  else {
    let integrated = false;
    try { git(o.root, 'merge-base', '--is-ancestor', report.upstream_sha, 'HEAD'); integrated = true; } catch {}
    if (integrated) console.log(JSON.stringify({ ...report, preparation: 'NO_OP_ALREADY_IN_HISTORY' }, null, 2));
    else {
      const branch = o.branch || `codex/sync-${report.upstream_sha.slice(0, 12)}`;
      git(o.root, 'check-ref-format', '--branch', branch);
      const worktree = resolve(o.worktree || resolve(o.root, '.codex/worktrees', `sync-${report.upstream_sha.slice(0, 12)}`));
      if (existsSync(worktree)) throw new Error(`Worktree already exists; inspect it instead of overwriting: ${worktree}`);
      if (within(o.root, worktree)) {
        try { git(o.root, 'check-ignore', '-q', worktree); }
        catch { throw new Error('Nested worktree must be Git-ignored; choose an external --worktree path'); }
      }
      mkdirSync(dirname(worktree), { recursive: true });
      git(o.root, 'worktree', 'add', '-b', branch, worktree, report.head_sha);
      let mergeExit = 0, mergeOutput = '';
      try { mergeOutput = git(worktree, 'merge', '--no-commit', '--no-ff', report.upstream_sha); }
      catch (e) { mergeExit = e.status ?? 2; mergeOutput = `${e.stdout || ''}${e.stderr || ''}`; }
      const conflicts = git(worktree, 'diff', '--name-only', '--diff-filter=U').split('\n').filter(Boolean);
      const result = { ...report, preparation: mergeExit ? (conflicts.length ? 'CONFLICT_REVIEW_REQUIRED' : 'MERGE_FAILED') : 'MERGED_UNCOMMITTED_REVIEW_REQUIRED', worktree, branch, merge_exit: mergeExit, merge_output: mergeOutput, conflicts, recovery: 'Original checkout was not modified. Keep this worktree for review; git merge --abort in this worktree restores its pre-merge state. No automatic cleanup is performed.' };
      const proposal = resolve(worktree, 'docs/codex/upstream-proposal.json');
      if (existsSync(proposal)) throw new Error(`Proposal already exists; merged worktree retained at ${worktree}`);
      mkdirSync(dirname(proposal), { recursive: true });
      writeFileSync(proposal, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
      console.log(JSON.stringify(result, null, 2));
      if (mergeExit) process.exitCode = mergeExit;
    }
  }
} catch (e) { console.error(`Upstream preparation refused: ${e.message}`); process.exitCode = 2; }
