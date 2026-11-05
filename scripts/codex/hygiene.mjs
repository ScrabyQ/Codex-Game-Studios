import {execFileSync} from 'node:child_process';
import {lstatSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

function activeLegacyInstruction(name, content) {
  const instructions = /^(?:\.agents\/(?:skills|docs|rules)\/|\.codex\/agents\/|studio-tests\/|docs\/|\.github\/)/.test(name) || /(?:^|\/)(?:AGENTS|README|UPGRADING|CONTRIBUTING|CHANGELOG)\.md$/.test(name);
  if (!instructions || !/\.(?:md|toml|ya?ml)$/.test(name)) return false;
  const negated = (clause, index) => {
    const prefix = clause.slice(0, index);
    const verbs = [...prefix.matchAll(/\b(?:read|load|open|use|invoke|call|run|execute|write|edit|delete|import|source|follow|consult|set|reject|forbid|skip|skipping|exclude|flag)\b/gi)];
    const verb = verbs.at(-1);
    if (verb) {
      if (/^(?:reject|forbid|skip|skipping|exclude|flag)$/i.test(verb[0])) return true;
      if (/\b(?:do not|must not|never|don't|avoid)\s+(?:(?:ever|directly|implicitly|automatically)\s+)*$/i.test(prefix.slice(0, verb.index))) return true;
    }
    return /\b(?:no|without|never|avoid)\s+(?:(?:any|the|a)\s+)?[`*"'(@\[]*$/i.test(prefix);
  };
  // Negation belongs to an occurrence's governing action, not an unrelated
  // clause elsewhere on the line. Decode escaped TOML body newlines as well.
  return content.split(/\r?\n|\\n/).some(line => line.split(/;\s*|[.!?]\s+/).some(clause => {
    if (/^\s*(?:#\s*Generated from\b|(?:[-*>#]\s*)*(?:negative example|source provenance)\s*:)/i.test(clause)) return false;
    const tokens = /\.claude[\\/]|\bCLAUDE(?:\.local)?\.md\b|@\.claude\b|\bAskUserQuestion\s*[:(]|\bsubagent_type\s*[:=]|\bCLAUDE_CODE_[A-Z_]+\b/g;
    for (const match of clause.matchAll(tokens)) if (!negated(clause, match.index)) return true;
    for (const match of clause.matchAll(/\bAskUserQuestion\b/g)) {
      if (/\b(?:use|invoke|call|required|must)\b.{0,80}$/i.test(clause.slice(0, match.index)) && !negated(clause, match.index)) return true;
    }
    return false;
  }));
}

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
    if (/(^|\/)\.claude(?:\/|$)|(^|\/)CLAUDE(?:\.local)?\.md$/i.test(name)) {
      findings.push([name, 'legacy client file']); continue;
    }
    if (/^docs\/codex\/(?:evidence\/|progress\.json$|fork\.json$|audit\.md$)/i.test(name) || /(^|\/)progress\.md$/i.test(name) || /\.(?:log|jsonl)$/i.test(name) || /^docs\/codex\/.*\.(?:png|jpe?g)$/i.test(name)) {
      findings.push([name, 'generated report']); continue;
    }
    let bytes;
    try { bytes = readFileSync(path.join(root,name)); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
    if (bytes.includes(0)) continue;
    const content = bytes.toString('utf8');
    if (activeLegacyInstruction(name, content)) findings.push([name, 'active legacy instruction']);
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
