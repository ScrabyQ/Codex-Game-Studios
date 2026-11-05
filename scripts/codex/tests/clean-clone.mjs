import {mkdtempSync,mkdirSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(), parent=mkdtempSync(path.join(tmpdir(),'cgs-clean-clone-')), clone=path.join(parent,'repo');
function run(cmd,args,cwd){const r=spawnSync(cmd,args,{cwd,stdio:'inherit'});if(r.error||r.status!==0)throw Error(cmd+' failed: '+(r.error||r.status))}
run('git',['clone','--quiet','--no-hardlinks',root,clone],root);
// During development only, copy the proposed CI scripts into the clean clone.
// Once committed these are identical to checkout; no source or generated files are copied.
for(const p of ['scripts/codex/validate.mjs','scripts/codex/ci.mjs','scripts/codex/tests/policy.mjs','scripts/codex/tests/negative.mjs']){mkdirSync(path.dirname(path.join(clone,p)),{recursive:true});copyFileSync(path.join(root,p),path.join(clone,p))}
run(process.execPath,['scripts/codex/ci.mjs'],clone);
console.log('PASS clean clone with proposed CI scripts overlaid; fixture retained: '+clone);
