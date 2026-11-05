import {existsSync,readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {skillTargets,skillSources} from './skills-generation.mjs';
import {baseline} from './baseline.mjs';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++){if(['--check','--reconcile','--verify-pending','--complete'].includes(args[i]))continue;if(['--root','--family','--names','--targets'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--')){i++;continue}throw Error(`Unknown or incomplete argument: ${args[i]}`)}
const val=k=>{let i=args.indexOf(k);return i<0?null:args[i+1]};const root=path.resolve(val('--root')||here), family=val('--family')||'skills', names=val('--names')?.split(',').filter(Boolean), check=args.includes('--check');
const reconcile=args.includes('--reconcile'), verifyPending=args.includes('--verify-pending'), active=baseline(root,{allowPending:reconcile||verifyPending});
const complete=args.includes('--complete');if(complete&&!check)throw Error('--complete requires --check');
if(verifyPending&&(reconcile||!check||active.state!=='pending'))throw Error('--verify-pending is read-only and requires a pending baseline');
if(reconcile&&(active.state!=='pending'||check||!val('--targets')))throw Error('Reconcile requires pending baseline, selected --targets and no --check');
if(!reconcile&&val('--targets'))throw Error('--targets requires --reconcile');
let reviewed=null;
if(reconcile){const bytes=readFileSync(path.join(root,active.plan));if(createHash('sha256').update(bytes).digest('hex')!==active.plan_sha256)throw Error('Reconciliation plan changed');reviewed=JSON.parse(bytes);if(reviewed.new_sha!==active.source_commit)throw Error('Reconciliation plan SHA mismatch')}
if(!['skills','references','support','roles','rules'].includes(family))throw Error(`Unsupported family ${family}`);
if(!['skills','roles'].includes(family) && names)throw Error('--names is supported for skills and roles only');
if(['references','support'].includes(family) && root!==here)throw Error('Reference and support plans require repository root');
if(names && new Set(names).size!==names.length)throw Error('Duplicate skill selection');
if(['skills','roles'].includes(family) && !check && !names)throw Error('Specify --names for skill/role generation; bulk generation requires an explicit selection');
const file=path.join(root,'docs/codex/generation-manifest.json'), hash=b=>createHash('sha256').update(b).digest('hex');
const registry=existsSync(file)?JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{schema:1,source_commit:active.source_commit,entries:[]};
if(registry.schema!==1 || registry.source_commit!==active.source_commit||!Array.isArray(registry.entries))throw Error('Invalid generation registry');
const sources=skillSources(root), sourceByPath=new Map(sources.map(s=>[s.path,s]));
const inventory=JSON.parse(readFileSync(path.join(root,'docs/codex/upstream-inventory.json'),'utf8').replace(/^\uFEFF/,''));
const inventoryByPath=new Map(inventory.files.map(x=>[x.path,x]));
const sourceHash=b=>hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
let candidates;
if(family==='skills') candidates=skillTargets(root,names);
else {
 const modules={references:'./reference-generation.mjs',support:'./support-generation.mjs',roles:'./roles-generation.mjs',rules:'./rules-generation.mjs'};
 const mod=await import(modules[family]);
 const raw=await (family==='references'?mod.referenceTargets():family==='support'?mod.supportTargets():family==='roles'?mod.roleTargets(root,names):mod.ruleTargets(root));
 if(family==='rules'){const index=mod.ruleIndex(root);raw.push({source:'@derived/rules-index',sources:index.rules.map(r=>r.source),target:'.agents/rules/index.json',content:JSON.stringify(index,null,2)+'\n',transform_ids:['rule-scope-index-v1'],owner:'CGS-23'})}
 candidates=raw.map(p=>{const inputs=p.sources||[p.source];for(const input of inputs){const source=inventoryByPath.get(input),bytes=readFileSync(path.join(root,input));if(!source||sourceHash(bytes)!==source.sha256)throw Error(`Source drift or unregistered source: ${input}`)}const source_sha256=p.sources?hash(Buffer.from(JSON.stringify(inputs.map(s=>[s,inventoryByPath.get(s).sha256])))):inventoryByPath.get(p.source).sha256;return {...p,source_sha256,content:Buffer.from(p.content),ownership:'generated'}})
}
const existing=new Map(registry.entries.map(e=>[e.target,e])); if(existing.size!==registry.entries.length)throw Error('Duplicate registered target');
if(complete){const missing=candidates.find(p=>!existing.has(p.target));if(missing)throw Error('Missing registered candidate target: '+missing.target)}
function checkTarget(e){let b;try{b=readFileSync(path.join(root,e.target))}catch{throw Error(`Missing registered target: ${e.target}`)}if(hash(b)!==e.target_sha256)throw Error(`Manual target drift: ${e.target}`);const inputs=e.sources||[e.source];for(const input of inputs){const expected=inventoryByPath.get(input)?.sha256;if(!expected||sourceHash(readFileSync(path.join(root,input)))!==expected)throw Error(`Registered source drift: ${input}`)}const expected=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(s=>[s,inventoryByPath.get(s).sha256])))):inventoryByPath.get(e.source).sha256;const old=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(s=>[s,reviewed?.changes.find(c=>c.source===s)?.old_sha256||inventoryByPath.get(s).sha256])))):reviewed?.changes.find(c=>c.source===e.source)?.old_sha256;if(expected!==e.source_sha256&&(!reconcile||old!==e.source_sha256))throw Error(`Registered source drift: ${e.source}`)}
for(const e of registry.entries) checkTarget(e);
function walk(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)])}
for(const p of walk(path.join(root,'.agents/skills'))){const rel=path.relative(root,p).split(path.sep).join('/');if(!existing.has(rel)) throw Error(`Unregistered skill target: ${rel}`)}
const plans=[];
const selected=reconcile?val('--targets').split(','):null;
if(selected&&(new Set(selected).size!==selected.length||selected.some(t=>!reviewed.changes.some(c=>c.targets.some(x=>x.target===t)))))throw Error('Unreviewed reconciliation target selection');
if(selected)for(const c of reviewed.changes.filter(c=>c.targets.some(t=>selected.includes(t.target))))if(c.overlay&&hash(readFileSync(path.join(root,c.overlay.path)))!==c.overlay.sha256)throw Error('Reviewed overlay drift: '+c.source);
for(const p of candidates){if(selected&&!selected.includes(p.target))continue;const old=existing.get(p.target), target=path.join(root,p.target);if(!old&&existsSync(target) && !(family!=='skills' && hash(readFileSync(target))===hash(p.content)))throw Error(`Refusing unregistered target: ${p.target}`);if(old&&old.ownership!=='generated')throw Error(`Manual target cannot be generated: ${p.target}`);if(reconcile&&!old)throw Error('New targets require explicit onboarding: '+p.target);if(old && hash(p.content)!==old.target_sha256) {if(check) throw Error(`Generated output drift: ${p.target}`)}
 if(old || !check)plans.push(p);
}
if(selected&&plans.length!==selected.length)throw Error('Selected reconciliation target missing from family plan');
if(check){
 for(const p of plans){const text=p.content.toString('utf8');if(p.target.endsWith('/SKILL.md')){const fm=/^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n/.exec(text);if(!fm||fm[1]!==p.target.split('/')[2])throw Error(`Invalid native frontmatter: ${p.target}`);if(/!`|\bCLAUDE_[A-Z_]+\b|\bAskUserQuestion\b|^model:/m.test(text))throw Error(`Untranslated runtime construct: ${p.target}`)}}
 console.log(`${verifyPending?'PENDING verification only':'PASS'}: ${sources.filter(s=>s.path.endsWith('/SKILL.md')).length} source skills accounted; ${registry.entries.filter(e=>e.source.startsWith('.claude/skills/')).length} generated skill files registered; migration status is checked separately`);
}else{
 for(const p of plans){const target=path.join(root,p.target);mkdirSync(path.dirname(target),{recursive:true});if(!existsSync(target)||hash(readFileSync(target))!==hash(p.content))writeFileSync(target,p.content);const entry={id:`file:${p.source}=>${p.target}`,source:p.source,...(p.sources?{sources:p.sources}:{}),source_sha256:p.source_sha256,target:p.target,target_sha256:hash(p.content),transform_version:1,transform_ids:p.transform_ids,owner:p.owner,ownership:p.ownership};existing.set(p.target,entry)}
 registry.entries=[...existing.values()].sort((a,b)=>a.target.localeCompare(b.target));mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(registry,null,2)+'\n');console.log(`Generated ${plans.length} guarded files; generated files do not establish migration status`);
}
