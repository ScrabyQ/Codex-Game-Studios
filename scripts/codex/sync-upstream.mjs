import { existsSync, mkdirSync, writeFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { git, inspect, options } from './upstream-common.mjs';
function sameDirectory(a,b){const x=statSync(a,{bigint:true}),y=statSync(b,{bigint:true});if(x.ino===0n||y.ino===0n)throw Error('Filesystem directory identity unavailable; refusing worktree preparation');return x.dev===y.dev&&x.ino===y.ino}
function physicallyInside(root, existingParent){
  let current=realpathSync.native(existingParent);
  while(true){if(sameDirectory(root,current))return true;const next=dirname(current);if(next===current)return false;current=next}
}
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
      const sourceRoot=realpathSync.native(report.source_repository), productRoot=realpathSync.native(o.root);
      if(!sameDirectory(sourceRoot,productRoot)&&physicallyInside(sourceRoot,parent))throw new Error('Worktree must not be inside the external source repository');
      if (physicallyInside(productRoot,parent)) {
        try { git(o.root, 'check-ignore', '-q', worktree); }
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
