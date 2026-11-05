import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';

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
    else if (['root', 'remote', 'ref', 'baseline', 'worktree', 'branch'].includes(k) && argv[i + 1] && !argv[i + 1].startsWith('-') && !/[\0\r\n]/.test(argv[i + 1])) out[k] = argv[++i];
    else throw new Error(`Unknown or incomplete option: ${argv[i]}`);
  }
  out.root = resolve(out.root);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(out.remote) || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(out.ref) || out.ref.includes('..')) throw new Error('Unsafe remote/ref');
  return out;
}
const json = (root, name, fallback) => existsSync(resolve(root, name)) ? JSON.parse(readFileSync(resolve(root, name), 'utf8')) : fallback;
const category = p => p.startsWith('.claude/agents/') ? 'agent' : p.startsWith('.claude/skills/') ? 'skill' : p.startsWith('.claude/hooks/') ? 'hook' : p.startsWith('.claude/rules/') ? 'rule' : p.startsWith('.claude/docs/templates/') ? 'template' : p === '.claude/settings.json' ? 'hook-declarations' : 'other';
function tree(root, sha) {
  return new Map(git(root, 'ls-tree', '-r', '-z', sha).split('\0').filter(Boolean).map(line => {
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
  if (o.fetch) git(root, 'fetch', '--no-tags', o.remote, `refs/heads/${o.ref}:refs/remotes/${o.remote}/${o.ref}`);
  const upstream = git(root, 'rev-parse', '--verify', `refs/remotes/${o.remote}/${o.ref}^{commit}`);
  const head = git(root, 'rev-parse', 'HEAD');
  // Rewritten upstream history requires a human decision, never an implicit reset.
  git(root, 'merge-base', '--is-ancestor', baseline, upstream);
  const old = tree(root, baseline), next = tree(root, upstream);
  const generation = json(root, 'docs/codex/generation-manifest.json', { entries: [] });
  const changes = [];
  for (const source of [...new Set([...old.keys(), ...next.keys()])].sort()) {
    const a = old.get(source), b = next.get(source);
    if (a?.blob === b?.blob && a?.mode === b?.mode) continue;
    const targets = generation.entries.filter(e => e.source === source || e.sources?.includes(source)).map(e => ({ target: e.target, recorded_sha256: e.target_sha256, ownership: e.ownership, transforms: e.transform_ids, status: 'PENDING' }));
    const manual = migration.entries.filter(e => e.source.split('#')[0] === source).map(e => ({ id: e.id, target: e.target || e.proposed_target, previous_status: e.status, status: 'PENDING' }));
    changes.push({ source, category: category(source), change: !a ? 'added' : !b ? 'deleted' : 'modified', old_blob: a?.blob || null, new_blob: b?.blob || null, old_mode: a?.mode || null, new_mode: b?.mode || null, status: 'PENDING', targets, migration_entries: manual });
  }
  const drift = generation.entries.flatMap(e => {
    const p = resolve(root, e.target);
    if (!within(root, p)) throw new Error(`Target escapes root: ${e.target}`);
    const actual = existsSync(p) ? hash(readFileSync(p)) : null;
    return actual === e.target_sha256 ? [] : [{ target: e.target, expected: e.target_sha256, actual, status: 'LOCAL_DRIFT_PRESERVED' }];
  });
  const reconciliation = { state: active.state || 'legacy-baseline', pending: active.state === 'pending', metadata: active, pending_entries: migration.entries.filter(e => e.status === 'PENDING').map(e => e.id) };
  return { schema: 1, baseline_sha: baseline, upstream_sha: upstream, head_sha: head, reconciliation, status: changes.length ? 'REVIEW_REQUIRED' : reconciliation.pending ? 'RECONCILIATION_PENDING' : 'NO_UPSTREAM_CHANGES', groups: Object.fromEntries(['agent', 'skill', 'hook', 'rule', 'template', 'hook-declarations', 'other'].map(c => [c, changes.filter(x => x.category === c).length])), changes, target_drift: drift, working_tree: git(root, 'status', '--porcelain=v1', '--untracked-files=normal'), checklist: ['Review every changed/new/deleted source and declaration; all affected coverage is PENDING.', 'Resolve merge conflicts explicitly in the isolated worktree.', 'Rebase source-bound overlays explicitly; preserve generated target hash guards.', 'Reconcile active inventory and migration evidence; retain historical baseline.', 'Run inventory, generator check, validation and affected behavioral tests.', 'Review diff, commit locally and open a draft PR only with authorization; never auto-merge.'] };
}
