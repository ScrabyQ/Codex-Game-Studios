import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';

// A local implementation journal only. Never performs work or changes external task state.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const { values, positionals } = parseArgs({ allowPositionals: true, options: {
  status: { type: 'string' }, commit: { type: 'string' }, evidence: { type: 'string', multiple: true },
  next: { type: 'string' }, note: { type: 'string' },
} });
try {
  const file = resolve(root, 'docs/codex/progress.json');
  const progress = JSON.parse(readFileSync(file, 'utf8'));
  const task = progress.tasks.find(t => t.key === positionals[0]);
  if (!task || positionals.length !== 1) throw new Error('Usage: task-status.mjs CGS-NN --status PENDING|IN_PROGRESS|COMPLETE [--commit SHA] [--evidence PATH] [--next CGS-NN] [--note TEXT]');
  if (values.status && !['PENDING', 'IN_PROGRESS', 'COMPLETE'].includes(values.status)) throw new Error('Invalid task status');
  if (values.next && !progress.tasks.some(t => t.key === values.next)) throw new Error('Unknown next task');
  let commit;
  if (values.commit) {
    if (!/^[0-9a-f]{40}$/.test(values.commit)) throw new Error('Use a full verified commit SHA');
    commit = execFileSync('git', ['rev-parse', '--verify', `${values.commit}^{commit}`], { cwd: root, encoding: 'utf8' }).trim();
  }
  for (const entry of values.evidence || []) {
    const target = resolve(root, entry), rel = relative(root, target);
    if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(target)) throw new Error(`Evidence must exist inside the repository: ${entry}`);
  }
  if (values.status === 'COMPLETE' && !(values.evidence?.length || task.evidence?.length)) throw new Error('Completion needs a verification artifact; the caller must review its results');
  if (values.status) task.status = values.status;
  if (commit) task.commit = commit;
  task.evidence = [...new Set([...(task.evidence || []), ...(values.evidence || [])])];
  if (values.note) task.note = values.note;
  task.updated_at = new Date().toISOString();
  if (values.status === 'COMPLETE') progress.last_completed = task.key;
  if (values.next) progress.current_task = values.next;
  if (values.note) progress.next_safe_step = values.note;
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, JSON.stringify(progress, null, 2) + '\n');
  renameSync(temporary, file);
  const checkpoint = resolve(root, 'production/session-state/active.md');
  mkdirSync(dirname(checkpoint), { recursive: true });
  appendFileSync(checkpoint, `\n## ${task.updated_at} — ${task.key}\nStatus: ${task.status}; commit: ${task.commit || 'not yet recorded'}.\nEvidence: ${task.evidence.join('; ')}\nCurrent task: ${progress.current_task}. Next safe step: ${progress.next_safe_step}\nRead docs/codex/progress.json and current Singularity requirements before resuming.\n`);
  console.log(JSON.stringify({ task: task.key, status: task.status, commit: task.commit, next: progress.current_task, singularity_id: task.singularity_id }));
} catch (error) {
  console.error(`task-status: ${error.message}`);
  process.exitCode = 1;
}
