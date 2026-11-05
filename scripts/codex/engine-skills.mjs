import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {safeProjectPath, safeExternalFile} from './safe-path.mjs';
import {runHelper} from './helper.mjs';
import {isMainEntry} from './main-entry.mjs';

const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const MANIFEST='.codex/external-engine-skills.json';
const LOCK='.codex-tmp/engine-skills-operation.lock';
const MAX_BYTES=512*1024;
const namePattern=/^[a-z0-9][a-z0-9-]{0,63}$/;
const digestPattern=/^[a-f0-9]{64}$/;
const sourcePattern=/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export const sha256=b=>createHash('sha256').update(b).digest('hex');
const jsonBytes=o=>Buffer.from(JSON.stringify(o,null,2)+'\n');
const bytesAt=(root,p)=>{const f=safeProjectPath(root,p);if(!fs.existsSync(f))return null;if(!fs.lstatSync(f).isFile())throw Error('Not a regular file: '+p);const n=fs.statSync(f).size;if(n>MAX_BYTES)throw Error('File too large: '+p);return fs.readFileSync(f);};
const text=b=>{if(b.includes(0))throw Error('Binary documentation refused');return new TextDecoder('utf-8',{fatal:true}).decode(b);};
const jsonAt=(root,p,fallback)=>{const b=bytesAt(root,p);return b?JSON.parse(text(b).replace(/^\uFEFF/,'')):fallback;};
const equalHash=(b,h)=>b!==null&&sha256(b)===h;
function relativeDoc(p){
 if(typeof p!=='string'||p.length>180||p.includes('\\')||p.includes(':')||p.split('/').some(x=>!x||x==='.'||x==='..'||x.startsWith('.')))throw Error('Unsafe document path: '+p);
 if(!/^(?:SKILL\.md|LICENSE|references\/[A-Za-z0-9_./-]+\.md)$/.test(p))throw Error('Documentation-only package: '+p);
 return p;
}
function gitPath(p){
 if(typeof p!=='string'||!p||p.includes('\\')||p.includes(':')||p.startsWith('/')||p.split('/').some(x=>!x||x==='.'||x==='..'||/^\.env/i.test(x)))throw Error('Unsafe Git source path');
 return p;
}
function sourceIdentity(s){
 if(!s||!sourcePattern.test(s.repository||'')||!/^[a-f0-9]{40}$/.test(s.commit||''))throw Error('Source requires a public HTTPS GitHub repository and immutable commit');
 gitPath(s.directory);return s;
}
function version(v){const m=/(\d+)\.(\d+)(?:\.(\d+))?/.exec(v||'');if(!m)throw Error('Unrecognized engine version: '+v);return m.slice(1).map(x=>Number(x||0));}
const compare=(a,b)=>{for(let i=0;i<3;i++)if(a[i]!==b[i])return Math.sign(a[i]-b[i]);return 0;};
function compatible(entry,ctx){return ctx?.name===entry.engine&&ctx?.verified===true&&compare(version(ctx.version),version(entry.engine_versions.min))>=0&&compare(version(ctx.version),version(entry.engine_versions.max_exclusive))<0;}
/** Validate the supported documentation-only catalog without contacting its sources. */
export function validateCatalog(value){
 const c=structuredClone(value);
 if(c?.schema!==1||!Array.isArray(c.entries)||c.entries.length>100)throw Error('Invalid catalog');
 const ids=new Set;
 for(const e of c.entries){
  if(!namePattern.test(e.id||'')||ids.has(e.id)||!['godot','unity','unreal'].includes(e.engine))throw Error('Invalid or duplicate package identity');
  ids.add(e.id);sourceIdentity(e.source);version(e.engine_versions?.min);version(e.engine_versions?.max_exclusive);
  if(compare(version(e.engine_versions.min),version(e.engine_versions.max_exclusive))>=0||e.license?.spdx!=='MIT'||!digestPattern.test(e.license.sha256||'')||!e.version||e.review?.status!=='reviewed')throw Error('Unreviewed package, license or version range');
  gitPath(e.license.source_path);
  if(!Array.isArray(e.files)||e.files.length>32||e.files.length<2)throw Error('Invalid documentation file set');
  const paths=new Set;
  for(const f of e.files){
   relativeDoc(f.path);gitPath(f.source_path);
   if(paths.has(f.path)||!digestPattern.test(f.sha256||''))throw Error('Invalid file pin');
   paths.add(f.path);
   const expected=f.path==='LICENSE'?e.license.source_path:e.source.directory+'/'+f.path;
   if(f.source_path!==expected)throw Error('Source path outside reviewed package');
  }
  const lic=e.files.find(f=>f.path==='LICENSE');
  if(!paths.has('SKILL.md')||!lic||lic.sha256!==e.license.sha256)throw Error('Missing Skill or exact license pin');
  e.files.sort((a,b)=>a.path.localeCompare(b.path));
 }
 c.entries.sort((a,b)=>a.id.localeCompare(b.id));return c;
}
/** Read a bounded explicit/default catalog with secret/symlink path protection. */
export function readCatalog(file=path.join(here,'docs/codex/engine-skills-catalog.json')){
 const f=safeExternalFile(file);if(!fs.statSync(f).isFile()||fs.statSync(f).size>MAX_BYTES)throw Error('Invalid catalog file');
 return validateCatalog(JSON.parse(text(fs.readFileSync(f)).replace(/^\uFEFF/,'')));
}
function nativeEntries(root){return jsonAt(root,'docs/codex/generation-manifest.json',{entries:[]}).entries||[];}
function readManifest(root){
 const m=jsonAt(root,MANIFEST,{schema:1,entries:[]});
 if(m?.schema!==1||!Array.isArray(m.entries)||m.entries.length>100)throw Error('Invalid external manifest');
 const names=new Set;
 for(const e of m.entries){
  if(!namePattern.test(e.id||'')||names.has(e.id)||e.install_path!=='.agents/skills/'+e.id||!['godot','unity','unreal'].includes(e.engine)||!e.version||e.update_status!=='AT_REVIEWED_PIN')throw Error('Invalid external identity/path/update state');
  names.add(e.id);sourceIdentity(e.source);
  if(e.license?.spdx!=='MIT'||!digestPattern.test(e.license.sha256||'')||!Array.isArray(e.files)||e.files.length>32)throw Error('Invalid external license/files');
  gitPath(e.license.source_path);
  const seen=new Set;
  for(const f of e.files){relativeDoc(f.path);if(seen.has(f.path)||!digestPattern.test(f.sha256||''))throw Error('Invalid external file hash');seen.add(f.path);}
  if(!seen.has('SKILL.md')||!seen.has('LICENSE')||e.files.find(f=>f.path==='LICENSE').sha256!==e.license.sha256)throw Error('Missing installed Skill/license');
 }
 return m;
}
/** Check the native scalar metadata subset; source text never supplies permissions. */
export function screenSkill(content,id){
 const front=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);if(!front)throw Error('Incompatible Skill frontmatter');
 const fields={};
 for(const line of front[1].split(/\r?\n/)){
  const m=/^(name|description):[ \t]*(.+)$/.exec(line);if(!m||Object.hasOwn(fields,m[1]))throw Error('Only unique scalar name/description are supported');
  let v=m[2].trim();if(v.startsWith('"'))v=JSON.parse(v);else if(v.startsWith("'")&&v.endsWith("'"))v=v.slice(1,-1).replaceAll("''","'");
  if(!v||/^[|>[\]{&*!]/.test(v))throw Error('Unsupported YAML scalar');
  fields[m[1]]=v;
 }
 if(fields.name!==id||typeof fields.description!=='string'||!fields.description.trim())throw Error('Skill identity mismatch');
 screenInstructions(content);
}
/** Finite conservative compatibility screen, not a security certification. */
export function screenInstructions(content){
 const risky=/ignore.{0,50}(?:previous|system|developer).{0,30}instructions|bypass.{0,30}(?:approval|sandbox|permissions?)|(?:send|exfiltrate).{0,50}(?:credentials|tokens?|secrets?)|(?:curl|wget)[^\n]{0,120}\|\s*(?:ba)?sh\b|git\s+(?:reset\s+--hard|push[^\n]{0,60}--force)|AskUserQuestion\s*[:(]|subagent_type\s*[:=]|\.claude\//i;
 if(risky.test(content))throw Error('Suspicious or incompatible operational instructions; review refused');
}
function referencesPresent(files){
 for(const [p,b]of files){
  if(!p.endsWith('.md'))continue;
  const body=text(b);
  for(const m of body.matchAll(/\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)){
   if(/^[a-z][a-z0-9+.-]*:/i.test(m[1]))continue;
   const target=path.posix.normalize(path.posix.join(path.posix.dirname(p),m[1]));
   if(!files.has(target))throw Error('Missing/escaping package reference: '+p+' -> '+m[1]);
  }
  if(p==='SKILL.md')for(const m of body.matchAll(/\x60(references\/[A-Za-z0-9_./-]+\.md)\x60/g))if(!files.has(m[1]))throw Error('Missing bundled reference: '+m[1]);
 }
}
function packageFiles(root,base){
 const result=[];
 function visit(relative){
  const dir=safeProjectPath(root,relative);if(!fs.existsSync(dir))return;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
   const p=relative+'/'+e.name;safeProjectPath(root,p);
   if(e.isSymbolicLink())throw Error('Symlink package entry refused: '+p);
   if(e.isDirectory())visit(p);else result.push(p);
   if(result.length>128)throw Error('Unmanaged package file limit exceeded');
  }
 }
 visit(base);return result;
}
/** Inspect separate external ownership; never allow it to shadow native targets. */
export function inspectInstalled(root,{nativeTargets=new Set(nativeEntries(root).map(e=>e.target)),strict=false}={}){
 const manifest=readManifest(root),targets=[],states=[];
 for(const e of manifest.entries){
  let status='CURRENT';const files=new Map;
  for(const f of e.files){
   const p=e.install_path+'/'+f.path;if(nativeTargets.has(p))throw Error('External ownership collides with native registry: '+p);
   const b=bytesAt(root,p);targets.push(p);
   if(b===null)status='MISSING';else{files.set(f.path,b);if(!equalHash(b,f.sha256))status='MODIFIED';}
  }
  if(files.has('SKILL.md'))screenSkill(text(files.get('SKILL.md')),e.id);
  if(files.has('LICENSE')&&!/MIT License[\s\S]*Permission is hereby granted/.test(text(files.get('LICENSE'))))throw Error('Installed MIT notice missing');
  const unmanaged=packageFiles(root,e.install_path).filter(p=>!e.files.some(f=>e.install_path+'/'+f.path===p));
  if(unmanaged.length)status='UNMANAGED';
  if(status==='CURRENT')referencesPresent(files);
  if(strict&&status!=='CURRENT')throw Error('External target drift: '+e.id+' ('+status+')');
  states.push({id:e.id,status,unmanaged,version:e.version,update_status:e.update_status,source:e.source,license:e.license});
 }
 return {manifest,targets,states};
}
/** Resolve effective project facts; run an editor only through an explicit trusted exe. */
export function projectEngine(root,{engine,exe}={}){
 for(const p of ['project.yaml','project.local.yaml','.agents/docs/technical-preferences.md','docs/project/technical-preferences.md']){
  const f=safeProjectPath(root,p);if(fs.existsSync(f)&&!fs.lstatSync(f).isFile())throw Error('Configuration must be a regular file: '+p);
 }
 const diagnostics=[];
 const get=key=>{const r=runHelper('yaml-helper',['resolve_setting',key],root,'pipe');if(r.status!==0)throw Error('Configuration helper unavailable: '+r.stderr);if(r.stderr?.trim())diagnostics.push(r.stderr.trim());const[v,source]=r.stdout.split('\t');return {value:v,source};};
 const configured=get('engine.name'),pin=get('engine.version'),names={Godot:'godot',Unity:'unity',Unreal:'unreal'};
 const chosen=engine||names[configured.value];
 if(engine&&!['godot','unity','unreal'].includes(engine))throw Error('Unknown explicit engine');
 if(engine&&names[configured.value]&&engine!==names[configured.value])throw Error('Explicit engine differs from selected project');
 const ctx={name:chosen||null,configured:configured.value||null,configured_source:configured.source,pinned_version:pin.value||null,verified:false,version:null,diagnostics,diagnostic:'Pass an explicit installed --exe for a version probe; no executable is launched by default.'};
 if(!exe)return ctx;
 if(chosen!=='godot'){ctx.diagnostic='This MVP verifies Godot; other engine probes are NOT ASSESSED.';return ctx;}
 if(!path.isAbsolute(exe)||!/^godot[a-z0-9._-]*$/i.test(path.basename(exe)))throw Error('--exe must name an explicit installed Godot binary');
 const actual=safeExternalFile(exe);if(!fs.statSync(actual).isFile())throw Error('Engine binary missing');
 const r=spawnSync(actual,['--version'],{cwd:root,encoding:'utf8',timeout:10000,windowsHide:true});
 if(r.error||r.status!==0){ctx.diagnostic='Engine version probe failed: '+(r.error?.message||r.stderr);return ctx;}
 const found=version(r.stdout);ctx.version=found.join('.');ctx.probe_output=r.stdout.trim().slice(0,200);
 if(pin.value&&compare(version(pin.value),found)!==0){ctx.diagnostic='Installed version differs from project pin';return ctx;}
 ctx.verified=true;ctx.diagnostic='Installed Godot version verified through explicit --exe';return ctx;
}
/** Return ownership/relevance observations offline, with no package writes. */
export function listSkills({root,catalog,context}){
 const c=validateCatalog(catalog),installed=inspectInstalled(root),registered=nativeEntries(root),names=new Map;
 for(const e of registered){const m=/^\.agents\/skills\/([^/]+)\/SKILL\.md$/.exec(e.target);if(m)names.set(m[1],e.authored_provenance?'user-registered':'first-party');}
 for(const e of installed.manifest.entries)names.set(e.id,'external');
 const base=safeProjectPath(root,'.agents/skills');
 if(fs.existsSync(base))for(const d of fs.readdirSync(base,{withFileTypes:true})){if(d.isSymbolicLink())throw Error('Symlink Skill directory refused');if(d.isDirectory()&&!names.has(d.name))names.set(d.name,'user-unregistered');}
 const candidates=c.entries.map(e=>{
  const old=installed.manifest.entries.find(x=>x.id===e.id),state=installed.states.find(x=>x.id===e.id);
  const update_status=!old?'NOT_INSTALLED':old.source.repository!==e.source.repository||old.source.directory!==e.source.directory?'SOURCE_REVIEW_REQUIRED':state.status!=='CURRENT'?'LOCAL_CHANGES':old.source.commit!==e.source.commit||old.version!==e.version?'NEW_REVIEWED_PIN_AVAILABLE':'AT_REVIEWED_PIN';
  return {id:e.id,engine:e.engine,version:e.version,installed_version:old?.version||null,update_status,source:e.source,license:e.license,review:e.review,relevant:compatible(e,context),status:context?.verified?'REVIEW_REQUIRED':'NOT_ASSESSED'};
 });
 return {schema:1,network:'offline',engine:context,installed:installed.states,ownership:[...names].map(([name,owner])=>({name,owner})),candidates};
}
async function documentBytes(root,entry,file,{network=false,fetcher=fetch}={}){
 const p='.codex-tmp/engine-skills-cache/'+file.sha256,existing=bytesAt(root,p);
 if(existing){if(!equalHash(existing,file.sha256))throw Error('Cache checksum mismatch: '+file.path);return existing;}
 if(!network)return null;
 const repo=entry.source.repository.slice('https://github.com/'.length);
 const url='https://raw.githubusercontent.com/'+repo+'/'+entry.source.commit+'/'+file.source_path;
 const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Pinned source unavailable ('+response.status+'): '+file.path);
 let length=0;const chunks=[];
 for await(const part of response.body){length+=part.length;if(length>MAX_BYTES)throw Error('Source document too large');chunks.push(Buffer.from(part));}
 const b=Buffer.concat(chunks);text(b);if(!equalHash(b,file.sha256))throw Error('Source checksum mismatch: '+file.path);
 const dest=safeProjectPath(root,p);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b,{flag:'wx'});return b;
}
const patch=(p,a,b)=>'--- a/'+p+'\n+++ b/'+p+'\n@@ full document @@\n'+(a?text(a).split('\n').map(x=>'-'+x).join('\n')+'\n':'')+text(b).split('\n').map(x=>'+'+x).join('\n');
/** Prepare full diffs and an approval digest; only an explicit network choice may cache bytes. */
export async function makePlan({root,catalog,context,id,network=false,fetcher}){
 const c=validateCatalog(catalog),entry=c.entries.find(e=>e.id===id);if(!entry)throw Error('Package/version not in approved pinned catalog');
 const installed=inspectInstalled(root),{manifest}=installed,old=manifest.entries.find(e=>e.id===id),native=new Set(nativeEntries(root).map(e=>e.target));
 if(old&&(old.source.repository!==entry.source.repository||old.source.directory!==entry.source.directory))throw Error('Update source identity changed; separate source review required');
 const reasons=[],incoming=new Map,files=[],base='.agents/skills/'+id;
 for(const p of installed.states.find(e=>e.id===id)?.unmanaged||[])reasons.push('Unmanaged local file: '+p);
 if(!compatible(entry,context))reasons.push('Installed engine is unverified or outside the approved version range');
 const dir=safeProjectPath(root,base);
 if(fs.existsSync(dir)&&!old)reasons.push('Existing first-party/user directory is never overwritten');
 for(const f of entry.files){
  const p=base+'/'+f.path;if(native.has(p))reasons.push('Native-owned target: '+p);
  const current=bytesAt(root,p),b=await documentBytes(root,entry,f,{network,fetcher});
  const prior=old?.files.find(x=>x.path===f.path),changed=Boolean(old&&(!prior?current!==null:!equalHash(current,prior.sha256)));
  if(changed)reasons.push('Local modification conflict: '+p);
  if(!b)reasons.push('Offline cache miss: '+f.path);else incoming.set(f.path,b);
  const original=prior?bytesAt(root,'.codex-tmp/engine-skills-cache/'+prior.sha256):null;
  if(original&&!equalHash(original,prior.sha256))throw Error('Base cache checksum mismatch: '+f.path);
  files.push({path:p,document:f.path,before_sha256:current?sha256(current):null,base_sha256:prior?.sha256||null,after_sha256:f.sha256,status:changed?'CONFLICT':!b?'NEEDS_FETCH':equalHash(current,f.sha256)?'UNCHANGED':current?'UPDATE':'CREATE',diff:b?patch(p,current,b):null,base_to_local_diff:original&&current?patch(p,original,current):null,base_to_incoming_diff:original&&b?patch(p,original,b):null});
 }
 if(old)for(const f of old.files)if(!entry.files.some(x=>x.path===f.path))reasons.push('Removed document needs a separate reviewed migration: '+f.path);
 if(incoming.size===entry.files.length){
  screenSkill(text(incoming.get('SKILL.md')),id);
  for(const[p,b]of incoming)if(p.endsWith('.md'))screenInstructions(text(b));
  if(!/MIT License[\s\S]*Permission is hereby granted/.test(text(incoming.get('LICENSE'))))throw Error('Pinned source has no MIT permission notice');
  referencesPresent(incoming);
 }
 const beforeManifest=bytesAt(root,MANIFEST);
 const configuration_sha256=Object.fromEntries(['project.yaml','project.local.yaml','AGENTS.md'].map(p=>{const b=bytesAt(root,p);return [p,b?sha256(b):null];}));
 const plan={schema:1,root_identity:sha256(fs.realpathSync(root)),configuration_sha256,catalog_sha256:sha256(JSON.stringify(c)),id,engine:context,source:entry.source,version:entry.version,license:entry.license,review:entry.review,manifest_before_sha256:beforeManifest?sha256(beforeManifest):null,status:reasons.length?'BLOCKED':'READY',action:reasons.length?'REFUSE':files.every(f=>f.status==='UNCHANGED')?'NO_OP':old?'UPDATE':'INSTALL',reasons:[...new Set(reasons)],files};
 plan.approval=sha256(JSON.stringify(plan));return plan;
}
function atomic(root,p,b){
 const dest=safeProjectPath(root,p);fs.mkdirSync(path.dirname(dest),{recursive:true});
 const temp=dest+'.cgs-'+randomUUID()+'.tmp';
 try{fs.writeFileSync(temp,b,{flag:'wx'});safeProjectPath(root,p);fs.renameSync(temp,dest);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
}
/** Apply only an unchanged approved plan, retaining backups and preserving concurrent edits. */
export async function applyPlan(options,{afterWrite,validate}={}){
 const {root,catalog,id,approve}=options,initial=await makePlan(options);
 if(!approve||approve!==initial.approval)throw Error('Explicit approval must match this exact reviewed plan hash');
 if(initial.status!=='READY')throw Error('Plan refused: '+initial.reasons.join('; '));
 if(initial.action==='NO_OP')return {status:'NO_OP',written:[],plan:initial.approval};
 const lock=safeProjectPath(root,LOCK);fs.mkdirSync(path.dirname(lock),{recursive:true});
 let fd;try{fd=fs.openSync(lock,'wx');}catch(e){if(e.code==='EEXIST')throw Error('Another operation or stale lock exists; inspect it manually');throw e;}
 const originals=new Map,written=new Map,createdDirs=new Set,token=randomUUID();
 const transactionPath='.codex-tmp/engine-skills-transactions/'+token+'/backup.json';
 let transaction;
 try{fs.writeFileSync(fd,token);}finally{fs.closeSync(fd);}
 try{
  const plan=await makePlan({...options,network:false});
  if(plan.approval!==approve)throw Error('Stale plan: project, cache or catalog changed');
  const entry=validateCatalog(catalog).entries.find(e=>e.id===id),manifest=readManifest(root);
  const install={id,engine:entry.engine,version:entry.version,update_status:'AT_REVIEWED_PIN',source:entry.source,license:entry.license,install_path:'.agents/skills/'+id,files:entry.files.map(({path,sha256})=>({path,sha256}))};
  manifest.entries=manifest.entries.filter(e=>e.id!==id).concat(install).sort((a,b)=>a.id.localeCompare(b.id));
  const changes=plan.files.filter(f=>f.status!=='UNCHANGED').map(f=>[f.path,bytesAt(root,'.codex-tmp/engine-skills-cache/'+f.after_sha256),f.before_sha256]);
  changes.push([MANIFEST,jsonBytes(manifest),plan.manifest_before_sha256]);
  for(const[p]of changes){
   let parent=path.posix.dirname(p);
   while(parent!=='.'&&!fs.existsSync(safeProjectPath(root,parent))){createdDirs.add(parent);parent=path.posix.dirname(parent);}
  }
  transaction={schema:1,id,root_identity:plan.root_identity,plan:approve,status:'PREPARED',created_directories:[...createdDirs],changes:changes.map(([p,b])=>({path:p,before_base64:bytesAt(root,p)?.toString('base64')??null,after_sha256:sha256(b)}))};
  atomic(root,transactionPath,jsonBytes(transaction));
  for(const[p,b,expected]of changes){
   const current=bytesAt(root,p);if((current?sha256(current):null)!==expected)throw Error('Concurrent edit before write: '+p);
   originals.set(p,current);
   atomic(root,p,b);written.set(p,sha256(b));if(afterWrite)await afterWrite(p);
  }
  inspectInstalled(root,{strict:true});
  if(validate)await validate();
  else if(fs.existsSync(safeProjectPath(root,'docs/codex/generation-manifest.json'))){
   const r=spawnSync(process.execPath,[path.join(here,'scripts/codex/validate.mjs'),'--root',root],{encoding:'utf8',windowsHide:true,timeout:60000});
   if(r.error||r.status!==0)throw Error('Native/external validation failed: '+(r.error?.message||r.stderr||r.stdout));
  }
  transaction.status='APPLIED';atomic(root,transactionPath,jsonBytes(transaction));
  return {status:'APPLIED',written:[...written.keys()],plan:approve,recovery:transactionPath};
 }catch(error){
  const blocked=[];
  for(const[p,original]of [...originals].reverse()){
   if(!written.has(p))continue;
   try{
    const current=bytesAt(root,p);
    if(!equalHash(current,written.get(p))){blocked.push(p);continue;}
    if(original===null)fs.unlinkSync(safeProjectPath(root,p));else atomic(root,p,original);
   }catch{blocked.push(p);}
  }
  for(const p of [...createdDirs].sort((a,b)=>b.length-a.length)){
   try{const dir=safeProjectPath(root,p);if(fs.existsSync(dir)&&fs.readdirSync(dir).length===0)fs.rmdirSync(dir);}catch{blocked.push(p);}
  }
  if(transaction){transaction.status=blocked.length?'MANUAL_RECOVERY':'ROLLED_BACK';try{atomic(root,transactionPath,jsonBytes(transaction));}catch{blocked.push(transactionPath);}}
  if(blocked.length)throw Error(error.message+'; rollback preserved concurrent edits at '+blocked.join(', ')+'; manually reconcile these files using '+transactionPath);
  throw Error(error.message+'; rollback restored every written file');
 }finally{
  if(fs.existsSync(lock)&&fs.readFileSync(lock,'utf8')===token)fs.unlinkSync(lock);
 }
}
if(isMainEntry(import.meta.url)){
 try{
  const args=process.argv.slice(2),command=args.shift(),opts={};
  if(command==='--help'||!command){console.log('engine-skills.mjs list|plan|install|update --root DIR [--id NAME] [--engine godot] [--exe ABS_GODOT] [--catalog FILE] [--network allow|deny] [--offline] [--apply --approve PLAN_HASH]\nDefault: offline dry-run. Documentation-only Godot MVP; no automatic installation.');process.exit(0);}
  if(!['list','plan','install','update'].includes(command))throw Error('Unknown command');
  for(let i=0;i<args.length;i++){const a=args[i];if(Object.hasOwn(opts,a))throw Error('Duplicate option '+a);if(['--apply','--offline'].includes(a))opts[a]=true;else if(['--root','--id','--engine','--exe','--catalog','--network','--approve'].includes(a)&&args[i+1]&&!args[i+1].startsWith('--'))opts[a]=args[++i];else throw Error('Unknown/incomplete option '+a);}
  if(opts['--network']&&!['allow','deny'].includes(opts['--network']))throw Error('Network must be allow or deny');
  if(opts['--offline']&&opts['--network']==='allow')throw Error('Conflicting offline/network choices');
  if((opts['--apply']||opts['--approve'])&&!['install','update'].includes(command))throw Error('Only install/update can apply a reviewed plan');
  const root=fs.realpathSync(path.resolve(opts['--root']||process.cwd())),catalog=readCatalog(opts['--catalog']),context=projectEngine(root,{engine:opts['--engine'],exe:opts['--exe']});
  if(command==='list'){if(opts['--network']==='allow')throw Error('list never contacts external sources');console.log(JSON.stringify(listSkills({root,catalog,context}),null,2));}
  else{
   if(!opts['--id'])throw Error('--id is required');
   const options={root,catalog,context,id:opts['--id'],network:opts['--network']==='allow'&&!opts['--offline'],approve:opts['--approve']};
   console.log(JSON.stringify(opts['--apply']?await applyPlan(options):await makePlan(options),null,2));
  }
 }catch(e){console.error('engine-skills: '+e.message);process.exitCode=1;}
}
