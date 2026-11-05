import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const inv=JSON.parse(readFileSync('docs/codex/upstream-inventory.json','utf8'));
const roles=inv.files.filter(x=>x.category==='agent').map(x=>x.path.split('/').at(-1).replace(/\.md$/,'')).sort();
if(roles.length!==49||new Set(roles).size!==49)throw Error('Expected 49 unique roles');
const tasks=[
 ['validator',['scripts/codex/validate.mjs']],
 ['pinned inventory',['scripts/codex/inventory.mjs','--check']],
 ...['skills','references','support','rules'].map(f=>['generator '+f,['scripts/codex/generate.mjs','--family',f,'--check']]),
 ['generator all 49 roles',['scripts/codex/generate.mjs','--family','roles','--names',roles.join(','),'--check']],
 ...['config-tests','model-tests','rule-tests','engine-role-tests'].map(f=>[f,['scripts/codex/'+f+'.mjs']]),
 ['policy',['scripts/codex/tests/policy.mjs']],
 ['negative fixtures',['scripts/codex/tests/negative.mjs']],
 ['generator negative fixtures',['docs/codex/evidence/CGS-05/negative-tests.mjs']]
];
for(const [name,args] of tasks){console.log('\n> '+name);const r=spawnSync(process.execPath,args,{cwd:process.cwd(),stdio:'inherit'});if(r.error||r.status!==0){console.error('FAIL '+name+': '+(r.error||r.status));process.exit(1)}}
console.log('\nPASS quick CI. Engine integration: PENDING (not run by this command).');
