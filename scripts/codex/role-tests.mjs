import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const registry=JSON.parse(readFileSync('docs/codex/generation-manifest.json','utf8'));
const roles=readdirSync('.codex/agents').filter(n=>n.endsWith('.toml')).sort();
assert.ok(roles.length>0);
for(const file of roles){
  const target='.codex/agents/'+file, text=readFileSync(target,'utf8'), entry=registry.entries.find(x=>x.target===target);
  assert.ok(entry,'unregistered role: '+target);
  assert.equal(createHash('sha256').update(readFileSync(target)).digest('hex'),entry.target_sha256,target);
  assert.doesNotMatch(text,/^(model|maxTurns|tools|memory|skills|sandbox_mode|approval_policy)\s*=/m);
  const instructions=JSON.parse(text.match(/^developer_instructions = (".*")$/m)[1]);
  assert.ok(instructions.trim().length>0,target);
  const ceiling=instructions.match(/source capability ceiling is: ([^.]+)\./i);
  assert.ok(ceiling,target+': missing declared capability ceiling');
  const allowsShell=ceiling[1].split(',').map(x=>x.trim()).includes('Bash');
  assert.equal(/\[features\]\nshell_tool = false/m.test(text),!allowsShell,target+': shell feature disagrees with capability ceiling');
  for(const token of ['prior user authorization persists','not independent','responsibility limits','escalation'])assert(instructions.toLowerCase().includes(token),target+': '+token);
  assert.doesNotMatch(instructions,/AskUserQuestion|\.claude\//);
}
const check=spawnSync(process.execPath,['scripts/codex/native-helper-check.mjs','role'],{encoding:'utf8'});
assert.equal(check.status,0,check.stdout+check.stderr);
const invalid=spawnSync(process.execPath,['scripts/codex/native-helper-check.mjs','role','--agent','missing-role'],{encoding:'utf8'});
assert.notEqual(invalid.status,0);
console.log(`PASS ${roles.length} native role formats, registered hashes, safety contracts and unknown-role refusal; model behavior NOT ASSESSED`);
