import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { selectEngineRoles } from './engine-roles.mjs';
const names=readdirSync('.codex/agents').filter(n=>/^(godot-|unity-|unreal-|ue-).*\.toml$/.test(n)).map(n=>n.slice(0,-5));
assert.ok(names.length>0);
for(const name of names){
  const content=readFileSync(join('.codex/agents',name+'.toml'),'utf8');
  const instructions=JSON.parse(content.match(/^developer_instructions = (".*")$/m)[1]);
  assert.match(instructions,/in-session role review; not independent/);
  assert.doesNotMatch(content,/^model\s*=/m);
  assert.doesNotMatch(instructions,/CLAUDE_PROJECT_DIR|CLAUDE_SKILL_DIR|AskUserQuestion/);
}
const dir = mkdtempSync(join(tmpdir(), 'cgs-engine-roles-'));
const fixture = (name, yaml, local) => { const r = join(dir, name); mkdirSync(r); if (yaml !== null) writeFileSync(join(r, 'project.yaml'), yaml); if (local) writeFileSync(join(r, 'project.local.yaml'), local); return r; };
const checks = [
  ['godot', 'Godot', 'GDScript', 'godot-gdscript-specialist', 'godot-shader-specialist', 'godot-specialist', ['godot-csharp-specialist', 'godot-gdextension-specialist']],
  ['unity', 'Unity', 'C#', 'unity-specialist', 'unity-shader-specialist', 'unity-ui-specialist', ['unity-addressables-specialist', 'unity-dots-specialist']],
  ['unreal', 'Unreal', 'C++', 'unreal-specialist', 'unreal-specialist', 'ue-umg-specialist', ['ue-blueprint-specialist', 'ue-gas-specialist', 'ue-replication-specialist']]
];
for (const [name, engine, language, code, shader, ui, extra] of checks) {
  const r = fixture(name, `engine:\n  name: ${engine}\n  version: "1.0"\n  language: "${language}"\nspecialists:\n  code: ${code}\n  shader: ${shader}\n  ui: ${ui}\n  additional: [${extra.join(', ')}]\n`, 'engine:\n  name: Unapproved\n');
  const selected = selectEngineRoles(r); assert.equal(selected.status, 'SELECTED', JSON.stringify(selected)); assert.equal(selected.engine, engine);
  assert.equal(selected.version, '1.0'); assert.equal(selected.language, language); assert.ok(selected.observations.includes('not locally overridable'));
  assert.equal(selected.roles.length, 5, JSON.stringify(selected));
  for (const n of [code, shader, ui, ...extra]) assert.ok(selected.roles.includes(n));
}
assert.equal(selectEngineRoles(fixture('empty', null)).status, 'PENDING');
const orphan = fixture('orphan-local', null, 'engine:\n  name: Godot\n');
mkdirSync(join(orphan, '.agents/docs'), { recursive: true });
writeFileSync(join(orphan, '.agents/docs/technical-preferences.md'), '- **Engine**: Godot 4.7\n');
assert.match(selectEngineRoles(orphan).reason, /requires a project.yaml base/);
const legacy = fixture('legacy', '# base\n'); mkdirSync(join(legacy, '.agents/docs'), { recursive: true });
writeFileSync(join(legacy, '.agents/docs/technical-preferences.md'), '- **Engine**: Godot 4.7\n- **Language**: GDScript\n- **Language/Code Specialist**: godot-gdscript-specialist\n');
const selectedLegacy = selectEngineRoles(legacy); assert.equal(selectedLegacy.status, 'SELECTED', JSON.stringify(selectedLegacy)); assert.equal(selectedLegacy.version, '4.7'); assert.ok(selectedLegacy.roles.includes('godot-gdscript-specialist'));
assert.equal(selectEngineRoles(fixture('unknown', 'engine:\n  name: UnknownEngine\n')).status, 'PENDING');
const cross = selectEngineRoles(fixture('cross', 'engine:\n  name: Godot\nspecialists:\n  code: unity-specialist\n'));
assert.equal(cross.status, 'PENDING'); assert.match(cross.reason, /Invalid code specialist/); assert.deepEqual(cross.roles, []);
const wrongPurpose = selectEngineRoles(fixture('wrong-purpose', 'engine:\n  name: Unity\nspecialists:\n  shader: unity-ui-specialist\n'));
assert.equal(wrongPurpose.status, 'PENDING'); assert.match(wrongPurpose.reason, /Invalid shader specialist/);
const wrongLanguage = selectEngineRoles(fixture('wrong-language', 'engine:\n  name: Godot\n  language: C#\nspecialists:\n  code: godot-gdscript-specialist\n'));
assert.equal(wrongLanguage.status, 'PENDING'); assert.match(wrongLanguage.reason, /conflicts with configured language/);
const nulls = selectEngineRoles(fixture('nulls', 'engine:\n  name: Unity\nspecialists:\n  code: null\n  shader: null\n  ui: null\n  additional: []\n'));
assert.equal(nulls.status, 'SELECTED', JSON.stringify(nulls)); assert.deepEqual(nulls.roles, ['unity-specialist']);
const saved = process.env.CGS_BASH; process.env.CGS_BASH = join(dir, 'missing-bash');
assert.match(selectEngineRoles(dir).reason, /helper unavailable/i); if (saved === undefined) delete process.env.CGS_BASH; else process.env.CGS_BASH = saved;
console.log(`PASS: ${names.length} native engine roles; Godot, Unity and Unreal selectors, local lock, missing/invalid engine, cross-engine and wrong-purpose overrides, missing Bash. Fixtures: ${dir}`);
