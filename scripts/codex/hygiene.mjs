import {execFileSync} from 'node:child_process';
import {lstatSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function inspect(root) {
  const names = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {cwd:root}).toString().split('\0').filter(Boolean);
  const findings = [];
  for (const name of new Set(names)) {
    let current=root, unsafe=false;
    for (const segment of name.split('/')) {
      current=path.join(current,segment);
      let entry;
      try { entry=lstatSync(current); } catch(e) { if (e.code==='ENOENT') { unsafe=true; break; } throw e; }
      if (entry.isSymbolicLink()) { findings.push([name,'symbolic link']); unsafe=true; break; }
    }
    if (unsafe) continue;
    if (/(^|\/)\.env[^/]*$/i.test(name)) { findings.push([name, 'environment file']); continue; }
    if (/^docs\/codex\/(?:evidence\/|progress\.json$|fork\.json$|audit\.md$)/i.test(name) || /(^|\/)progress\.md$/i.test(name) || /\.(?:log|jsonl)$/i.test(name) || /^docs\/codex\/.*\.(?:png|jpe?g)$/i.test(name)) {
      findings.push([name, 'generated report']); continue;
    }
    let bytes;
    try { bytes = readFileSync(path.join(root,name)); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
    if (bytes.includes(0)) continue;
    const content = bytes.toString('utf8');
    if (/(?:[A-Za-z]:[\\/]+Users[\\/]+|\/Users\/|\/home\/)(?!(?:example|user|username|runner|me|shared)(?:[\\/]|$)|\$|\{|<)[\w.-]+[\\/]/i.test(content)) findings.push([name, 'personal path']);
    if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bghp_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/.test(content)) findings.push([name, 'credential']);
  }
  return findings;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = inspect(path.resolve(process.argv[2] || '.'));
  for (const [name, reason] of findings) console.error(reason + ': ' + name);
  if (findings.length) process.exitCode = 1;
  else console.log('PASS repository hygiene');
}
