// Copies only engine-supplied template inputs from a local installation; never downloads them.
import fs from 'node:fs';
import path from 'node:path';
import {fixtures,evidence,put,sha} from './io.mjs';
const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--engine-root'&&args[1]&&!args[1].startsWith('--')))throw Error('Usage: node docs/codex/evidence/CGS-27/prepare-unreal-template.mjs [--engine-root PATH]');
const engineRoot=args[1]||process.env.CGS_UNREAL_ROOT||'C:/Program Files/Epic Games/UE_5.8',source=path.resolve(engineRoot,'Templates/TP_Blank'),target=path.join(fixtures,'unreal');
if(!fs.existsSync(path.join(source,'TP_Blank.uproject')))throw Error('Installed TP_Blank template not found; no project fabricated');
const files=[];function visit(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ent.name==='Media')continue;const src=path.join(dir,ent.name),relative=path.relative(source,src),dst=path.join(target,relative);if(ent.isDirectory())visit(src);else{if(fs.existsSync(dst)){if(sha(dst)!==sha(src))throw Error('Existing template file differs; preserve and reconcile: '+dst);}else put(dst,fs.readFileSync(src,'utf8'));files.push({source:src,target:dst,sha256:sha(src)});}}}visit(source);
put(path.join(evidence,'unreal-template-preparation.json'),{source,target,files,mode:'Installed third-party template copied locally only; excluded from adaptation Git packaging. Existing differing files never overwritten.'});console.log(JSON.stringify({copied_or_verified:files.length,source}));
