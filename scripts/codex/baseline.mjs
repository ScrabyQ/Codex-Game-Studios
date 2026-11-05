import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const HISTORICAL=JSON.parse(readFileSync(fileURLToPath(new URL('../../docs/codex/active-baseline.json',import.meta.url)),'utf8')).historical_source_commit;
export function baseline(root,{allowPending=false}={}){
 const file=path.join(root,'docs/codex/active-baseline.json');
 // Historical fixtures predating the descriptor retain their pinned baseline.
 const x=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{schema:1,historical_source_commit:HISTORICAL,source_commit:HISTORICAL,reconciliation_evidence:[],state:'active'};
 if(x.schema!==1||x.historical_source_commit!==HISTORICAL||!/^[a-f0-9]{40}$/.test(x.source_commit)||!Array.isArray(x.reconciliation_evidence)||!['active','pending'].includes(x.state))throw Error('Invalid active baseline descriptor');
 if(!allowPending&&x.state!=='active')throw Error('Baseline reconciliation PENDING; review and finalize before CI');
 return x;
}
