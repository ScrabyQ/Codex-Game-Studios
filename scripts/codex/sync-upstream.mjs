import { existsSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute, sep } from 'node:path';
import { git, inspect, options, within } from './upstream-common.mjs';
try {
  const o = options(process.argv.slice(2));
  if (!!o.prepare === !!o['dry-run']) throw new Error('Choose exactly one of --dry-run or --prepare');
  if (o.fetch) throw new Error('Fetch separately with check-upstream --fetch, then run sync without --fetch');
  const report = inspect(o);
  if (!o.prepare) console.log(JSON.stringify(report, null, 2));
  else {
    if(report.status==='SOURCE_UNAVAILABLE')throw new Error('Source tip unavailable; configure or specify --source-ref');
    if (report.working_tree) throw new Error('Working tree is dirty; preserve or commit local changes before preparation');
    if (report.target_drift.length) throw new Error('Target drift requires review before preparation');
    {
      const branch = o.branch || `codex/sync-${report.upstream_sha.slice(0, 12)}`;
      git(o.root, 'check-ref-format', '--branch', branch);
      const worktree = resolve(o.worktree || resolve(o.root, '.codex/worktrees', `sync-${report.upstream_sha.slice(0, 12)}`));
      if (existsSync(worktree)) throw new Error(`Worktree already exists; inspect it instead of overwriting: ${worktree}`);
      let parent=dirname(worktree);while(!existsSync(parent)){const next=dirname(parent);if(next===parent)throw new Error('Worktree has no existing parent');parent=next}
      const canonical=resolve(realpathSync(parent),relative(parent,worktree)), sourceRoot=realpathSync(report.source_repository), productRoot=realpathSync(o.root);
      const inside=(base,p)=>{const r=relative(base,p);return !r||(!r.startsWith('..'+sep)&&r!=='..'&&!isAbsolute(r))};
      if(sourceRoot!==productRoot&&inside(sourceRoot,canonical))throw new Error('Worktree must not be inside the external source repository');
      if (inside(productRoot, canonical)) {
        try { git(o.root, 'check-ignore', '-q', canonical); }
        catch { throw new Error('Nested worktree must be Git-ignored; choose an external --worktree path'); }
      }
      mkdirSync(dirname(worktree), { recursive: true });
      git(o.root, 'worktree', 'add', '-b', branch, worktree, report.head_sha);
      const result = { ...report, preparation: 'PROPOSAL_REVIEW_REQUIRED', worktree, branch, recovery: 'The worktree starts at the product HEAD; source files were not merged. Review every pending change before adapting targets.' };
      const proposal = resolve(worktree, '.scratch/upstream-proposal.json');
      if (existsSync(proposal)) throw new Error(`Proposal already exists; merged worktree retained at ${worktree}`);
      mkdirSync(dirname(proposal), { recursive: true });
      writeFileSync(proposal, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
      console.log(JSON.stringify(result, null, 2));
    }
  }
} catch (e) { console.error(`Upstream preparation refused: ${e.message}`); process.exitCode = 2; }
