import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {safeProjectPath} from './safe-path.mjs';
export function baseline(root,{allowPending=false}={}){
 const file=safeProjectPath(root,'docs/codex/active-baseline.json');
 if(!existsSync(file))throw Error('Missing active baseline descriptor: '+file);
 const x=JSON.parse(readFileSync(file,'utf8'));
 if(x.schema!==1||!/^[a-f0-9]{40}$/.test(x.historical_source_commit||'')||!/^[a-f0-9]{40}$/.test(x.source_commit)||!Array.isArray(x.reconciliation_evidence)||!['active','pending'].includes(x.state))throw Error('Invalid active baseline descriptor');
 if(!allowPending&&x.state!=='active')throw Error('Baseline reconciliation PENDING; review and finalize before CI');
 return x;
}
