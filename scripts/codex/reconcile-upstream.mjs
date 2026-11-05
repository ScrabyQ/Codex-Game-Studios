import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync,realpathSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {baseline} from './baseline.mjs';
import {inspect,git} from './upstream-common.mjs';
import {safeProjectPath,safeExternalFile,readManualTarget} from './safe-path.mjs';

const args=process.argv.slice(2), action=args.shift(), opts={};
if(!['prepare','apply','finalize'].includes(action))throw Error('Usage: reconcile-upstream.mjs prepare|apply|finalize --root DIR [--plan FILE --source-repo DIR --source-ref REF]');
while(args.length){const key=args.shift();if(!['--root','--plan','--source-repo','--source-ref'].includes(key)||opts[key]||!args[0]||args[0].startsWith('--'))throw Error('Unknown, duplicate or incomplete argument: '+key);opts[key]=args.shift()}
if(!opts['--root']||(action==='prepare'&&(!opts['--plan']||!opts['--source-repo']||!opts['--source-ref']))||(action!=='prepare'&&Object.keys(opts).some(k=>k!=='--root')))throw Error('Invalid reconciliation options');
const root=path.resolve(opts['--root']),hash=b=>createHash('sha256').update(b).digest('hex'),encode=x=>JSON.stringify(x,null,2)+'\n';
const paths={inventory:'docs/codex/upstream-inventory.json',migration:'docs/codex/migration-manifest.json',registry:'docs/codex/generation-manifest.json',baseline:'docs/codex/active-baseline.json'};
const read=p=>readFileSync(safeProjectPath(root,p)),json=p=>JSON.parse(read(p)),write=(p,b)=>writeFileSync(safeProjectPath(root,p),b);
const active=baseline(root,{allowPending:true});
const activePlan=()=>{if(active.state!=='pending'||!active.plan||!active.plan_sha256)throw Error('No pending reviewed reconciliation');const bytes=read(active.plan);if(hash(bytes)!==active.plan_sha256)throw Error('Reviewed plan changed');return JSON.parse(bytes)};
const uniq=(a,label)=>{if(new Set(a).size!==a.length)throw Error('Duplicate '+label)};
const mapped=(reg,source)=>reg.entries.filter(e=>(e.sources||[e.source]).includes(source));
if(action==='prepare'){
 if(active.state!=='active')throw Error('Another reconciliation is PENDING');
 const bytes=readFileSync(safeExternalFile(opts['--plan'])),plan=JSON.parse(bytes);
 if(plan.schema!==2||plan.reviewed!==true||plan.old_sha!==active.source_commit||!/^[a-f0-9]{40}$/.test(plan.new_sha||'')||!Array.isArray(plan.changes))throw Error('Invalid reviewed plan');
 const report=inspect({root,'source-repo':opts['--source-repo'],'source-ref':opts['--source-ref'],remote:'upstream',ref:'main'});
 if(report.working_tree||report.target_drift.length)throw Error('Dirty product or target drift; no preparation performed');
 if(report.upstream_sha!==plan.new_sha)throw Error('Plan source commit mismatch');
 const key=c=>`${c.old_path||''}\0${c.new_path||''}`;
 uniq(plan.changes.map(key),'plan changes');
 if(JSON.stringify(plan.changes.map(key).sort())!==JSON.stringify(report.changes.map(key).sort()))throw Error('Plan must account for every source change');
 const reg=json(paths.registry),targets=new Map();
 for(const c of plan.changes){
  const actual=report.changes.find(x=>key(x)===key(c));
  if(!['adapt','retain','retire'].includes(c.decision)||!Array.isArray(c.targets))throw Error('Unreviewed change: '+key(c));
  if((c.decision==='retire'&&c.new_path)||(c.decision==='adapt'&&!c.new_path))throw Error('Decision does not match source change: '+key(c));
  for(const field of ['old_blob','new_blob','old_sha256','new_sha256','old_mode','new_mode'])if(c[field]!==actual[field])throw Error('Source change guard mismatch: '+key(c));
  if(actual.diagnostics.length)throw Error('Source diagnostics require manual resolution: '+actual.diagnostics.join('; '));
  if(JSON.stringify(c.declarations||[])!==JSON.stringify(actual.declarations))throw Error('Plan must account for changed hook declarations: '+key(c));
  if(!Array.isArray(c.overlays)||actual.overlays.some(o=>!c.overlays.some(x=>x.path===o.path&&x.old_sha256===o.old_sha256)))throw Error('Missing overlay binding: '+key(c));
  for(const o of c.overlays){const p=safeProjectPath(root,o.path);if(!/^docs\/codex\/overlays\/(?:helpers\/)?[a-zA-Z0-9._-]+\.json$/.test(o.path))throw Error('Invalid overlay path');const actualHash=existsSync(p)?hash(readFileSync(p)):null;if(actualHash!==o.old_sha256||!/^([a-f0-9]{64})$/.test(o.new_sha256||''))throw Error('Overlay old hash or reviewed new hash mismatch: '+o.path)}
  const expected=actual.targets.map(t=>t.target).sort();
  for(const target of expected)if(!c.targets.some(t=>t.target===target))throw Error('Missing affected target: '+target);
  for(const t of c.targets){
   if(!['retain','update','retire','add'].includes(t.action)||!/^([a-f0-9]{64})$/.test(t.new_sha256||'')&&t.action!=='retire')throw Error('Invalid target action: '+t.target);
   const existing=reg.entries.find(e=>e.target===t.target),reported=actual.targets.find(x=>x.target===t.target),manual=t.ownership==='manual';
   if(manual){if(existing||reported?.ownership!=='manual'||t.action==='add'||t.old_sha256!==reported.recorded_sha256||hash(readManualTarget(root,t.target))!==t.old_sha256)throw Error('Manual target old hash mismatch: '+t.target)}
   else{const p=safeProjectPath(root,t.target,{roots:['.agents/','.codex/']});if(t.action==='add'){if(existing||existsSync(p)||t.old_sha256!==null||!t.registration||!(t.registration.source||t.registration.sources?.length))throw Error('Invalid new target: '+t.target)}else if(!existing||t.old_sha256!==existing.target_sha256||hash(readFileSync(p))!==t.old_sha256)throw Error('Target old hash mismatch: '+t.target)}
   if(t.action==='retire'&&t.new_sha256!==null)throw Error('Retired target must have null new hash');
   if((c.decision==='retain'||t.action==='retain')&&t.new_sha256!==t.old_sha256)throw Error('Retained target content cannot change: '+t.target);
   const prior=targets.get(t.target);if(prior&&JSON.stringify(prior)!==JSON.stringify(t))throw Error('Conflicting shared target plan: '+t.target);targets.set(t.target,t);
  }
 }
 const temp=mkdtempSync(path.join(realpathSync(tmpdir()),'cgs-source-inventory-'));
 execFileSync(process.execPath,[path.join(root,'scripts/codex/inventory.mjs'),'--candidate',plan.new_sha,'--source-repo',report.source_repository,'--source-ref',opts['--source-ref'],'--output-dir',temp],{cwd:root,stdio:'pipe'});
 const archive='.scratch/reconciliation/'+plan.old_sha+'-'+plan.new_sha;
 if(existsSync(safeProjectPath(root,archive)))throw Error('Reconciliation archive already exists');
 git(root,'check-ignore','-q','.scratch/reconciliation/');mkdirSync(safeProjectPath(root,archive),{recursive:true});
 for(const [name,p] of Object.entries(paths))write(archive+'/'+name+'.json',read(p));
 const inventoryBytes=readFileSync(path.join(temp,'upstream-inventory.json')),candidateBytes=readFileSync(path.join(temp,'migration-manifest.json'));
 write(archive+'/plan.json',bytes);write(archive+'/inventory.json',inventoryBytes);write(archive+'/migration-candidate.json',candidateBytes);
 write(paths.baseline,encode({...active,state:'pending',plan:archive+'/plan.json',plan_sha256:hash(bytes),candidate_inventory_sha256:hash(inventoryBytes),candidate_migration_sha256:hash(candidateBytes),reconciliation_phase:'prepared'}));
 console.log('PENDING: reviewed plan prepared; source files were not merged.');
}else if(action==='apply'){
 const plan=activePlan();if(active.reconciliation_phase!=='prepared')throw Error('Reconciliation is not prepared');
 const archive=path.posix.dirname(active.plan),inventoryBytes=read(archive+'/inventory.json'),candidateBytes=read(archive+'/migration-candidate.json');
 if(hash(inventoryBytes)!==active.candidate_inventory_sha256||hash(candidateBytes)!==active.candidate_migration_sha256)throw Error('Archived candidate metadata changed');
 const inv=JSON.parse(inventoryBytes),candidate=JSON.parse(candidateBytes),old=json(paths.migration),reg=json(paths.registry);
 for(const c of plan.changes)for(const o of c.overlays){const bytes=read(o.path);if(hash(bytes)!==o.new_sha256)throw Error('Reviewed overlay hash mismatch: '+o.path);const overlay=JSON.parse(bytes),skill=/^\.claude\/skills\/([^/]+)\//.exec(c.new_path||''),pinSource=skill?`.claude/skills/${skill[1]}/SKILL.md`:c.new_path;const pin=inv.files.find(f=>f.path===pinSource)?.sha256;if(pin&&overlay.source_sha256!==pin)throw Error('Overlay source pin mismatch: '+o.path)}
 const targetActions=new Map(plan.changes.flatMap(c=>c.targets).map(t=>[t.target,t]));
 for(const [target,t] of targetActions){const p=t.ownership==='manual'?safeProjectPath(root,target):safeProjectPath(root,target,{roots:['.agents/','.codex/']});const actual=existsSync(p)?hash(t.ownership==='manual'?readManualTarget(root,target):readFileSync(p)):null;if(actual!==t.new_sha256)throw Error('Reviewed target hash mismatch: '+target)}
 const inventory=new Map(inv.files.map(f=>[f.path,f]));
 const rename=new Map(plan.changes.filter(c=>c.old_path&&c.new_path&&c.old_path!==c.new_path).map(c=>[c.old_path,c.new_path]));
 const digest=inputs=>inputs.length===1?inventory.get(inputs[0]).sha256:hash(Buffer.from(JSON.stringify(inputs.map(p=>[p,inventory.get(p).sha256]))));
 for(const [target,t] of targetActions){
  if(t.ownership==='manual')continue;
  const index=reg.entries.findIndex(e=>e.target===target),existing=reg.entries[index];
  if(t.action==='retire'){if(index<0)throw Error('Unknown retired target: '+target);reg.entries.splice(index,1);continue}
  const entry=existing||{id:'native:'+target,target,ownership:'generated',transform_version:1,transform_ids:t.registration?.transform_ids||['reviewed-native-import'],owner:'reviewed'};
  const oldInputs=entry.sources||[entry.source].filter(Boolean),inputs=t.registration?.sources||t.registration?.source&&[t.registration.source]||oldInputs.map(p=>rename.get(p)||p).filter(p=>inventory.has(p));
  if(inputs.some(p=>!inventory.has(p)))throw Error('Target references unknown source: '+target);
  if(!inputs.length){entry.ownership='native';entry.retired_provenance={source:entry.source,sources:entry.sources,source_sha256:entry.source_sha256,commit:plan.old_sha};delete entry.source;delete entry.sources;delete entry.source_sha256}
  else{entry.ownership='generated';entry.source=inputs[0];if(inputs.length>1)entry.sources=inputs;else delete entry.sources;entry.source_sha256=digest(inputs)}
  entry.target_sha256=t.new_sha256;if(index<0)reg.entries.push(entry);
 }
 reg.entries.sort((a,b)=>a.target.localeCompare(b.target));reg.source_commit=plan.new_sha;
 const oldRows=new Map(old.entries.map(e=>[e.id,e])),changed=new Set(plan.changes.map(c=>c.new_path).filter(Boolean));
 const hookChange=plan.changes.some(c=>c.old_path==='.claude/settings.json'||c.new_path==='.claude/settings.json');
 candidate.entries=candidate.entries.map(e=>{const change=plan.changes.find(c=>c.new_path===e.source),previous=oldRows.get(e.id)||(change?.old_path?oldRows.get('file:'+change.old_path):null),affected=changed.has(e.source)||(hookChange&&e.category==='hook-declaration');const merged=previous?{...previous,...e,status:affected?'PENDING':previous.status,verification:affected?'Explicit review and checks required.':previous.verification}:{...e,status:'PENDING'};const matches=[...mapped(reg,e.source).map(t=>({target:t.target,sha256:t.target_sha256})),...(change?.targets||[]).filter(t=>t.ownership==='manual'&&t.action!=='retire').map(t=>({target:t.target,sha256:t.new_sha256}))];if(matches.length){merged.target=matches[0].target;merged.target_sha256=matches[0].sha256;merged.related_targets=matches.slice(1)}else if(affected||!previous){delete merged.target;delete merged.target_sha256;delete merged.related_targets}return merged});
 candidate.retired_manual_mappings=[...(old.retired_manual_mappings||[]),...plan.changes.filter(c=>!c.new_path).flatMap(c=>c.targets.filter(t=>t.ownership==='manual'&&t.action!=='retire').map(t=>({source:c.old_path,source_sha256:c.old_sha256,target:t.target,target_sha256:t.new_sha256,source_commit:plan.old_sha,decision:'retained'})))];
 const next={...active,source_commit:plan.new_sha,reconciliation_phase:'applied'};
 const outputs=[[paths.inventory,inv],[paths.migration,candidate],[paths.registry,reg],[paths.baseline,next]],before=outputs.map(([p])=>read(p));
 try{for(const [p,v] of outputs)write(p,encode(v));execFileSync(process.execPath,[path.join(root,'scripts/codex/validate.mjs'),'--root',root,'--verify-pending'],{cwd:root,stdio:'pipe'})}catch(e){outputs.forEach(([p],i)=>write(p,before[i]));throw Error('Reconciliation apply failed validation; metadata restored: '+(e.stderr||e.message))}
 console.log('PENDING: reviewed target hashes applied; explicit status review and checks remain.');
}else{
 const plan=activePlan();if(active.reconciliation_phase!=='applied')throw Error('Apply reviewed target changes first');
 const migration=json(paths.migration),changed=new Set(plan.changes.map(c=>c.new_path).filter(Boolean));
 for(const e of migration.entries)if((changed.has(e.source)||(e.category==='hook-declaration'&&changed.has('.claude/settings.json')))&&e.status==='PENDING')throw Error('Explicit review still pending: '+e.id);
 execFileSync(process.execPath,[path.join(root,'scripts/codex/validate.mjs'),'--root',root,'--verify-pending'],{cwd:root,stdio:'pipe'});
 const next={...active,state:'active'};delete next.plan;delete next.plan_sha256;delete next.candidate_inventory_sha256;delete next.candidate_migration_sha256;delete next.reconciliation_phase;write(paths.baseline,encode(next));
 console.log('Reconciliation finalized after recorded review and native structural validation. Behavioral checks remain separate.');
}
