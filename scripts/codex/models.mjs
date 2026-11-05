import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainEntry } from './main-entry.mjs';
const policy = JSON.parse(readFileSync(new URL('../../.codex/model-policy.json', import.meta.url), 'utf8'));
export function resolveModel({ role, skill, family, available, overrideSupported = false } = {}) {
  if (role && skill) throw new Error('Choose a role or a skill, not both.');
  const mapping = role ? policy.roles[role] : skill ? policy.skills[skill] : null;
  if ((role || skill) && !mapping && !family) throw new Error(`Unknown ${role ? 'role' : 'skill'}: ${role || skill}`);
  const selectedFamily = family || mapping?.family || policy.default_family;
  if (selectedFamily === 'inherit') return { role: role || null, skill: skill || null, family: 'inherit', source_model: mapping?.source_model || null, requested: null, effort: null, selected: null, action: 'inherit', reason: 'Source role specifies inherited model.' };
  const rule = policy.families[selectedFamily];
  if (!rule) throw new Error(`Unknown model family: ${selectedFamily}`);
  const base = { role: role || null, skill: skill || null, family: selectedFamily, source_model: mapping?.source_model || null, requested: rule.preferred, effort: rule.effort };
  if (!overrideSupported) return { ...base, selected: null, action: 'inherit', reason: 'Model override support is unknown or unavailable.' };
  if (!Array.isArray(available)) return { ...base, selected: null, action: 'inherit', reason: 'Model availability was not supplied.' };
  const selected = [rule.preferred, ...rule.fallback].find(m => available.includes(m));
  if (!selected) return { ...base, selected: null, action: 'inherit', reason: 'No policy model is in the supplied available catalog.' };
  return { ...base, selected, action: 'select', reason: selected === rule.preferred ? 'Preferred model is available.' : 'Preferred model unavailable; selected an available fallback.' };
}
if (isMainEntry(import.meta.url)) {
  try {
    const args = process.argv.slice(2); if (args.shift() !== 'resolve') throw new Error('Usage: models.mjs resolve [--role ROLE|--skill SKILL|--family FAMILY] [--available CSV] [--override-supported]');
    const options = {};
    while (args.length) { const k = args.shift(); if (k === '--override-supported') options.overrideSupported = true; else if (['--role', '--skill', '--family', '--available'].includes(k) && args.length) { const v = args.shift(); options[k.slice(2)] = k === '--available' ? v.split(',').filter(Boolean) : v; } else throw new Error(`Invalid argument: ${k}`); }
    console.log(JSON.stringify(resolveModel(options), null, 2));
  } catch (e) { console.error(e.message); process.exitCode = 2; }
}
