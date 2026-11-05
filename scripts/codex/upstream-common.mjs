import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { openSource } from './source.mjs';
import { safeProjectPath, readManualTarget } from './safe-path.mjs';

export const hash = b => createHash('sha256').update(b).digest('hex');
export function within(root, path) { const rel = relative(resolve(root), resolve(path)); return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); }
export function git(root, ...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd(); }
export function options(argv) {
  const out = { root: process.cwd(), remote: 'upstream', ref: 'main' };
  const seen = new Set();
  for (let i = 0; i < argv.length; i++) {
    if (!/^--[a-z-]+$/.test(argv[i])) throw new Error(`Malformed option: ${argv[i]}`);
    const k = argv[i].replace(/^--/, '');
    if (seen.has(k)) throw new Error(`Duplicate option: --${k}`);
    seen.add(k);
    if (['fetch', 'dry-run', 'prepare'].includes(k)) out[k] = true;
    else if (['root', 'remote', 'ref', 'baseline', 'worktree', 'branch', 'source-repo', 'source-ref'].includes(k) && argv[i + 1] && !argv[i + 1].startsWith('-') && !/[\0\r\n]/.test(argv[i + 1])) out[k] = argv[++i];
    else throw new Error(`Unknown or incomplete option: ${argv[i]}`);
  }
  out.root = resolve(out.root);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(out.remote) || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(out.ref) || out.ref.includes('..')) throw new Error('Unsafe remote/ref');
  const protectedBranch=out.branch?.toLowerCase();
  if (protectedBranch === 'main' || protectedBranch === 'source/ccgs-main' || protectedBranch?.startsWith('source/ccgs-main/')) throw new Error('The main and source mirror branches are protected');
  return out;
}
const json = (root, name, fallback) => {const p=safeProjectPath(root,name);return existsSync(p) ? JSON.parse(readFileSync(p,'utf8')) : fallback};
const category = p => p.startsWith('.claude/agents/') ? 'agent' : p.startsWith('.claude/skills/') ? 'skill' : p.startsWith('.claude/hooks/') ? 'hook' : p.startsWith('.claude/rules/') ? 'rule' : p.startsWith('.claude/docs/templates/') ? 'template' : p === '.claude/settings.json' ? 'hook-declarations' : 'other';
function tree(root, sha) {
  return new Map(git(root, 'ls-tree', '-r', '-z', '--full-tree', sha).split('\0').filter(Boolean).map(line => {
    const m = /^([0-9]+) (\w+) ([0-9a-f]+)\t([\s\S]+)$/.exec(line);
    if (!m) throw new Error('Invalid Git tree');
    return [m[4], { mode: m[1], type: m[2], blob: m[3] }];
  }));
}
export function inspect(o) {
  const root = o.root;
  const migration = json(root, 'docs/codex/migration-manifest.json', { entries: [] });
  const active = json(root, 'docs/codex/active-baseline.json', {});
  const baseline = o.baseline || active.source_commit || migration.source_commit;
  if (!baseline || !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('A full baseline SHA is required');
  git(root, 'check-ref-format', `refs/heads/${o.ref}`);
  if (o.branch) git(root, 'check-ref-format', '--branch', o.branch);
  let repository = resolve(o['source-repo'] || root);
  if (o.fetch && o['source-repo']) throw Error('--fetch cannot modify an external source repository');
  if (o.fetch) git(root, 'fetch', '--no-tags', o.remote, `refs/heads/${o.ref}:refs/remotes/${o.remote}/${o.ref}`);
  const source = openSource({ root, repository, ref: o['source-ref'] || (o.fetch ? `refs/remotes/${o.remote}/${o.ref}` : active.source_ref), fallbackRef: baseline });
  repository=source.repository;
  const baselineOnly = !o['source-ref'] && !o.fetch && !active.source_ref && source.ref === baseline;
  const upstream = source.commit;
  const head = git(root, 'rev-parse', 'HEAD');
  // Rewritten upstream history requires a human decision, never an implicit reset.
  git(repository, 'merge-base', '--is-ancestor', baseline, upstream);
  const old = tree(repository, baseline), next = tree(repository, upstream);
  const generation = json(root, 'docs/codex/generation-manifest.json', { entries: [] });
  const changes = [], manualDrift=[];
  const tokens = git(repository, 'diff', '--name-status', '-z', '-M', baseline, upstream, '--').split('\0').filter(Boolean);
  while (tokens.length) {
    const code = tokens.shift(), first = tokens.shift(), renamed = code.startsWith('R');
    const oldPath = code === 'A' ? null : first, newPath = code === 'D' ? null : renamed ? tokens.shift() : first;
    if (!first || (renamed && !newPath)) throw Error('Invalid Git diff output');
    const sourcePath = oldPath || newPath, a = old.get(oldPath), b = next.get(newPath);
    const inputs = [oldPath, newPath].filter(Boolean);
    const targets = generation.entries.filter(e => inputs.some(p => e.source === p || e.sources?.includes(p))).map(e => ({ target: e.target, recorded_sha256: e.target_sha256, ownership: e.ownership, transforms: e.transform_ids, status: 'PENDING' }));
    const manual = migration.entries.filter(e => inputs.includes(e.source.split('#')[0])).map(e => ({ id: e.id, target: e.target || e.proposed_target, previous_status: e.status, status: 'PENDING' }));
    const diagnostics=[];
    for(const row of migration.entries.filter(e=>inputs.includes(e.source.split('#')[0]))){
      for(const item of [...(row.target?[{target:row.target,sha256:row.target_sha256}]:[]),...(row.related_targets||[])]){
        if(targets.some(t=>t.target===item.target))continue;
        try{const actual=hash(readManualTarget(root,item.target));if(item.sha256&&actual!==item.sha256)manualDrift.push({target:item.target,expected:item.sha256,actual,status:'LOCAL_DRIFT_PRESERVED'});targets.push({target:item.target,recorded_sha256:item.sha256||actual,ownership:'manual',status:'PENDING'})}
        catch(e){diagnostics.push(`Manual target requires explicit review: ${item.target}: ${e.message}`)}
      }
    }
    const contentHash = (entry, p) => entry?.type === 'blob' && !p.split('/').some(part => /^\.env/i.test(part)) ? hash(execFileSync('git', ['cat-file', 'blob', entry.blob], { cwd: repository, maxBuffer: 128 * 1024 * 1024 })) : null;
    const overlayPaths=[...new Set(inputs.map(p=>{const skill=/^\.claude\/skills\/([^/]+)\//.exec(p),helper=/^\.claude\/(?:hooks|scripts)\/([^/]+)$/.exec(p);return skill?`docs/codex/overlays/${skill[1]}.json`:helper?`docs/codex/overlays/helpers/${helper[1]}.json`:null}).filter(Boolean))];
    const overlays=overlayPaths.flatMap(p=>{const f=safeProjectPath(root,p);return existsSync(f)?[{path:p,old_sha256:hash(readFileSync(f))}]:[]});
    const declarations=[];
    if(inputs.includes('.claude/settings.json')){
      const readHooks=entry=>{if(!entry)return new Map();if(entry.type!=='blob'||entry.mode==='120000')throw Error('Settings is not a regular blob');const settings=JSON.parse(execFileSync('git',['cat-file','blob',entry.blob],{cwd:repository}).toString('utf8'));const rows=new Map();for(const [event,groups] of Object.entries(settings.hooks||{}))for(const [i,group] of groups.entries())for(const [j,handler] of (group.hooks||[]).entries())rows.set(`hook:${event}:${i}:${j}`,{event,matcher:group.matcher||'',...handler});return rows};
      try{const before=readHooks(a),after=readHooks(b);for(const id of [...new Set([...before.keys(),...after.keys()])].sort()){const prior=before.get(id)||null,nextValue=after.get(id)||null;if(JSON.stringify(prior)!==JSON.stringify(nextValue))declarations.push({id,old:prior,new:nextValue,status:'PENDING'})}}catch(e){diagnostics.push(`Hook declarations require manual review: ${e.message}`)}
    }
    changes.push({ source: sourcePath, old_path: oldPath, new_path: newPath, category: category(newPath || oldPath), change: renamed ? 'renamed' : code === 'A' ? 'added' : code === 'D' ? 'deleted' : 'modified', old_blob: a?.blob || null, new_blob: b?.blob || null, old_sha256: a ? contentHash(a, oldPath) : null, new_sha256: b ? contentHash(b, newPath) : null, old_mode: a?.mode || null, new_mode: b?.mode || null, status: 'PENDING', targets, overlays, declarations, diagnostics, migration_entries: manual });
  }
  const drift = [...manualDrift,...generation.entries.flatMap(e => {
    const p = safeProjectPath(root, e.target, {roots:['.agents/','.codex/']});
    const actual = existsSync(p) ? hash(readFileSync(p)) : null;
    return actual === e.target_sha256 ? [] : [{ target: e.target, expected: e.target_sha256, actual, status: 'LOCAL_DRIFT_PRESERVED' }];
  })];
  const reconciliation = { state: active.state || 'legacy-baseline', pending: active.state === 'pending', metadata: active, pending_entries: migration.entries.filter(e => e.status === 'PENDING').map(e => e.id) };
  return { schema: 1, source_repository: repository, source_ref: source.ref, baseline_sha: baseline, upstream_sha: upstream, head_sha: head, reconciliation, status: baselineOnly ? 'SOURCE_UNAVAILABLE' : changes.length ? 'REVIEW_REQUIRED' : reconciliation.pending ? 'RECONCILIATION_PENDING' : 'NO_UPSTREAM_CHANGES', groups: Object.fromEntries(['agent', 'skill', 'hook', 'rule', 'template', 'hook-declarations', 'other'].map(c => [c, changes.filter(x => x.category === c).length])), changes, target_drift: drift, working_tree: git(root, 'status', '--porcelain=v1', '--untracked-files=normal'), checklist: ['Review every changed, added, deleted and renamed source; all affected coverage is PENDING.', 'Adapt selected targets in isolation and preserve their hash guards.', 'Run validation and affected behavioral tests before review.'] };
}
