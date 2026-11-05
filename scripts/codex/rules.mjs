import { readFileSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainEntry } from './main-entry.mjs';
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const index = JSON.parse(readFileSync(resolve(root, '.agents/rules/index.json'), 'utf8'));
function alternatives(pattern) {
  const m = pattern.match(/\{([^{}]+)\}/);
  return m ? m[1].split(',').flatMap(v => alternatives(pattern.slice(0, m.index) + v + pattern.slice(m.index + m[0].length))) : [pattern];
}
function regexp(pattern) {
  let s = '^';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*' && pattern[i + 1] === '*') { i++; if (pattern[i + 1] === '/') { i++; s += '(?:[^/]+/)*'; } else s += '.*'; }
    else if (c === '*') s += '[^/]*';
    else if (c === '?') s += '[^/]';
    else s += /[\\^$.*+?()[\]{}|]/.test(c) ? `\\${c}` : c;
  }
  return new RegExp(s + '$');
}
export function selectRules(path) {
  if (typeof path !== 'string' || !path || isAbsolute(path) || /^[a-zA-Z]:/.test(path) || path.startsWith('\\\\')) throw new Error('Path must be repository-relative');
  const normalized = path.replaceAll('\\', '/').replace(/^\.\//, '');
  if (!normalized || normalized.startsWith('/') || normalized.split('/').some(p => p === '..' || p === '' || p === '.')) throw new Error('Path must be a normalized repository-relative path');
  return index.rules.filter(rule => rule.patterns.some(p => alternatives(p).some(a => regexp(a).test(normalized))));
}
if (isMainEntry(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let path, json = false, content = false;
    while (args.length) { const a = args.shift(); if (a === '--path' && args.length) path = args.shift(); else if (a === '--json') json = true; else if (a === '--content') content = true; else throw new Error(`Unknown or incomplete argument: ${a}`); }
    if (!path || (json && content)) throw new Error('Usage: rules.mjs --path REPOSITORY_RELATIVE [--json|--content]');
    const matches = selectRules(path);
    if (json) console.log(JSON.stringify({ path: path.replaceAll('\\', '/'), enforcement: index.enforcement, rules: matches }, null, 2));
    else if (content) for (const r of matches) console.log(`--- ${r.target} ---\n${readFileSync(resolve(root, r.target), 'utf8')}`);
    else for (const r of matches) console.log(r.target);
  } catch (e) { console.error(e.message); process.exitCode = 2; }
}
