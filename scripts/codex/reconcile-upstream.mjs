import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {baseline} from './baseline.mjs';
const args=process.argv.slice(2),action=args[0],options=new Map();
if(!['prepare','finalize'].includes(action))throw Error('Usage: reconcile-upstream.mjs prepare|finalize --root DIR [--plan PROJECT-RELATIVE-JSON]');
for(let i=1;i<args.length;i++){const key=args[i];if(!['--root','--plan'].includes(key)||options.has(key)||!args[i+1]||args[i+1].startsWith('--'))throw Error('Unknown, duplicate or incomplete argument: '+key);options.set(key,args[++i])}
if(!options.has('--root')||(action==='prepare'&&!options.has('--plan'))||(action==='finalize'&&options.has('--plan')))throw Error('prepare requires --root and --plan; finalize requires --root only');
const value=k=>options.get(k);
const root=path.resolve(value('--root')),read=p=>readFileSync(path.join(root,p)),json=p=>JSON.parse(read(p)),hash=b=>createHash('sha256').update(b).digest('hex'),write=(p,b)=>writeFileSync(path.join(root,p),b),encode=x=>JSON.stringify(x,null,2)+'\n';
const safe=p=>{if(typeof p!=='string'||!p||path.isAbsolute(p)||p.includes('\\')||p.split('/').includes('..'))throw Error('Unsafe project-relative path: '+p);return p};
const source=p=>hash(Buffer.from(read(p).toString('utf8').replace(/\r\n/g,'\n')));
const invPath='docs/codex/upstream-inventory.json',migPath='docs/codex/migration-manifest.json',regPath='docs/codex/generation-manifest.json',basePath='docs/codex/active-baseline.json';
const active=baseline(root,{allowPending:true}),inv=json(invPath),mig=json(migPath),reg=json(regPath);
if([inv,mig,reg].some(x=>x.source_commit!==active.source_commit))throw Error('Active manifests disagree with baseline');
if(action==='prepare'){
 if(active.state!=='active')throw Error('Another reconciliation is PENDING');
 const planPath=safe(value('--plan')),planBytes=read(planPath),plan=JSON.parse(planBytes);
 if(plan.schema!==1||plan.reviewed!==true||plan.old_sha!==active.source_commit||!/^[a-f0-9]{40}$/.test(plan.new_sha||'')||!Array.isArray(plan.changes)||!Array.isArray(plan.hooks))throw Error('Invalid reviewed reconciliation plan');
 if(plan.old_sha===plan.new_sha){if(plan.changes.length||plan.hooks.length)throw Error('No-op plan must have no changes');console.log('PASS no-op: source baseline unchanged');process.exit(0)}
 execFileSync('git',['merge-base','--is-ancestor',plan.old_sha,plan.new_sha],{cwd:root});
 const dir=mkdtempSync(path.join(tmpdir(),'cgs-reconcile-inventory-'));
 execFileSync(process.execPath,[path.join(root,'scripts/codex/inventory.mjs'),'--candidate',plan.new_sha,'--output-dir',dir],{cwd:root,stdio:'pipe'});
 const candidate=JSON.parse(readFileSync(path.join(dir,'upstream-inventory.json'))),candidateMig=JSON.parse(readFileSync(path.join(dir,'migration-manifest.json')));
 const old=new Map(inv.files.map(x=>[x.path,x])),next=new Map(candidate.files.map(x=>[x.path,x]));
 const changed=[...new Set([...old.keys(),...next.keys()])].filter(p=>old.get(p)?.sha256!==next.get(p)?.sha256||old.get(p)?.mode!==next.get(p)?.mode).sort();
 if(changed.some(p=>!old.has(p)||!next.has(p)))throw Error('Added or deleted sources require explicit human onboarding/retirement; no files were removed');
 const ancestor=spawnSync('git',['merge-base','--is-ancestor',plan.new_sha,'HEAD'],{cwd:root}),mergeHead=spawnSync('git',['rev-parse','--verify','MERGE_HEAD'],{cwd:root,encoding:'utf8'});
 if(ancestor.status!==0&&(mergeHead.status!==0||mergeHead.stdout.trim()!==plan.new_sha))throw Error('Reviewed source commit is not integrated into HEAD or the active no-commit merge');
 if(new Set(plan.changes.map(x=>x.source)).size!==plan.changes.length||JSON.stringify(plan.changes.map(x=>x.source).sort())!==JSON.stringify(changed))throw Error('Plan does not account for exactly all changed sources');
 for(const c of plan.changes){
  safe(c.source);if(c.decision!=='REBASE'||c.old_sha256!==old.get(c.source).sha256||c.new_sha256!==next.get(c.source).sha256||c.old_mode!==old.get(c.source).mode||c.new_mode!==next.get(c.source).mode||source(c.source)!==c.new_sha256)throw Error('Stale, unreviewed, or unmerged source: '+c.source);
  if(!Array.isArray(c.evidence)||!c.evidence.length||c.evidence.some(p=>!existsSync(path.join(root,safe(p)))))throw Error('Missing review evidence: '+c.source);
  const affected=reg.entries.filter(e=>(e.sources||[e.source]).includes(c.source)).map(e=>({target:e.target,old_sha256:e.target_sha256})).sort((a,b)=>a.target.localeCompare(b.target));
  if(!Array.isArray(c.targets)||JSON.stringify([...c.targets].sort((a,b)=>a.target.localeCompare(b.target)))!==JSON.stringify(affected))throw Error('Target review coverage mismatch: '+c.source);
  const skill=/^\.claude\/skills\/([^/]+)\//.exec(c.source),helper=/^\.claude\/(?:scripts|hooks)\/([^/]+)$/.exec(c.source),overlay=skill?'docs/codex/overlays/'+skill[1]+'.json':helper?'docs/codex/overlays/helpers/'+helper[1]+'.json':null;
  if(overlay&&existsSync(path.join(root,overlay))){if(c.overlay?.path!==overlay||!/^[a-f0-9]{64}$/.test(c.overlay.sha256||''))throw Error('Reviewed rebased overlay hash required: '+c.source)}else if(c.overlay)throw Error('Unknown overlay requires explicit onboarding: '+c.source);
 }
 for(const e of reg.entries)if(hash(read(safe(e.target)))!==e.target_sha256)throw Error('Manual target drift: '+e.target);
 const oldHooks=new Map(inv.hooks.map(h=>[h.id,h])),newHooks=new Map(candidate.hooks.map(h=>[h.id,h])),hookIds=[...new Set([...oldHooks.keys(),...newHooks.keys()])].filter(id=>JSON.stringify(oldHooks.get(id))!==JSON.stringify(newHooks.get(id))||changed.some(p=>p.startsWith('.claude/hooks/')&&(oldHooks.get(id)?.command||'').includes(p))).sort();
 if(hookIds.some(id=>!oldHooks.has(id)||!newHooks.has(id)))throw Error('Added/deleted hook declarations require human onboarding/retirement');
 if(new Set(plan.hooks.map(x=>x.id)).size!==plan.hooks.length||JSON.stringify(plan.hooks.map(x=>x.id).sort())!==JSON.stringify(hookIds))throw Error('Plan does not account for affected hook declarations');
 for(const h of plan.hooks)if(h.decision!=='REVIEW'||!Array.isArray(h.evidence)||!h.evidence.length||h.evidence.some(p=>!existsSync(path.join(root,safe(p)))))throw Error('Missing hook review evidence: '+h.id);
 const archive='docs/codex/reconciliation/'+plan.old_sha+'-'+plan.new_sha;mkdirSync(path.join(root,'docs/codex/reconciliation'),{recursive:true});mkdirSync(path.join(root,archive),{recursive:false});
 for(const p of [invPath,migPath,regPath,basePath])write(archive+'/'+path.basename(p),read(p));
 write(archive+'/plan.json',planBytes);
 const oldRows=new Map(mig.entries.map(e=>[e.id,e]));
 candidateMig.entries=candidateMig.entries.map(e=>{const previous=oldRows.get(e.id);if(!previous)throw Error('Unaccounted migration entry '+e.id);if(changed.includes(e.source)||hookIds.includes(e.id))return {...previous,...e,status:'PENDING',verification:'Changed upstream source requires fresh review and test evidence.',evidence:[]};return {...previous,source_sha256:e.source_sha256}});
 reg.source_commit=plan.new_sha;
 write(invPath,encode(candidate));write(migPath,encode(candidateMig));write(regPath,encode(reg));
 write(basePath,encode({...active,source_commit:plan.new_sha,state:'pending',plan:archive+'/plan.json',plan_sha256:hash(planBytes),reconciliation_evidence:[archive+'/plan.json']}));
 console.log('PENDING reconciliation prepared; old inventory, matrix, registry and descriptor archived at '+archive);
}else{
 if(active.state!=='pending')throw Error('No pending reconciliation');
 const bytes=read(safe(active.plan));if(hash(bytes)!==active.plan_sha256)throw Error('Reconciliation plan changed');const plan=JSON.parse(bytes);
 const archive=path.posix.dirname(active.plan),previous=json(archive+'/migration-manifest.json'),oldRows=new Map(previous.entries.map(e=>[e.id,e]));
 const ids=[...plan.changes.map(c=>'file:'+c.source),...plan.hooks.map(h=>h.id)];
 for(const id of ids){const e=mig.entries.find(x=>x.id===id),before=oldRows.get(id);if(!e||!['PORTED','EQUIVALENT','UNSUPPORTED'].includes(e.status)||!Array.isArray(e.evidence)||!e.evidence.some(p=>!(before?.evidence||[]).includes(p)&&existsSync(path.join(root,safe(p)))))throw Error('Fresh valid non-pending review/test evidence required: '+id)}
 for(const id of ids){const e=mig.entries.find(x=>x.id===id),mapped=[...(e.target?[{target:e.target,sha256:e.target_sha256}]:[]),...(e.related_targets||[])];for(const t of mapped){if(!t.target||!t.sha256||hash(read(safe(t.target)))!==t.sha256)throw Error('Stale migration target mapping: '+id);const r=reg.entries.find(x=>x.target===t.target);if(r&&r.target_sha256!==t.sha256)throw Error('Migration/registry target mismatch: '+id)}const c=plan.changes.find(x=>'file:'+x.source===id);if(c&&c.targets.some(t=>!mapped.some(m=>m.target===t.target)))throw Error('Missing migration target mapping: '+id)}
 for(const c of plan.changes){if(source(c.source)!==c.new_sha256)throw Error('Changed source drift before finalization: '+c.source);if(c.overlay&&hash(read(safe(c.overlay.path)))!==c.overlay.sha256)throw Error('Reviewed overlay drift: '+c.source)}
 for(const c of plan.changes)for(const t of c.targets){const e=reg.entries.find(x=>x.target===t.target),inputs=e?.sources||[e?.source];if(!e||hash(read(safe(e.target)))!==e.target_sha256)throw Error('Unregistered or drifted target: '+t.target);const wanted=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(p=>[p,inv.files.find(x=>x.path===p)?.sha256])))):inv.files.find(x=>x.path===e.source)?.sha256;if(e.source_sha256!==wanted)throw Error('Changed target not regenerated: '+t.target)}
 const roles=inv.files.filter(x=>x.category==='agent').map(x=>path.posix.basename(x.path,'.md')).sort();
 for(const family of ['skills','references','support','rules','roles'])execFileSync(process.execPath,[path.join(root,'scripts/codex/generate.mjs'),'--family',family,...(family==='roles'?['--names',roles.join(',')]:[]),'--check','--complete','--verify-pending'],{cwd:root,stdio:'pipe'});
 execFileSync(process.execPath,[path.join(root,'scripts/codex/inventory.mjs'),'--check','--verify-pending'],{cwd:root,stdio:'pipe'});
 execFileSync(process.execPath,[path.join(root,'scripts/codex/validate.mjs'),'--verify-pending'],{cwd:root,stdio:'pipe'});
 write(basePath,encode({...active,state:'active',reconciliation_evidence:[...new Set([...active.reconciliation_evidence,...ids.flatMap(id=>mig.entries.find(e=>e.id===id).evidence)])]}));
 console.log('PASS reconciliation finalized after fresh recorded evidence; archived history retained');
}
