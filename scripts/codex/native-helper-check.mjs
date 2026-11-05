import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = resolve(fileURLToPath(new URL('../..', import.meta.url)));
function quoted(s) { if (s.startsWith('"')) return JSON.parse(s); if (s.startsWith("'")) { if (!s.endsWith("'")) throw Error('unclosed quoted scalar'); return s.slice(1, -1).replaceAll("''", "'"); } if (!s || /^(?:[\[{]|[|>])/.test(s)) throw Error('unsupported scalar or empty value'); return s.replace(/\s+#.*$/, ''); }
function skillCheck(text, name) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!front) throw Error('missing or unclosed frontmatter');
  const fields = {};
  for (const line of front[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const m = /^([a-z][a-z0-9-]*):\s*(.*)$/.exec(line);
    if (!m) { if (fields.metadata === 'mapping' && /^  [a-z][a-z0-9_-]*:\s*\S/.test(line)) { quoted(line.slice(line.indexOf(':') + 1).trim()); continue; } throw Error(`malformed frontmatter: ${line}`); }
    if (Object.hasOwn(fields, m[1])) throw Error(`duplicate field: ${m[1]}`);
    if (!['name', 'description', 'metadata'].includes(m[1])) throw Error(`unsupported field: ${m[1]}`);
    if (m[1] === 'metadata' && m[2]) throw Error('metadata must be a mapping in this structural subset');
    fields[m[1]] = m[1] === 'metadata' ? 'mapping' : quoted(m[2]);
  }
  if (fields.name !== name || !fields.description) throw Error('name mismatch or missing description');
}
function roleCheck(text, name) {
  const fields = {}; let section = '', shellToolSeen = false;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue;
    if (line.trim() === '[features]') { if (section) throw Error('duplicate features section'); section = 'features'; continue; }
    if (section === 'features' && /^shell_tool\s*=\s*(true|false)\s*$/.test(line)) { if (shellToolSeen) throw Error('duplicate shell_tool'); shellToolSeen = true; continue; }
    const m = /^([a-z_]+)\s*=\s*(".*")\s*$/.exec(line);
    if (!m || section) throw Error('unsupported or malformed TOML; only generated basic-string subset is assessed');
    if (Object.hasOwn(fields, m[1])) throw Error(`duplicate field: ${m[1]}`);
    fields[m[1]] = JSON.parse(m[2]);
  }
  if (fields.name !== name || !fields.description || !fields.developer_instructions) throw Error('name mismatch or missing required role field');
  if ('model' in fields) throw Error('native role model pin present');
}
try {
  const args = process.argv.slice(2), kind = args.shift(); let root = repo, name;
  if (!['skill', 'role'].includes(kind)) throw Error('expected skill or role');
  while (args.length) { const a = args.shift(); if (a === '--root' && args.length) root = resolve(args.shift()); else if (kind === 'role' && a === '--agent' && args.length) name = args.shift(); else if (a === '--help' || a === '-h') { console.log('Usage: native-helper-check.mjs skill NAME|all [--root DIR] | role [--agent NAME] [--root DIR]'); process.exit(0); } else if (!a.startsWith('-') && !name) name = a; else throw Error(`Unsupported argument: ${a}`); }
  const base = join(root, kind === 'skill' ? '.agents/skills' : '.codex/agents');
  if (!existsSync(base)) throw Error(`NOT ASSESSED: missing ${base}`);
  if (name && name !== 'all' && !/^[a-z0-9][a-z0-9-]*$/.test(name)) throw Error('Invalid name');
  const names = name && name !== 'all' ? [name] : readdirSync(base, { withFileTypes: true }).filter(d => kind === 'skill' ? d.isDirectory() : d.isFile() && d.name.endsWith('.toml')).map(d => kind === 'skill' ? d.name : d.name.slice(0, -5));
  if (!names.length) throw Error(`NOT ASSESSED: no native ${kind} files`);
  let failures = 0;
  for (const n of names) {
    const file = kind === 'skill' ? join(base, n, 'SKILL.md') : join(base, `${n}.toml`);
    try { (kind === 'skill' ? skillCheck : roleCheck)(readFileSync(file, 'utf8'), n); console.log(`${kind}\t${n}\tstructural=ok\t${file}`); }
    catch (e) { failures++; console.log(`${kind}\t${n}\tNOT_ASSESSED_OR_INVALID\t${e.message}`); }
  }
  console.log(`checked\t${names.length - failures}\tof ${names.length}\tstructural subset only; behavioral review not assessed`);
  if (failures) process.exitCode = 1;
} catch (e) { console.error(e.message); process.exitCode = 2; }
