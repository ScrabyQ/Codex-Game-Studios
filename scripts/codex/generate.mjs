import {existsSync,readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {skillTargets,skillSources} from './skills-generation.mjs';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2);
for(let i=0;i<args.length;i++){if(args[i]==='--check')continue;if(['--root','--family','--names'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--')){i++;continue}throw Error(`Unknown or incomplete argument: ${args[i]}`)}
const val=k=>{let i=args.indexOf(k);return i<0?null:args[i+1]};const root=path.resolve(val('--root')||here), family=val('--family')||'skills', names=val('--names')?.split(',').filter(Boolean), check=args.includes('--check');
if(!['skills','references','support'].includes(family))throw Error(`Unsupported family ${family}`);
if(family!=='skills' && names)throw Error('--names is supported for skills only');
if(family!=='skills' && root!==here)throw Error('Reference and support plans require repository root');
if(names && new Set(names).size!==names.length)throw Error('Duplicate skill selection');
if(family==='skills' && !check && !names)throw Error('Specify --names for skill generation; bulk generation requires an explicit selection');
const file=path.join(root,'docs/codex/generation-manifest.json'), hash=b=>createHash('sha256').update(b).digest('hex');
const registry=existsSync(file)?JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{schema:1,source_commit:'05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418',entries:[]};
if(registry.schema!==1 || registry.source_commit!=='05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418'||!Array.isArray(registry.entries))throw Error('Invalid generation registry');
const sources=skillSources(root), sourceByPath=new Map(sources.map(s=>[s.path,s]));
const inventory=JSON.parse(readFileSync(path.join(root,'docs/codex/upstream-inventory.json'),'utf8').replace(/^\uFEFF/,''));
const inventoryByPath=new Map(inventory.files.map(x=>[x.path,x]));
const sourceHash=b=>hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')));
let candidates;
if(family==='skills') candidates=skillTargets(root,names);
else {const mod=await import(family==='references'?'./reference-generation.mjs':'./support-generation.mjs'); const raw=await (family==='references'?mod.referenceTargets():mod.supportTargets()); candidates=raw.map(p=>{const source=inventoryByPath.get(p.source), bytes=readFileSync(path.join(root,p.source));if(!source||sourceHash(bytes)!==source.sha256)throw Error(`Source drift or unregistered source: ${p.source}`);return {...p,source_sha256:source.sha256,content:Buffer.from(p.content),ownership:'generated'}})}
const existing=new Map(registry.entries.map(e=>[e.target,e])); if(existing.size!==registry.entries.length)throw Error('Duplicate registered target');
function checkTarget(e){let b;try{b=readFileSync(path.join(root,e.target))}catch{throw Error(`Missing registered target: ${e.target}`)}if(hash(b)!==e.target_sha256)throw Error(`Manual target drift: ${e.target}`);if(inventoryByPath.get(e.source)?.sha256!==e.source_sha256 || sourceHash(readFileSync(path.join(root,e.source)))!==e.source_sha256)throw Error(`Registered source drift: ${e.source}`)}
for(const e of registry.entries) checkTarget(e);
function walk(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)])}
for(const p of walk(path.join(root,'.agents/skills'))){const rel=path.relative(root,p).split(path.sep).join('/');if(!existing.has(rel)) throw Error(`Unregistered skill target: ${rel}`)}
const plans=[];
for(const p of candidates){const old=existing.get(p.target), target=path.join(root,p.target);if(!old&&existsSync(target) && !(family!=='skills' && hash(readFileSync(target))===hash(p.content)))throw Error(`Refusing unregistered target: ${p.target}`);if(old&&old.ownership!=='generated')throw Error(`Manual target cannot be generated: ${p.target}`);if(old && hash(p.content)!==old.target_sha256) {if(check) throw Error(`Generated output drift: ${p.target}`)}
 if(old || !check)plans.push(p);
}
if(check){
 for(const p of plans){const text=p.content.toString('utf8');if(p.target.endsWith('/SKILL.md')){const fm=/^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n/.exec(text);if(!fm||fm[1]!==p.target.split('/')[2])throw Error(`Invalid native frontmatter: ${p.target}`);if(/!`|\bCLAUDE_[A-Z_]+\b|\bAskUserQuestion\b|^model:/m.test(text))throw Error(`Untranslated runtime construct: ${p.target}`)}}
 console.log(`PASS: ${sources.filter(s=>s.path.endsWith('/SKILL.md')).length} source skills accounted; ${registry.entries.filter(e=>e.source.startsWith('.claude/skills/')).length} generated skill files registered; migration status is checked separately`);
}else{
 for(const p of plans){mkdirSync(path.dirname(path.join(root,p.target)),{recursive:true});if(family==='skills')writeFileSync(path.join(root,p.target),p.content);else if(!existsSync(path.join(root,p.target))||hash(readFileSync(path.join(root,p.target)))!==hash(p.content))throw Error(`External owner target missing or divergent: ${p.target}`);const entry={id:`file:${p.source}=>${p.target}`,source:p.source,source_sha256:p.source_sha256,target:p.target,target_sha256:hash(p.content),transform_version:1,transform_ids:p.transform_ids,owner:p.owner,ownership:p.ownership};existing.set(p.target,entry)}
 registry.entries=[...existing.values()].sort((a,b)=>a.target.localeCompare(b.target));mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(registry,null,2)+'\n');console.log(`Generated ${plans.length} guarded files; generated files do not establish migration status`);
}
