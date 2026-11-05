import {readFileSync,existsSync,readdirSync,realpathSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {baseline} from './baseline.mjs';
import {safeProjectPath,readManualTarget} from './safe-path.mjs';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'), args=process.argv.slice(2);
const opts=new Map();for(let i=0;i<args.length;i++){const k=args[i];if(opts.has(k)||!['--root','--verify-pending'].includes(k))throw Error('Usage: validate.mjs [--root PATH] [--verify-pending]');if(k==='--root'){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing --root');opts.set(k,args[++i])}else opts.set(k,true)}
const root=realpathSync(path.resolve(opts.get('--root') || here)), read=p=>readFileSync(safeProjectPath(root,p)), json=p=>JSON.parse(read(p).toString('utf8').replace(/^\uFEFF/,''));
const hash=b=>createHash('sha256').update(b).digest('hex'), fail=s=>{throw Error(s)};
const safe=p=>{if(typeof p!=='string'||!p||path.posix.isAbsolute(p)||p.includes('\\')||p.split('/').includes('..')) fail('Unsafe path: '+p);return p};
const unique=(xs,label)=>{if(new Set(xs).size!==xs.length)fail('Duplicate '+label)};
const inv=json('docs/codex/upstream-inventory.json'), migration=json('docs/codex/migration-manifest.json'), reg=json('docs/codex/generation-manifest.json');
const active=baseline(root,{allowPending:opts.has('--verify-pending')});if(opts.has('--verify-pending')&&active.state!=='pending')fail('--verify-pending requires pending baseline');if(inv.source_commit!==active.source_commit)fail('Inventory and active baseline mismatch');
if([inv,migration,reg].some(x=>x.schema!==1)||!inv.source_commit||[migration,reg].some(x=>x.source_commit!==inv.source_commit))fail('Manifest schema or source mismatch');
if(!Array.isArray(inv.files)||!Array.isArray(inv.hooks)||!Array.isArray(migration.entries)||!Array.isArray(reg.entries))fail('Invalid manifest arrays');
if(JSON.stringify(migration.statuses)!==JSON.stringify(['PENDING','PORTED','EQUIVALENT','UNSUPPORTED']))fail('Invalid migration status schema');
unique(inv.files.map(e=>e.path),'inventory paths');unique(migration.entries.map(e=>e.id),'migration IDs');unique(reg.entries.map(e=>e.target),'generated targets');
const inventory=new Map(inv.files.map(e=>[safe(e.path),e]));
for(const [category,count] of Object.entries(inv.counts))if(inv.files.filter(e=>e.category===category).length!==count)fail('Inventory count: '+category);
if(migration.entries.filter(e=>e.category==='hook-declaration').length!==inv.hooks.length)fail('Hook declaration count');
for(const f of inv.files){const e=migration.entries.find(x=>x.id==='file:'+f.path);if(!e||e.source!==f.path||e.source_sha256!==f.sha256||e.category!==f.category)fail('Migration inventory mismatch: '+f.path)}
const expectedIds=[...inv.files.map(f=>'file:'+f.path),...inv.hooks.map(h=>h.id)];unique(expectedIds,'inventory entry IDs');
if(JSON.stringify(migration.entries.map(e=>e.id).sort())!==JSON.stringify(expectedIds.sort()))fail('Migration entry IDs do not match inventory');
for(const h of inv.hooks){const e=migration.entries.find(x=>x.id===h.id),settings=inventory.get('.claude/settings.json');if(!e||e.category!=='hook-declaration'||e.source!==`.claude/settings.json#${h.id}`||e.source_sha256!==settings?.sha256)fail('Hook declaration mismatch: '+h.id)}
for(const e of migration.entries){if(!migration.statuses.includes(e.status)||!e.verification||!e.purpose)fail('Invalid migration entry: '+e.id);if(e.status==='PENDING'&&!opts.has('--verify-pending'))fail('Pending support disposition: '+e.id);if(['PORTED','EQUIVALENT'].includes(e.status)){const p=e.target&&safeProjectPath(root,e.target);if(!p||!existsSync(p)||!statSync(p).isFile())fail('Accepted support lacks target mapping: '+e.id)}}
for(const e of reg.entries){safe(e.target);if(!['generated','native'].includes(e.ownership)||!Array.isArray(e.transform_ids))fail('Invalid generated entry: '+e.target);if(hash(read(e.target))!==e.target_sha256)fail('Target drift: '+e.target);if(e.ownership==='native'){const authored=typeof e.authored_provenance?.review==='string'&&!!e.authored_provenance.review.trim();if(Boolean(e.retired_provenance)===authored||e.source||e.sources||e.source_sha256)fail('Invalid native provenance: '+e.target);continue}const inputs=e.sources||[e.source];for(const p of inputs)if(!inventory.has(safe(p)))fail('Unknown registered source: '+p);const expected=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(p=>[p,inventory.get(p).sha256])))):inventory.get(e.source).sha256;if(e.source_sha256!==expected)fail('Registry source hash mismatch: '+e.target)}
for(const e of migration.entries){const mapped=[...(e.target_sha256?[{target:e.target,sha256:e.target_sha256}]:[]),...(e.related_targets||[])];for(const t of mapped){safe(t.target);if(!/^[a-f0-9]{64}$/.test(t.sha256||'')||hash(read(t.target))!==t.sha256)fail('Stale recorded migration target: '+e.id+': '+t.target);const registered=reg.entries.find(x=>x.target===t.target);if(registered&&registered.target_sha256!==t.sha256)fail('Migration/registry target mismatch: '+e.id)}}
const retired=migration.retired_manual_mappings||[];if(!Array.isArray(retired))fail('Invalid retired manual mappings');
unique(retired.map(e=>`${e.source_commit}\0${e.source}\0${e.target}`),'retired manual mappings');
for(const e of retired){if(!e||e.decision!=='retained'||!/^[a-f0-9]{40}$/.test(e.source_commit||'')||!/^[a-f0-9]{64}$/.test(e.source_sha256||'')||!/^[a-f0-9]{64}$/.test(e.target_sha256||''))fail('Invalid retired manual provenance');safe(e.source);if(hash(readManualTarget(root,e.target))!==e.target_sha256)fail('Retired manual target drift: '+e.target)}
const walk=d=>existsSync(d)?readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const tracked=new Set(reg.entries.map(e=>e.target));
let external={targets:[],states:[]};
if(existsSync(safeProjectPath(root,'.codex/external-engine-skills.json'))){
 const {inspectInstalled}=await import('./engine-skills.mjs');
 external=inspectInstalled(root,{nativeTargets:tracked,strict:true});
}
const skillTargets=new Set([...tracked,...external.targets]);
for(const p of walk(path.join(root,'.agents/skills'))){const rel=path.relative(root,p).split(path.sep).join('/');if(!skillTargets.has(rel))fail('Unregistered skill target: '+rel)}
for(const p of walk(path.join(root,'.codex/agents'))){const rel=path.relative(root,p).split(path.sep).join('/');if(!tracked.has(rel))fail('Unregistered role target: '+rel)}
const nativeSkillNames=reg.entries.filter(e=>/^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(e.target)).map(e=>e.target.split('/')[2]).sort();
const nativeRoleNames=reg.entries.filter(e=>/^\.codex\/agents\/[^/]+\.toml$/.test(e.target)).map(e=>path.posix.basename(e.target,'.toml')).sort();
const policy=json('.codex/model-policy.json');
for(const [label,names] of [['skills',nativeSkillNames],['roles',nativeRoleNames]]){
 if(JSON.stringify(Object.keys(policy[label]||{}).sort())!==JSON.stringify(names))fail('Model policy '+label+' coverage mismatch');
 for(const name of names){const family=policy[label][name]?.family;if(family!=='inherit'&&!policy.families?.[family])fail('Unknown model family: '+name)}
}
const ruleIndex=json('.agents/rules/index.json');
if(ruleIndex.schema!==1||!Array.isArray(ruleIndex.rules))fail('Invalid rule index');
unique(ruleIndex.rules.map(r=>r.id),'rule IDs');unique(ruleIndex.rules.map(r=>r.target),'rule targets');
for(const rule of ruleIndex.rules)if(!tracked.has(safe(rule.target))||!Array.isArray(rule.patterns)||!rule.patterns.length||rule.patterns.some(p=>typeof p!=='string'||!p||p.startsWith('/')||p.includes('\\')||p.split('/').includes('..')))fail('Invalid rule scope or target: '+rule.id);
for(const e of reg.entries.filter(e=>/^\.agents\/rules\/[^/]+\.md$/.test(e.target)))if(!ruleIndex.rules.some(r=>r.target===e.target))fail('Unindexed rule: '+e.target);
for(const e of reg.entries.filter(e=>/^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(e.target))){
 const t=read(e.target).toString('utf8');let fence=false;
 for(const line of t.split(/\r?\n/)){if(/^\s*(```|~~~)/.test(line)){fence=!fence;continue}if(fence)continue;
  for(const ref of line.matchAll(/\]\(([^)\s]+)(?:\s+[^)]*)?\)/g)){const name=ref[1].split('#')[0];if(!name||/^(?:[a-z][a-z0-9+.-]*:|\/|#|<)/i.test(name)||/[{}*<>$]/.test(name))continue;
   const p=path.resolve(path.dirname(path.join(root,e.target)),name),inside=x=>{const rel=path.relative(realpathSync(root),x);return rel!== '..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel)};
   if(!inside(p))fail('Skill reference escapes project: '+e.target+': '+name);
   if(!existsSync(p))fail('Missing relative skill reference: '+e.target+': '+name);
   if(!inside(realpathSync(p)))fail('Skill reference escapes project: '+e.target+': '+name);
  }
 }
}
for(const kind of ['skill','role']){const r=spawnSync(process.execPath,[path.join(here,'scripts/codex/native-helper-check.mjs'),kind,...(kind==='skill'?['all']:[]),'--root',root],{encoding:'utf8'});if(r.error||r.status!==0)fail('Invalid native '+kind+' format: '+(r.error?.message||r.stdout||r.stderr))}
const catalog=read('studio-tests/catalog.yaml').toString('utf8'),rows=[...catalog.matchAll(/^  - name: (\S+)\r?\n    spec: (\S+)/gm)];
const nativeSkills=reg.entries.filter(e=>/^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(e.target)).length;
const nativeRoles=reg.entries.filter(e=>/^\.codex\/agents\/[^/]+\.toml$/.test(e.target)).length;
if(rows.length!==nativeRoles+nativeSkills)fail('Catalog entry count: '+rows.length);unique(rows.map(x=>x[1]),'catalog names');unique(rows.map(x=>x[2]),'catalog spec paths');
if(JSON.stringify(rows.map(x=>x[1]).sort())!==JSON.stringify([...nativeSkillNames,...nativeRoleNames].sort()))fail('Catalog names do not match native components');
for(const [,name,p] of rows)if(!existsSync(path.join(root,safe(p))))fail('Missing catalog spec: '+name+': '+p);
console.log((opts.has('--verify-pending')?'PENDING structural verification: ':'PASS manifests: ')+JSON.stringify({roles:nativeRoleNames.length,skills:nativeSkillNames.length,source_hooks:inv.hooks.length,rules:ruleIndex.rules.length,targets:reg.entries.length,catalog:rows.length}));
console.log('Structural observations do not establish behavior or unrun engine tests.');
if(external.states.length)console.log('External documentation Skills: '+external.states.length+'; separate provenance and hashes checked; no behavior or permission grant established.');
