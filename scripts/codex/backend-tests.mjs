import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
if(!process.argv.includes('--disposable-checkout'))throw Error('Run only in a disposable checkout: pass --disposable-checkout');
const names=['hook-tests','helper-tests','helper-root-tests','helper-extra-tests','role-tests','specialist-tests'],results=[];
for(const name of names){console.log('> '+name);const r=spawnSync(process.execPath,['scripts/codex/'+name+'.mjs'],{encoding:'utf8',maxBuffer:10*1024*1024});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');results.push({name,exit:r.status,error:r.error?.message||null,stdout:r.stdout,stderr:r.stderr})}
if(results.some(x=>x.exit!==0||x.error))process.exit(1);
console.log('PASS backend fixture checks; native hook activation and engines remain PENDING.');
