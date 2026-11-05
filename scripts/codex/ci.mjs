import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const args=process.argv.slice(2);if(args.some(x=>x!=='--skip-reconcile')||args.filter(x=>x==='--skip-reconcile').length>1)throw Error('Usage: ci.mjs [--skip-reconcile]');
const inv=JSON.parse(readFileSync('docs/codex/upstream-inventory.json','utf8'));
const roles=inv.files.filter(x=>x.category==='agent').map(x=>x.path.split('/').at(-1).replace(/\.md$/,'')).sort();
if(roles.length!==inv.counts.agent||new Set(roles).size!==roles.length)throw Error('Role count or uniqueness mismatch');
const tasks=[
 ['validator',['scripts/codex/validate.mjs']],
 ['hygiene regression',['tests/hygiene.mjs']],
 ['engine CLI regression',['tests/engine-cli.mjs']],
 ['code-root configuration regression',['tests/code-root.mjs']],
 ['CLI filesystem alias regression',['scripts/codex/tests/cli-alias.mjs']],
 ['repository hygiene',['scripts/codex/hygiene.mjs']],
 ['Git source fixture',['scripts/codex/tests/source-fixture.mjs']],
 ['source transform fixture',['scripts/codex/tests/importer-fixture.mjs']],
 ...['skills','references','support','rules'].map(f=>['generator '+f,['scripts/codex/generate.mjs','--family',f,'--check','--complete']]),
 ['generator all roles',['scripts/codex/generate.mjs','--family','roles','--names',roles.join(','),'--check','--complete']],
 ...['config-tests','model-tests','rule-tests','engine-role-tests'].map(f=>[f,['scripts/codex/'+f+'.mjs']]),
 ['policy',['scripts/codex/tests/policy.mjs']],
 ['negative fixtures',['scripts/codex/tests/negative.mjs']],
 ['generator negative fixtures',['tests/generator-negative.mjs']],
 ['native authoring registration',['tests/native-registration.mjs']],
 ['external engine Skills safety',['tests/engine-skills.mjs']],
 ['upstream synchronization fixture',['scripts/codex/upstream-tests.mjs']],
 ...(args.includes('--skip-reconcile')?[]:[['reviewed reconciliation fixture',['scripts/codex/tests/reconcile-fixture.mjs']]])
];
for(const [name,args] of tasks){console.log('\n> '+name);const r=spawnSync(process.execPath,args,{cwd:process.cwd(),stdio:'inherit'});if(r.error||r.status!==0){console.error('FAIL '+name+': '+(r.error||r.status));process.exit(1)}}
console.log('\nPASS quick CI'+(args.includes('--skip-reconcile')?' (reconciliation fixture explicitly skipped)':'')+'. Engine integration: PENDING (not run by this command).');
