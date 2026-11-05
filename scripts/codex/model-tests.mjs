import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { resolveModel } from './models.mjs';
const policy = JSON.parse(readFileSync('.codex/model-policy.json', 'utf8'));
const families = { opus: 'frontier', sonnet: 'engineering', haiku: 'bounded', inherit: 'inherit' };
function check(map, files) {
  assert.deepEqual(Object.keys(map).sort(), files.map(([name]) => name).sort());
  for (const [name, path] of files) {
    const source = readFileSync(path, 'utf8').split(/^---\s*$/m)[1].match(/^model:\s*(\S+)/m)[1];
    assert.deepEqual(map[name], { family: families[source], source_model: source });
  }
}
const roles = readdirSync('.claude/agents').filter(n => n.endsWith('.md')).map(n => [n.slice(0, -3), join('.claude/agents', n)]);
const skills = readdirSync('.claude/skills', { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join('.claude/skills', d.name, 'SKILL.md'))).map(d => [d.name, join('.claude/skills', d.name, 'SKILL.md')]);
assert.equal(roles.length, 49); assert.equal(skills.length, 74); check(policy.roles, roles); check(policy.skills, skills);
assert.equal(resolveModel({ role: 'creative-director', available: ['gpt-5.6-luna'], overrideSupported: true }).selected, 'gpt-5.6-luna');
assert.equal(resolveModel({ skill: 'help', available: ['gpt-5.6-luna'], overrideSupported: true }).selected, 'gpt-5.6-luna');
assert.equal(resolveModel({ role: 'accessibility-specialist', available: ['gpt-5.6-luna'], overrideSupported: true }).action, 'inherit');
assert.equal(resolveModel({ skill: 'help', available: ['gpt-5.6-luna'] }).action, 'inherit');
assert.throws(() => resolveModel({ role: 'unknown' }), /Unknown role/);
console.log('PASS: 49 role and 74 skill source mappings; named role/skill fallback; inherited source; unknown capability and unknown role.');
