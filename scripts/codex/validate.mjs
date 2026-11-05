import {readFileSync,existsSync,readdirSync,realpathSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {baseline} from './baseline.mjs';
const here=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'), args=process.argv.slice(2);
const opts=new Map();for(let i=0;i<args.length;i++){const k=args[i];if(opts.has(k)||!['--root','--verify-pending'].includes(k))throw Error('Usage: validate.mjs [--root PATH] [--verify-pending]');if(k==='--root'){if(!args[i+1]||args[i+1].startsWith('--'))throw Error('Missing --root');opts.set(k,args[++i])}else opts.set(k,true)}
const root=path.resolve(opts.get('--root') || here), read=p=>readFileSync(path.join(root,p)), json=p=>JSON.parse(read(p).toString('utf8').replace(/^\uFEFF/,''));
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
for(const e of migration.entries){if(!migration.statuses.includes(e.status)||!e.verification||!e.purpose)fail('Invalid migration entry: '+e.id)}
for(const e of reg.entries){safe(e.target);if(e.ownership!=='generated'||!Array.isArray(e.transform_ids))fail('Invalid generated entry: '+e.target);if(hash(read(e.target))!==e.target_sha256)fail('Target drift: '+e.target);const inputs=e.sources||[e.source];for(const p of inputs){const src=inventory.get(safe(p));if(!src)fail('Unknown registered source: '+p);const b=read(p);if(hash(b)!==src.sha256&&hash(Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')))!==src.sha256)fail('Source drift: '+p)}const expected=e.sources?hash(Buffer.from(JSON.stringify(inputs.map(p=>[p,inventory.get(p).sha256])))):inventory.get(e.source).sha256;if(e.source_sha256!==expected)fail('Registry source hash mismatch: '+e.target)}
for(const e of migration.entries){const mapped=[...(e.target_sha256?[{target:e.target,sha256:e.target_sha256}]:[]),...(e.related_targets||[])];for(const t of mapped){safe(t.target);if(!/^[a-f0-9]{64}$/.test(t.sha256||'')||hash(read(t.target))!==t.sha256)fail('Stale recorded migration target: '+e.id+': '+t.target);const registered=reg.entries.find(x=>x.target===t.target);if(registered&&registered.target_sha256!==t.sha256)fail('Migration/registry target mismatch: '+e.id)}}
const walk=d=>existsSync(d)?readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
const tracked=new Set(reg.entries.map(e=>e.target));
for(const p of walk(path.join(root,'.agents/skills'))){const rel=path.relative(root,p).split(path.sep).join('/');if(!tracked.has(rel))fail('Unregistered skill target: '+rel)}
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
if(rows.length!==(inv.counts.agent||0)+(inv.counts.skill||0))fail('Catalog entry count: '+rows.length);unique(rows.map(x=>x[1]),'catalog names');unique(rows.map(x=>x[2]),'catalog spec paths');
for(const [,name,p] of rows)if(!existsSync(path.join(root,safe(p))))fail('Missing catalog spec: '+name+': '+p);
console.log((opts.has('--verify-pending')?'PENDING structural verification: ':'PASS manifests: ')+JSON.stringify({roles:inv.counts.agent,skills:inv.counts.skill,hooks:inv.hooks.length,rules:inv.counts.rule,templates:inv.counts['user-template'],targets:reg.entries.length,catalog:rows.length}));
console.log('Structural observations do not establish behavior or unrun engine tests.');
