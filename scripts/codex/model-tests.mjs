import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolveModel } from './models.mjs';
const policy=JSON.parse(readFileSync('.codex/model-policy.json','utf8'));
const roles=readdirSync('.codex/agents').filter(n=>n.endsWith('.toml')).map(n=>n.slice(0,-5)).sort();
const skills=readdirSync('.agents/skills',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort();
assert.deepEqual(Object.keys(policy.roles).sort(),roles);
assert.deepEqual(Object.keys(policy.skills).sort(),skills);
const families={opus:'frontier',sonnet:'engineering',haiku:'bounded',inherit:'inherit'};
for(const map of [policy.roles,policy.skills]) for(const [name,entry] of Object.entries(map)) {
  assert.equal(entry.family,families[entry.source_model],name);
  assert.ok(entry.family==='inherit'||policy.families[entry.family],name);
}
assert.equal(resolveModel({role:'creative-director',available:['gpt-5.6-luna'],overrideSupported:true}).selected,'gpt-5.6-luna');
assert.equal(resolveModel({skill:'help',available:['gpt-5.6-luna'],overrideSupported:true}).selected,'gpt-5.6-luna');
assert.equal(resolveModel({role:'accessibility-specialist',available:['gpt-5.6-luna'],overrideSupported:true}).action,'inherit');
assert.equal(resolveModel({skill:'help',available:['gpt-5.6-luna']}).action,'inherit');
assert.throws(()=>resolveModel({role:'unknown'}),/Unknown role/);
assert.throws(()=>resolveModel({family:'unknown'}),/Unknown model family/);
console.log(`PASS native model policy coverage: ${roles.length} roles, ${skills.length} skills; selection and fallback contracts`);
