import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const names=readdirSync('.codex/agents').filter(n=>n.endsWith('.toml')&&!/^(godot-|unity-|unreal-|ue-)/.test(n));
assert.ok(names.length>0);
for(const file of names){
  const text=readFileSync('.codex/agents/'+file,'utf8');
  const instruction=JSON.parse(text.match(/^developer_instructions = (".*")$/m)[1]);
  assert.ok(instruction.includes('in-session role review; not independent'));
  assert.ok(instruction.includes('Prior user authorization persists'));
  assert.doesNotMatch(text,/^model\s*=/m);
  assert.doesNotMatch(instruction,/CLAUDE_PROJECT_DIR|CLAUDE_SKILL_DIR|AskUserQuestion/);
}
const fixture = 'tests/fixtures/specialist/';
const files = ['package.json', 'gameplay.js', 'design.md', 'gameplay.test.js'];
const digest = f => createHash('sha256').update(readFileSync(fixture + f)).digest('hex');
const before = files.map(digest);
const zero = spawnSync(process.execPath, [fixture + 'gameplay.test.js'], { encoding: 'utf8' });
assert.equal(zero.status, 0, zero.stderr);
const probe = spawnSync(process.execPath, ['--input-type=module', '-e', `import {applyDamage} from './${fixture}gameplay.js'; console.log(JSON.stringify([applyDamage(100,10),applyDamage(5,10),applyDamage(80,-10)]))`], { encoding: 'utf8' });
assert.equal(probe.status, 0, probe.stderr); assert.deepEqual(JSON.parse(probe.stdout), [80, -15, 100]);
assert.deepEqual(files.map(digest), before, 'fixture changed during checks');
console.log(`PASS: ${names.length} native non-engine roles' instruction contracts and unchanged gameplay fixture; model behavior NOT ASSESSED.`);
