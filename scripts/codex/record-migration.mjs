import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import { safeProjectPath, readManualTarget } from './safe-path.mjs';

// Records an integrator-reviewed result. File existence is never a test verdict.
const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
try {
  const { values: v } = parseArgs({ options: { root: { type: 'string' }, kind: { type: 'string' }, names: { type: 'string' }, prefix: { type: 'string' }, source: { type: 'string' }, id: { type: 'string' }, status: { type: 'string' }, review: { type: 'string' } } });
  const root=resolve(v.root || defaultRoot);
  if (!['PORTED', 'EQUIVALENT', 'PENDING', 'UNSUPPORTED'].includes(v.status) || !v.review?.trim()) throw new Error('Explicit status and reviewed verification note are required');
  const manifestPath = safeProjectPath(root, 'docs/codex/migration-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const registry = JSON.parse(readFileSync(safeProjectPath(root, 'docs/codex/generation-manifest.json'), 'utf8'));
  const inventory = JSON.parse(readFileSync(safeProjectPath(root, 'docs/codex/upstream-inventory.json'), 'utf8'));
  const bySource = new Map(inventory.files.map(e => [e.path, e]));
  const sha = bytes => createHash('sha256').update(bytes).digest('hex');
  const names = v.names?.split(',');
  if ([Boolean(v.source),Boolean(v.id),Boolean(v.prefix),Boolean(v.kind||v.names)].filter(Boolean).length!==1) throw new Error('Select exactly one of id, source, prefix, or kind/names');
  if (v.prefix && !['.claude/docs/', '.claude/hooks/', '.claude/scripts/'].includes(v.prefix)) throw new Error('Unsupported source prefix');
  if (!v.prefix && !v.source && !v.id && (!names?.length || !['skill', 'agent', 'rule', 'script'].includes(v.kind))) throw new Error('Select explicit kind/names, exact source, or a supported source prefix');
  const selected = manifest.entries.filter(e => v.id ? e.id===v.id : v.source ? e.id===`file:${v.source}` && e.source===v.source : v.prefix ? e.source.startsWith(v.prefix) : v.kind === 'skill' ? names.some(n => e.source.startsWith(`.claude/skills/${n}/`)) : e.category === v.kind && names.includes(e.source.split('/').pop().replace(/\.md$/, '')));
  if(v.source && selected.length!==1)throw new Error('Exact source must identify one known matrix file entry');
  if (!selected.length) throw new Error('No source components selected');
  const plans = selected.map(entry => {
    const targets = registry.entries.filter(t => t.source === entry.source || t.sources?.includes(entry.source)).sort((a,b) => Number(b.source === entry.source) - Number(a.source === entry.source) || a.target.localeCompare(b.target));
    const manual=[...(entry.target?[{target:entry.target,sha256:entry.target_sha256}]:[]),...(entry.related_targets||[])].filter(t=>!targets.some(r=>r.target===t.target));
    for(const t of manual){if(!/^[a-f0-9]{64}$/.test(t.sha256||'')||sha(readManualTarget(root,t.target))!==t.sha256)throw Error(`Unreconciled manual target: ${t.target}`)}
    if (!targets.length && !manual.length && v.status!=='UNSUPPORTED' && v.status!=='PENDING') throw new Error(`Source has no reviewed target: ${entry.source}`);
    for (const target of targets) {
      const inputs = target.sources || [target.source];
      for (const p of inputs) if(!bySource.has(p)) throw new Error(`Unknown source: ${p}`);
      const expected=target.sources ? sha(Buffer.from(JSON.stringify(inputs.map(p=>[p,bySource.get(p).sha256])))) : entry.source_sha256;
      if (sha(readFileSync(safeProjectPath(root, target.target,{roots:['.agents/','.codex/']}))) !== target.target_sha256 || target.source_sha256 !== expected) throw new Error(`Unreconciled source/target: ${entry.source}`);
    }
    return { entry, targets, manual };
  });
  for (const { entry, targets, manual } of plans) {
    entry.status = v.status;
    const all=[...targets.map(t=>({target:t.target,sha256:t.target_sha256})),...manual];if(all.length){entry.target=all[0].target;entry.target_sha256=all[0].sha256;entry.related_targets=all.slice(1)}
    entry.verification = v.review;
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ components: plans.length, status: v.status, verification_is_integrator_reviewed: true }));
} catch (error) { console.error(`record-migration: ${error.message}`); process.exitCode = 1; }
