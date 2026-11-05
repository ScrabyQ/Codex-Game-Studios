import {mkdtempSync,mkdirSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(), parent=mkdtempSync(path.join(tmpdir(),'cgs-clean-clone-')), clone=path.join(parent,'repo');
function run(cmd,args,cwd){const r=spawnSync(cmd,args,{cwd,stdio:'inherit'});if(r.error||r.status!==0)throw Error(cmd+' failed: '+(r.error||r.status))}
run('git',['clone','--quiet','--no-hardlinks',root,clone],root);
for(const p of ['scripts/codex/upstream-tests.mjs','scripts/codex/upstream-common.mjs','scripts/codex/check-upstream.mjs','scripts/codex/sync-upstream.mjs','scripts/codex/main-entry.mjs','scripts/codex/tests/cli-alias.mjs']){mkdirSync(path.dirname(path.join(clone,p)),{recursive:true});copyFileSync(path.join(root,p),path.join(clone,p))}
// During development only, copy the proposed CI scripts into the clean clone.
// Once committed these are identical to checkout; no source or generated files are copied.
for(const p of ['scripts/codex/validate.mjs','scripts/codex/ci.mjs','scripts/codex/baseline.mjs','scripts/codex/reconcile-upstream.mjs','scripts/codex/inventory.mjs','scripts/codex/generate.mjs','scripts/codex/record-migration.mjs','scripts/codex/tests/reconcile-fixture.mjs','tests/generator-negative.mjs','tests/engine-cli.mjs','scripts/codex/engine-e2e.mjs','tests/hygiene.mjs','scripts/codex/hygiene.mjs','scripts/codex/shell.mjs','scripts/codex/support-generation.mjs','docs/codex/transform-source-pins.json','docs/codex/active-baseline.json','scripts/codex/tests/policy.mjs','scripts/codex/tests/negative.mjs']){mkdirSync(path.dirname(path.join(clone,p)),{recursive:true});copyFileSync(path.join(root,p),path.join(clone,p))}
run(process.execPath,['scripts/codex/ci.mjs'],clone);
console.log('PASS clean clone with proposed CI scripts overlaid; fixture retained: '+clone);
