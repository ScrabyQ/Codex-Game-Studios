import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

// Records an integrator-reviewed result. File existence is never a test verdict.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
try {
  const { values: v } = parseArgs({ options: { kind: { type: 'string' }, names: { type: 'string' }, prefix: { type: 'string' }, source: { type: 'string' }, task: { type: 'string' }, status: { type: 'string' }, evidence: { type: 'string', multiple: true }, note: { type: 'string' } } });
  if (!/^CGS-(?:0[1-9]|[12][0-9]|3[01])$/.test(v.task || '') || !['PORTED', 'EQUIVALENT', 'PENDING', 'UNSUPPORTED'].includes(v.status) || !v.note || !v.evidence?.length) throw new Error('Task, explicit status, reviewed verification note and evidence are required');
  for (const file of v.evidence) {
    const path = resolve(root, file), rel = relative(root, path);
    if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(path)) throw new Error(`Evidence must exist inside repository: ${file}`);
  }
  const manifestPath = resolve(root, 'docs/codex/migration-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const registry = JSON.parse(readFileSync(resolve(root, 'docs/codex/generation-manifest.json'), 'utf8'));
  const inventory = JSON.parse(readFileSync(resolve(root, 'docs/codex/upstream-inventory.json'), 'utf8'));
  const bySource = new Map(inventory.files.map(e => [e.path, e]));
  const sha = bytes => createHash('sha256').update(bytes).digest('hex');
  const names = v.names?.split(',');
  if ([Boolean(v.source),Boolean(v.prefix),Boolean(v.kind||v.names)].filter(Boolean).length!==1) throw new Error('Select exactly one of source, prefix, or kind/names');
  if (v.prefix && !['.claude/docs/', '.claude/hooks/', '.claude/scripts/'].includes(v.prefix)) throw new Error('Unsupported source prefix');
  if (!v.prefix && !v.source && (!names?.length || !['skill', 'agent', 'rule', 'script'].includes(v.kind))) throw new Error('Select explicit kind/names, exact source, or a supported source prefix');
  const selected = manifest.entries.filter(e => v.source ? e.id===`file:${v.source}` && e.source===v.source : v.prefix ? e.source.startsWith(v.prefix) : v.kind === 'skill' ? names.some(n => e.source.startsWith(`.claude/skills/${n}/`)) : e.category === v.kind && names.includes(e.source.split('/').pop().replace(/\.md$/, '')));
  if(v.source && selected.length!==1)throw new Error('Exact source must identify one known matrix file entry');
  if (!selected.length) throw new Error('No source components selected');
  const plans = selected.map(entry => {
    const targets = registry.entries.filter(t => t.source === entry.source || t.sources?.includes(entry.source)).sort((a,b) => Number(b.source === entry.source) - Number(a.source === entry.source) || a.target.localeCompare(b.target));
    if (!targets.length) throw new Error(`Source has no registered generated target: ${entry.source}`);
    for (const target of targets) {
      const inputs = target.sources || [target.source];
      for (const p of inputs) { const f=bySource.get(p),bytes=readFileSync(resolve(root,p)); if(!f || (sha(bytes)!==f.sha256 && sha(Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n')))!==f.sha256)) throw new Error(`Unreconciled source/target: ${entry.source}`); }
      const expected=target.sources ? sha(Buffer.from(JSON.stringify(inputs.map(p=>[p,bySource.get(p).sha256])))) : entry.source_sha256;
      if (sha(readFileSync(resolve(root, target.target))) !== target.target_sha256 || target.source_sha256 !== expected) throw new Error(`Unreconciled source/target: ${entry.source}`);
    }
    return { entry, targets };
  });
  for (const { entry, targets } of plans) {
    entry.status = v.status;
    entry.task = v.task;
    entry.target = targets[0].target;
    entry.target_sha256 = targets[0].target_sha256;
    entry.related_targets = targets.slice(1).map(t => ({ target: t.target, sha256: t.target_sha256 }));
    entry.evidence = [...new Set([...(entry.evidence || []), ...v.evidence])];
    entry.verification = v.note;
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ task: v.task, components: plans.length, status: v.status, verification_is_integrator_reviewed: true }));
} catch (error) { console.error(`record-migration: ${error.message}`); process.exitCode = 1; }
