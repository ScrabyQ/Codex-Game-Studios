import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';
import { baseline } from './baseline.mjs';
import { safeProjectPath, safeExternalFile } from './safe-path.mjs';
import pathModule from 'node:path';

// Git object contents, never the working tree, are authoritative.
const arg=process.argv.slice(2),seen=new Set();
for(let i=0;i<arg.length;i++){const key=arg[i];if(seen.has(key)||!['--check','--verify-pending','--manifest','--candidate','--output-dir','--source-repo','--source-ref'].includes(key))throw Error('Unknown or duplicate inventory argument: '+key);seen.add(key);if(!['--check','--verify-pending'].includes(key)){if(!arg[i+1]||arg[i+1].startsWith('--'))throw Error('Incomplete inventory argument: '+key);i++}}
if(seen.has('--verify-pending')&&!seen.has('--check'))throw Error('--verify-pending requires --check');
if(seen.has('--candidate')&&(seen.has('--check')||seen.has('--manifest')))throw Error('--candidate cannot be combined with --check or --manifest');
const candidateIndex=arg.indexOf('--candidate'), outIndex=arg.indexOf('--output-dir');
if((candidateIndex<0)!==(outIndex<0))throw Error('--candidate requires --output-dir');
const active=candidateIndex<0?baseline(process.cwd(),{allowPending:seen.has('--verify-pending')}):null;
if(seen.has('--verify-pending')&&active?.state!=='pending')throw Error('--verify-pending requires pending baseline');
const sha=candidateIndex<0?active.source_commit:arg[candidateIndex+1];
if(!/^[a-f0-9]{40}$/.test(sha||''))throw Error('Expected full source commit SHA');
const option=k=>{const i=arg.indexOf(k);return i<0?null:arg[i+1]};
const repository=pathModule.resolve(option('--source-repo')||process.cwd());
const git = (...args) => execFileSync('git', args, { cwd:repository, maxBuffer: 128 * 1024 * 1024 });
if(option('--source-ref')&&git('rev-parse','--verify',`${option('--source-ref')}^{commit}`).toString().trim()!==sha)throw Error('Source ref does not match selected baseline commit');
const hash = b => createHash('sha256').update(b).digest('hex');
const tree = git('ls-tree', '-r', '-z', '--full-tree', sha).toString().split('\0').filter(Boolean).map(line => {
  const m = /^(\d+) (\w+) ([0-9a-f]+)\t([\s\S]+)$/.exec(line);
  if (!m || m[2] !== 'blob') throw new Error(`Unsupported tree entry: ${line}`);
  return { mode: m[1], blob: m[3], path: m[4] };
});
if(tree.some(e=>e.path.split('/').some(part=>/^\.env/i.test(part))))throw Error('Source contains protected .env path; refusing to read its contents');
const batch = execFileSync('git', ['cat-file', '--batch'], { cwd:repository, input: tree.map(x => x.blob).join('\n') + '\n', maxBuffer: 128 * 1024 * 1024 });
let pos = 0;
for (const entry of tree) {
  const end = batch.indexOf(10, pos); const header = batch.subarray(pos, end).toString();
  const m = /^([0-9a-f]+) blob (\d+)$/.exec(header);
  if (!m || m[1] !== entry.blob) throw new Error(`Bad cat-file response: ${header}`);
  const size = Number(m[2]); pos = end + 1;
  entry.content = batch.subarray(pos, pos + size); pos += size + 1;
  entry.sha256 = hash(entry.content);
}
const byPath = new Map(tree.map(e => [e.path, e]));
const settings = JSON.parse(byPath.get('.claude/settings.json').content.toString());
const hooks = [];
for (const [event, groups] of Object.entries(settings.hooks)) for (const [groupIndex, group] of groups.entries()) for (const [hookIndex, hook] of group.hooks.entries()) {
  hooks.push({ id: `hook:${event}:${groupIndex}:${hookIndex}`, event, matcher: group.matcher, ...hook });
}
const hookScripts = new Set(hooks.map(h => /\.claude\/hooks\/[^"\s]+/.exec(h.command)?.[0]).filter(Boolean));
const classify = p => /^\.claude\/agents\/[^/]+\.md$/.test(p) ? 'agent' : /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(p) ? 'skill' : /^\.claude\/rules\/[^/]+\.md$/.test(p) ? 'rule' : /^\.claude\/hooks\/[^/]+\.sh$/.test(p) ? (hookScripts.has(p) ? 'hook-handler' : p.endsWith('/log-instructions.sh') ? 'hook-opt-in-diagnostic' : 'hook-helper') : /^\.claude\/docs\/templates\/guidance\//.test(p) ? 'template-guidance' : /^\.claude\/docs\/templates\/SKILL-CONTRACT-TEMPLATE\.md$/.test(p) ? 'skill-authoring-template' : /^\.claude\/docs\/templates\/[^/]+$/.test(p) ? 'user-template' : /^\.claude\/skills\//.test(p) ? 'skill-resource' : /^studio-tests\//.test(p) ? 'studio-test' : /^docs\/engine-reference\//.test(p) ? 'engine-reference' : /(^|\/)scripts?\//.test(p) ? 'script' : /(^|\/)(docs|documentation)\//.test(p) || /\.md$/.test(p) ? 'documentation' : 'project-resource';
const deps = (text, p) => {
  const found = [];
  for (const [name, re] of [['AskUserQuestion', /\bAskUserQuestion\b/], ['Agent tool', /\bAgent\s*\(|\bAgent tool\b|\bAgent\b(?=[,\s]*\])/], ['dynamic shell expansion !`', /!`/], ['CLAUDE_* environment', /\bCLAUDE_[A-Z0-9_]+\b/], ['Claude model metadata', /^model:\s*\S+/m], ['Claude tool metadata', /^(?:allowed-tools|tools):/m], ['Claude imports', /^@(?:\.claude|docs)\//m], ['Claude hook protocol', /\b(?:hookSpecificOutput|hook_event_name|tool_input|permissionDecision)\b/]]) if (re.test(text)) found.push(name);
  if (p.startsWith('.claude/') && !found.length) found.push('Claude project layout');
  return found;
};
function target(p, kind) {
  if (kind === 'agent') return `.codex/agents/${basename(p, '.md')}.toml`;
  if (kind === 'skill' || kind === 'skill-resource') return p.replace(/^\.claude\/skills\//, '.agents/skills/');
  if (kind === 'rule') return `.agents/rules/${basename(p)}`;
  if (kind.startsWith('hook-')) return `.agents/hooks/${basename(p)}`;
  if (p === 'CLAUDE.md') return 'AGENTS.md';
  if (p === '.claude/settings.json') return '.codex/config.toml and documented permission/event fallbacks';
  if (p.startsWith('.claude/docs/')) return p.replace('.claude/docs/', '.agents/docs/');
  if (p.startsWith('.claude/scripts/')) return p.replace('.claude/scripts/', '.agents/scripts/');
  return `${p} (preserve/review)`;
}
const files = tree.map(e => {
  const text = e.content.toString('utf8'); const kind = classify(e.path);
  const desc = /^description:\s*["']?(.+?)["']?\s*$/m.exec(text)?.[1] || /^#\s+(.+)$/m.exec(text)?.[1];
  return { path: e.path, mode: e.mode, git_blob: e.blob, sha256: e.sha256, category: kind, purpose: desc ? desc.slice(0, 240) : `${kind.replaceAll('-', ' ')}: ${e.path}`, claude_dependencies: deps(text, e.path) };
});
const counts = Object.fromEntries([...new Set(files.map(f => f.category))].sort().map(c => [c, files.filter(f => f.category === c).length]));
const inventory = { schema: 1, source_commit: sha, counts, hooks, files };
const matrix = files.map(f => ({ id: `file:${f.path}`, source: f.path, source_sha256: f.sha256, category: f.category, purpose: f.purpose, claude_dependencies: f.claude_dependencies, proposed_target: target(f.path, f.category), proposed_equivalent: f.claude_dependencies.length ? 'Review dependencies and adapt to supported Codex instructions, tools, or documented manual fallback.' : 'Preserve content and verify in Codex workflow.', verification: 'Compare source content and exercise relevant adapted workflow; record evidence before changing status.', status: 'PENDING' }));
for (const h of hooks) matrix.push({ id: h.id, source: `.claude/settings.json#${h.id}`, source_sha256: byPath.get('.claude/settings.json').sha256, category: 'hook-declaration', purpose: `${h.event} (${h.matcher || 'all'}): ${h.command}`, claude_dependencies: ['Claude hook protocol', 'CLAUDE_* environment'], proposed_target: `scripts/codex/hooks.mjs (review ${h.event} event availability)`, proposed_equivalent: 'Use a supported event integration if available; otherwise document and test an explicit manual or CI fallback.', verification: 'Exercise trigger, input and safety behavior or document tested limitation.', status: 'PENDING' });
const manifest = { schema: 1, source_commit: sha, statuses: ['PENDING', 'PORTED', 'EQUIVALENT', 'UNSUPPORTED'], entries: matrix };
const json = o => JSON.stringify(o, null, 2) + '\n';
const outputs = [['docs/codex/upstream-inventory.json', inventory], ['docs/codex/migration-manifest.json', manifest]];
if(candidateIndex>=0){const out=safeExternalFile(arg[outIndex+1],{allowMissing:true});mkdirSync(out,{recursive:true});for(const [name,data] of outputs)writeFileSync(pathModule.join(out,pathModule.basename(name)),json(data),{flag:'wx'});console.log('Prepared candidate inventory at '+sha);process.exit(0)}
const check = process.argv.includes('--check');
const index = process.argv.indexOf('--manifest');
if (index !== -1 && (!check || !process.argv[index + 1])) throw new Error('--manifest requires --check and a path');
if (check) {
  for (const [path, expected] of outputs) {
    const actual = JSON.parse(readFileSync(path.endsWith('migration-manifest.json') && index !== -1 ? safeExternalFile(process.argv[index + 1]) : safeProjectPath(process.cwd(),path), 'utf8'));
    if (path.endsWith('migration-manifest.json')) {
      if (actual.schema !== 1 || actual.source_commit !== sha || JSON.stringify(actual.statuses) !== JSON.stringify(manifest.statuses) || !Array.isArray(actual.entries) || actual.entries.length !== matrix.length) throw new Error('Manifest header or entry count mismatch');
      const actualById = new Map(actual.entries.map(e => [e.id, e]));
      if (actualById.size !== matrix.length) throw new Error('Duplicate manifest IDs');
      for (const e of matrix) {
        const a = actualById.get(e.id);
        if (!a || a.source !== e.source || a.source_sha256 !== e.source_sha256 || a.category !== e.category || !manifest.statuses.includes(a.status) || !a.purpose || !Array.isArray(a.claude_dependencies) || !a.proposed_target || !a.proposed_equivalent || !a.verification) throw new Error(`Incomplete or drifted manifest entry: ${e.id}`);
      }
    } else if (json(actual) !== json(expected)) throw new Error(`Inventory drift: ${path}`);
  }
  console.log(`${seen.has('--verify-pending')?'PENDING verification only':'PASS'}: ${files.length} tracked files and ${hooks.length} hook declarations accounted for at ${sha}`);
} else {
  for (const [path, data] of outputs) writeFileSync(safeProjectPath(process.cwd(),path), json(data), { flag: 'wx' });
  console.log(`Generated ${files.length} files and ${hooks.length} hook declarations at ${sha}`);
}
