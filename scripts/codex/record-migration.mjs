import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';

// Records an integrator-reviewed result. File existence is never a test verdict.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
try {
  const { values: v } = parseArgs({ options: { kind: { type: 'string' }, names: { type: 'string' }, prefix: { type: 'string' }, task: { type: 'string' }, status: { type: 'string' }, evidence: { type: 'string', multiple: true }, note: { type: 'string' } } });
  if (!/^CGS-(?:0[1-9]|[12][0-9]|3[01])$/.test(v.task || '') || !['PORTED', 'EQUIVALENT', 'PENDING', 'UNSUPPORTED'].includes(v.status) || !v.note || !v.evidence?.length) throw new Error('Task, explicit status, reviewed verification note and evidence are required');
  for (const file of v.evidence) {
    const path = resolve(root, file), rel = relative(root, path);
    if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(path)) throw new Error(`Evidence must exist inside repository: ${file}`);
  }
  const manifestPath = resolve(root, 'docs/codex/migration-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const registry = JSON.parse(readFileSync(resolve(root, 'docs/codex/generation-manifest.json'), 'utf8'));
  const names = v.names?.split(',');
  if (v.prefix && !['.claude/docs/', '.claude/hooks/', '.claude/scripts/'].includes(v.prefix)) throw new Error('Unsupported source prefix');
  if (!v.prefix && (!names?.length || !['skill', 'agent', 'rule'].includes(v.kind))) throw new Error('Select explicit kind/names or a supported source prefix');
  const selected = manifest.entries.filter(e => v.prefix ? e.source.startsWith(v.prefix) : v.kind === 'skill' ? names.some(n => e.source.startsWith(`.claude/skills/${n}/`)) : e.category === v.kind && names.includes(e.source.split('/').pop().replace(/\.md$/, '')));
  if (!selected.length) throw new Error('No source components selected');
  const plans = selected.map(entry => {
    const targets = registry.entries.filter(t => t.source === entry.source);
    if (!targets.length) throw new Error(`Source has no registered generated target: ${entry.source}`);
    for (const target of targets) {
      const hash = createHash('sha256').update(readFileSync(resolve(root, target.target))).digest('hex');
      if (hash !== target.target_sha256 || target.source_sha256 !== entry.source_sha256) throw new Error(`Unreconciled source/target: ${entry.source}`);
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
