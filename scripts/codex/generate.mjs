import {existsSync,readFileSync,readdirSync,mkdirSync,writeFileSync,realpathSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {skillTargets,skillSources} from './skills-generation.mjs';
import {baseline} from './baseline.mjs';
import {openSource} from './source.mjs';
import {safeProjectPath,safeExternalFile} from './safe-path.mjs';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++){if(['--check','--reconcile','--verify-pending','--complete','--record-native','--register-native'].includes(args[i]))continue;if(['--root','--family','--names','--targets','--review','--source-repo','--source-ref','--source-inventory','--overlay-root','--candidate-dir'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--')){i++;continue}throw Error(`Unknown or incomplete argument: ${args[i]}`)}
const val=k=>{let i=args.indexOf(k);return i<0?null:args[i+1]};const root=path.resolve(val('--root')||here), family=val('--family')||'skills', names=val('--names')?.split(',').filter(Boolean), check=args.includes('--check');
const reconcile=args.includes('--reconcile'), verifyPending=args.includes('--verify-pending'), active=baseline(root,{allowPending:reconcile||verifyPending});
const complete=args.includes('--complete');if(complete&&!check)throw Error('--complete requires --check');
if(args.includes('--register-native')){
 if(args.some(a=>['--check','--record-native','--reconcile','--verify-pending','--complete','--family','--names','--source-repo','--source-ref','--source-inventory','--overlay-root','--candidate-dir'].includes(a))||!val('--targets')||!val('--review')?.trim())throw Error('--register-native requires --targets and a review note; it cannot be combined with other operations');
 const selected=val('--targets').split(','),review=val('--review').trim();
 if(review.length>2000||new Set(selected).size!==selected.length||selected.some(p=>!/^\.agents\/skills\/[a-z0-9][a-z0-9-]*\/.+/.test(p)&&!/^\.codex\/agents\/[a-z0-9][a-z0-9-]*\.toml$/.test(p)))throw Error('Invalid native registration selection or review');
 const regPath=safeProjectPath(root,'docs/codex/generation-manifest.json'),original=readFileSync(regPath),registry=JSON.parse(original),migration=JSON.parse(readFileSync(safeProjectPath(root,'docs/codex/migration-manifest.json'))),hash=b=>createHash('sha256').update(b).digest('hex');
 if(registry.schema!==1||registry.source_commit!==active.source_commit||!Array.isArray(registry.entries)||!Array.isArray(migration.entries))throw Error('Invalid registration metadata');
 const mappings=[...registry.entries.map(e=>({target:e.target,sha256:e.target_sha256})),...migration.entries.flatMap(e=>[...(e.target_sha256?[{target:e.target,sha256:e.target_sha256}]:[]),...(e.related_targets||[])]),...(migration.retired_manual_mappings||[]).map(e=>({target:e.target,sha256:e.target_sha256}))];
 for(const m of mappings)if(hash(readFileSync(safeProjectPath(root,m.target)))!==m.sha256)throw Error('Unselected target drift: '+m.target);
 for(const target of selected){
  if(mappings.some(m=>m.target===target)||registry.entries.some(e=>e.target===target))throw Error('Target already registered: '+target);
  const file=safeProjectPath(root,target,{roots:['.agents/skills/','.codex/agents/']});if(!statSync(file).isFile())throw Error('Native target is not a regular file: '+target);
  registry.entries.push({id:'native:'+target,target,target_sha256:hash(readFileSync(file)),ownership:'native',transform_ids:['native-authored'],authored_provenance:{review}});
 }
 registry.entries.sort((a,b)=>a.target.localeCompare(b.target));
 try{writeFileSync(regPath,JSON.stringify(registry,null,2)+'\n');const result=spawnSync(process.execPath,[path.join(here,'scripts/codex/validate.mjs'),'--root',root],{stdio:'inherit'});if(result.error||result.status!==0)throw Error('Native validation failed; registry restored')}
 catch(e){writeFileSync(regPath,original);throw e}
 console.log('Registered reviewed native-authored targets; behavioral review remains separate.');process.exit(0);
}
if(args.includes('--record-native')){
 if(check||reconcile||verifyPending||!val('--targets'))throw Error('--record-native requires --targets and cannot be combined with checks or reconciliation');
 const selected=val('--targets').split(',');if(new Set(selected).size!==selected.length||selected.some(p=>!p||path.posix.isAbsolute(p)||p.includes('\\')||p.split('/').includes('..')||p.includes(':')))throw Error('Invalid target selection');
 const files=['docs/codex/generation-manifest.json','docs/codex/migration-manifest.json'];
 const original=files.map(p=>readFileSync(safeProjectPath(root,p)));
 const [registry,migration]=original.map(b=>JSON.parse(b.toString('utf8').replace(/^\uFEFF/,'')));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 const mappings=[...registry.entries.map(e=>({target:e.target,entry:e,key:'target_sha256'})),...migration.entries.flatMap(e=>[...(e.target_sha256?[{target:e.target,entry:e,key:'target_sha256'}]:[]),...(e.related_targets||[]).map(t=>({target:t.target,entry:t,key:'sha256'}))]),...(migration.retired_manual_mappings||[]).map(e=>({target:e.target,entry:e,key:'target_sha256'}))];
 for(const target of selected)if(!mappings.some(m=>m.target===target))throw Error('Unregistered target: '+target);
 for(const m of mappings){const actual=hash(readFileSync(safeProjectPath(root,m.target)));if(!selected.includes(m.target)&&actual!==m.entry[m.key])throw Error('Unselected target drift: '+m.target)}
 for(const m of mappings)if(selected.includes(m.target))m.entry[m.key]=hash(readFileSync(safeProjectPath(root,m.target)));
 try{
  for(let i=0;i<files.length;i++)writeFileSync(safeProjectPath(root,files[i]),JSON.stringify([registry,migration][i],null,2)+'\n');
  const result=spawnSync(process.execPath,[path.join(here,'scripts/codex/validate.mjs'),'--root',root],{stdio:'inherit'});
  if(result.error||result.status!==0)throw Error('Native validation failed; metadata restored');
 }catch(e){for(let i=0;i<files.length;i++)writeFileSync(safeProjectPath(root,files[i]),original[i]);throw e}
 console.log('Recorded reviewed native target hashes; migration status and provenance are unchanged.');process.exit(0);
}
// Normal checks validate the maintained native product, without opening the upstream repository.
if(check&&!verifyPending){
 const result=spawnSync(process.execPath,[path.join(here,'scripts/codex/validate.mjs'),'--root',root],{stdio:'inherit'});
 if(result.error)throw result.error;
 process.exit(result.status??1);
}
const candidateDir=val('--candidate-dir')?path.resolve(val('--candidate-dir')):null;
if(candidateDir&&(check||reconcile||verifyPending||existsSync(candidateDir)||candidateDir===root||(!path.relative(root,candidateDir).startsWith('..'+path.sep)&&!path.isAbsolute(path.relative(root,candidateDir)))))throw Error('Candidate directory must be new and outside the product root');
if(candidateDir){const parent=realpathSync(path.dirname(candidateDir)),realRoot=realpathSync(root),rel=path.relative(realRoot,parent);if(!rel||(rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel)))throw Error('Candidate parent resolves inside product root')}
if(!reconcile&&!verifyPending&&!candidateDir)throw Error('Source imports require --candidate-dir or explicitly reviewed reconciliation; canonical native targets are not regenerated directly');
if(verifyPending&&(reconcile||!check||active.state!=='pending'))throw Error('--verify-pending is read-only and requires a pending baseline');
if(reconcile&&(active.state!=='pending'||check||!val('--targets')))throw Error('Reconcile requires pending baseline, selected --targets and no --check');
if(!reconcile&&val('--targets'))throw Error('--targets requires --reconcile');
let reviewed=null;
if(reconcile){const bytes=readFileSync(safeProjectPath(root,active.plan));if(createHash('sha256').update(bytes).digest('hex')!==active.plan_sha256)throw Error('Reconciliation plan changed');reviewed=JSON.parse(bytes);if(reviewed.new_sha!==active.source_commit)throw Error('Reconciliation plan SHA mismatch')}
if(!['skills','references','support','roles','rules'].includes(family))throw Error(`Unsupported family ${family}`);
if(!['skills','roles'].includes(family) && names)throw Error('--names is supported for skills and roles only');
if(names && new Set(names).size!==names.length)throw Error('Duplicate skill selection');
if(['skills','roles'].includes(family) && !check && !names)throw Error('Specify --names for skill/role generation; bulk generation requires an explicit selection');
const file=safeProjectPath(root,'docs/codex/generation-manifest.json'), hash=b=>createHash('sha256').update(b).digest('hex');
const registry=existsSync(file)?JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{schema:1,source_commit:active.source_commit,entries:[]};
if(registry.schema!==1 || registry.source_commit!==active.source_commit||!Array.isArray(registry.entries))throw Error('Invalid generation registry');
if(!val('--source-ref'))throw Error('Explicit --source-ref is required for source generation');
if((val('--source-inventory')||val('--overlay-root'))&&!candidateDir)throw Error('Staged inventory and overlays require --candidate-dir');
const inventory=JSON.parse(readFileSync(val('--source-inventory')?safeExternalFile(val('--source-inventory')):safeProjectPath(root,'docs/codex/upstream-inventory.json'),'utf8').replace(/^\uFEFF/,''));
const source=openSource({root,repository:val('--source-repo')||root,ref:val('--source-ref'),expectedCommit:inventory.source_commit});
const overlayRoot=val('--overlay-root')?safeExternalFile(val('--overlay-root')):root;
const sources=skillSources(root,source,inventory), sourceByPath=new Map(sources.map(s=>[s.path,s]));
const inventoryByPath=new Map(inventory.files.map(x=>[x.path,x]));
const sourceHash=b=>hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
let candidates;
if(family==='skills') candidates=skillTargets(root,names,source,inventory,overlayRoot);
else {
 const modules={references:'./reference-generation.mjs',support:'./support-generation.mjs',roles:'./roles-generation.mjs',rules:'./rules-generation.mjs'};
 const mod=await import(modules[family]);
 const raw=await (family==='references'?mod.referenceTargets({root,source}):family==='support'?mod.supportTargets(root,source,overlayRoot):family==='roles'?mod.roleTargets(root,names,source,inventory):mod.ruleTargets(root,source));
 if(family==='rules'){const index=mod.ruleIndex(root,source);raw.push({source:'@derived/rules-index',sources:index.rules.map(r=>r.source),target:'.agents/rules/index.json',content:JSON.stringify(index,null,2)+'\n',transform_ids:['rule-scope-index-v1'],owner:'CGS-23'})}
 candidates=raw.map(p=>{const inputs=p.sources||[p.source];for(const input of inputs){const entry=inventoryByPath.get(input),bytes=source.read(input);if(!entry||sourceHash(bytes)!==entry.sha256)throw Error(`Source drift or unregistered source: ${input}`)}const source_sha256=p.sources?hash(Buffer.from(JSON.stringify(inputs.map(s=>[s,inventoryByPath.get(s).sha256])))):inventoryByPath.get(p.source).sha256;return {...p,source_sha256,content:Buffer.from(p.content),ownership:'generated'}})
}
const existing=new Map(registry.entries.map(e=>[e.target,e])); if(existing.size!==registry.entries.length)throw Error('Duplicate registered target');
if(complete){const missing=candidates.find(p=>!existing.has(p.target));if(missing)throw Error('Missing registered candidate target: '+missing.target)}
function checkTarget(e){let b;try{b=readFileSync(safeProjectPath(root,e.target,{roots:['.agents/','.codex/']}))}catch(error){throw Error(`Invalid registered target: ${e.target}: ${error.message}`)}if(hash(b)!==e.target_sha256)throw Error(`Manual target drift: ${e.target}`);if(candidateDir||e.ownership==='native')return;const inputs=e.sources||[e.source];for(const input of inputs){const expected=inventoryByPath.get(input)?.sha256;if(!expected||sourceHash(source.read(input))!==expected)throw Error(`Registered source drift: ${input}`)}const expected=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(s=>[s,inventoryByPath.get(s).sha256])))):inventoryByPath.get(e.source).sha256;const old=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(s=>[s,reviewed?.changes.find(c=>c.source===s)?.old_sha256||inventoryByPath.get(s).sha256])))):reviewed?.changes.find(c=>c.source===e.source)?.old_sha256;if(expected!==e.source_sha256&&(!reconcile||old!==e.source_sha256))throw Error(`Registered source drift: ${e.source}`)}
for(const e of registry.entries) checkTarget(e);
function walk(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)])}
for(const p of walk(path.join(root,'.agents/skills'))){const rel=path.relative(root,p).split(path.sep).join('/');if(!existing.has(rel)) throw Error(`Unregistered skill target: ${rel}`)}
const plans=[];
const selected=reconcile?val('--targets').split(','):null;
if(selected&&(new Set(selected).size!==selected.length||selected.some(t=>!reviewed.changes.some(c=>c.targets.some(x=>x.target===t)))))throw Error('Unreviewed reconciliation target selection');
if(selected)for(const c of reviewed.changes.filter(c=>c.targets.some(t=>selected.includes(t.target))))if(c.overlay&&hash(readFileSync(path.join(root,c.overlay.path)))!==c.overlay.sha256)throw Error('Reviewed overlay drift: '+c.source);
for(const p of candidates){if(selected&&!selected.includes(p.target))continue;const old=existing.get(p.target), target=safeProjectPath(root,p.target,{roots:['.agents/','.codex/']});if(!old&&existsSync(target) && !(family!=='skills' && hash(readFileSync(target))===hash(p.content)))throw Error(`Refusing unregistered target: ${p.target}`);if(old&&old.ownership!=='generated'&&!candidateDir)throw Error(`Manual target cannot be generated: ${p.target}`);if(reconcile&&!old)throw Error('New targets require explicit onboarding: '+p.target);if(old && hash(p.content)!==old.target_sha256) {if(check) throw Error(`Generated output drift: ${p.target}`)}
 if(old || !check)plans.push(p);
}
if(selected&&plans.length!==selected.length)throw Error('Selected reconciliation target missing from family plan');
if(candidateDir){
 for(const p of plans){const target=path.resolve(candidateDir,p.target),rel=path.relative(candidateDir,target);if(!rel||rel.startsWith('..'+path.sep)||path.isAbsolute(rel))throw Error('Unsafe candidate target: '+p.target);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,p.content,{flag:'wx'})}
 console.log(`PENDING review: wrote ${plans.length} isolated candidates from ${source.commit}; native product files and metadata unchanged.`);
}else if(check){
 for(const p of plans){const text=p.content.toString('utf8');if(p.target.endsWith('/SKILL.md')){const fm=/^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n/.exec(text);if(!fm||fm[1]!==p.target.split('/')[2])throw Error(`Invalid native frontmatter: ${p.target}`);if(/!`|\bCLAUDE_[A-Z_]+\b|\bAskUserQuestion\b|^model:/m.test(text))throw Error(`Untranslated runtime construct: ${p.target}`)}}
 console.log(`${verifyPending?'PENDING verification only':'PASS'}: ${sources.filter(s=>s.path.endsWith('/SKILL.md')).length} source skills accounted; ${registry.entries.filter(e=>e.source?.startsWith('.claude/skills/')).length} generated skill files registered; migration status is checked separately`);
}else{
 for(const p of plans){const target=path.join(root,p.target);mkdirSync(path.dirname(target),{recursive:true});if(!existsSync(target)||hash(readFileSync(target))!==hash(p.content))writeFileSync(target,p.content);const entry={id:`file:${p.source}=>${p.target}`,source:p.source,...(p.sources?{sources:p.sources}:{}),source_sha256:p.source_sha256,target:p.target,target_sha256:hash(p.content),transform_version:1,transform_ids:p.transform_ids,owner:p.owner,ownership:p.ownership};existing.set(p.target,entry)}
 registry.entries=[...existing.values()].sort((a,b)=>a.target.localeCompare(b.target));mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(registry,null,2)+'\n');console.log(`Generated ${plans.length} guarded files; generated files do not establish migration status`);
}
