import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHelper } from './helper.mjs';
import { isMainEntry } from './main-entry.mjs';

const families = {
  Godot: { primary: 'godot-specialist', code: ['godot-specialist', 'godot-gdscript-specialist', 'godot-csharp-specialist', 'godot-gdextension-specialist'], shader: ['godot-specialist', 'godot-shader-specialist'], ui: ['godot-specialist'], all: ['godot-specialist', 'godot-gdscript-specialist', 'godot-csharp-specialist', 'godot-gdextension-specialist', 'godot-shader-specialist'] },
  Unity: { primary: 'unity-specialist', code: ['unity-specialist', 'unity-dots-specialist'], shader: ['unity-specialist', 'unity-shader-specialist'], ui: ['unity-specialist', 'unity-ui-specialist'], all: ['unity-specialist', 'unity-dots-specialist', 'unity-addressables-specialist', 'unity-shader-specialist', 'unity-ui-specialist'] },
  Unreal: { primary: 'unreal-specialist', code: ['unreal-specialist', 'ue-blueprint-specialist', 'ue-gas-specialist', 'ue-replication-specialist'], shader: ['unreal-specialist'], ui: ['unreal-specialist', 'ue-umg-specialist'], all: ['unreal-specialist', 'ue-blueprint-specialist', 'ue-gas-specialist', 'ue-replication-specialist', 'ue-umg-specialist'] }
};
const pending = (reason, details = {}) => ({ status: 'PENDING', reason, roles: [], ...details });
export function selectEngineRoles(root = process.cwd()) {
  let result;
  try { result = runHelper('yaml-helper', ['resolve_config', '--keys', 'engine_values,specialists'], resolve(root), 'pipe'); }
  catch (e) { return pending(`Configuration helper unavailable: ${e.message}`); }
  if (result.status !== 0) return pending(`Configuration helper exited ${result.status}: ${result.stderr || ''}`);
  const text = result.stdout || '';
  if (/NO PYTHON INTERPRETER/.test(text + (result.stderr || ''))) return pending('Configuration helper cannot read YAML without Python.');
  if (/Local overrides require a base/i.test(text + (result.stderr || ''))) return pending('project.local.yaml requires a project.yaml base.', { observations: text });
  const engineLine = text.split(/\r?\n/).find(x => x.startsWith('engine_values: '));
  const specLine = text.split(/\r?\n/).find(x => x.startsWith('specialists: '));
  if (!engineLine || !specLine) return pending('Configuration helper did not emit the required observations.', { observations: text });
  const e = /^engine_values: name=(.*?) version=(.*?) language=(.*)$/.exec(engineLine);
  const s = /^specialists: primary=(.*?) code=(.*?) shader=(.*?) ui=(.*?) additional=(.*?) \((.*)\)$/.exec(specLine);
  if (!e || !s) return pending('Configuration observation is not in the expected format.', { observations: text });
  const untag = v => v === 'unset' ? null : v.replace(/\([^()]*\)$/, '');
  const rawEngine = untag(e[1]), engine = rawEngine === 'Unreal Engine' && !e[1].endsWith('(project.yaml)') ? 'Unreal' : rawEngine;
  if (!engine || !families[engine]) return pending(`Engine is unset or invalid: ${rawEngine || 'unset'}.`, { observations: text });
  const family = families[engine], primary = untag(s[1]);
  if (primary !== family.primary) return pending('Resolved primary does not match the configured engine.', { observations: text });
  const values = { code: s[2] === 'unset' ? null : s[2], shader: s[3] === 'unset' ? null : s[3], ui: s[4] === 'unset' ? null : s[4], additional: s[5] === 'none' ? [] : s[5].split(',').map(x => x.trim()).filter(Boolean) };
  for (const key of ['code', 'shader', 'ui']) if (values[key] && !family[key].includes(values[key])) return pending(`Invalid ${key} specialist for ${engine}: ${values[key]}.`, { observations: text });
  for (const name of values.additional) if (!family.all.includes(name)) return pending(`Invalid additional specialist for ${engine}: ${name}.`, { observations: text });
  const language = untag(e[3]);
  if (engine === 'Godot' && ((language === 'C#' && values.code === 'godot-gdscript-specialist') || (language === 'GDScript' && values.code === 'godot-csharp-specialist'))) return pending(`Code specialist ${values.code} conflicts with configured language ${language}.`, { observations: text });
  const roles = [...new Set([primary, values.code, values.shader, values.ui, ...values.additional].filter(Boolean))];
  return { status: 'SELECTED', engine, version: untag(e[2]), language, primary, ...values, roles, observations: text, note: 'Selection does not establish editor, SDK, role spawning, or engine availability.' };
}
if (isMainEntry(import.meta.url)) {
  try { const a = process.argv.slice(2); let root = process.cwd(); while (a.length) { const x = a.shift(); if (x === '--root' && a.length) root = resolve(a.shift()); else if (x !== '--json') throw Error(`Usage: engine-roles.mjs [--root DIR] [--json]; invalid ${x}`); } console.log(JSON.stringify(selectEngineRoles(root), null, 2)); }
  catch (e) { console.error(e.message); process.exitCode = 2; }
}
