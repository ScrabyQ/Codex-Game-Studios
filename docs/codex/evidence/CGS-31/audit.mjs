import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),out=path.resolve('docs/codex/evidence/CGS-31'),clone=path.resolve(process.env.CGS31_CHECKOUT||'.codex-tmp/cgs31-independent-20261105'),prefix=process.env.CGS31_RECEIPT_PREFIX||'';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function hook(event,payload){const r=spawnSync(process.execPath,['scripts/codex/hooks.mjs',event,'--root',root],{cwd:root,input:JSON.stringify(payload),encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(event+': '+r.stderr+r.stdout);}
function put(name,data){const file=path.join(out,prefix+name),body=typeof data==='string'?data:JSON.stringify(data,null,2)+'\n';if(!file.startsWith(out+path.sep))throw Error('scope');hook('PreToolUse',{tool_name:'Write',tool_input:{file_path:file,content:body}});fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,body);hook('PostToolUse',{tool_name:'Write',tool_input:{file_path:file}});}
function run(name,exe,args,cwd=clone,timeout=240000,input){hook('PreToolUse',{tool_name:'PowerShell',tool_input:{command:[exe,...args].join(' ')}});const started=new Date().toISOString(),r=spawnSync(exe,args,{cwd,input,encoding:'utf8',windowsHide:true,timeout,maxBuffer:30*1024*1024});const result={name,exe,args,cwd,started,finished:new Date().toISOString(),exit:r.status,error:r.error?.message||null,stdout:r.stdout||'',stderr:r.stderr||''};put(name+'.json',result);console.log(name+': exit '+r.status);return result;}
function git(...args){const r=spawnSync('git',args,{cwd:clone,encoding:null,maxBuffer:30*1024*1024});if(r.status!==0)throw Error(r.stderr?.toString());return r.stdout;}
const mode=process.argv[2];
if(mode==='ci'||mode==='quick'){run('quick-ci','node',['scripts/codex/ci.mjs']);if(mode==='ci')run('backend-ci','node',['scripts/codex/backend-tests.mjs','--disposable-checkout']);}
else if(mode==='inventory'){
 const inv=json(path.join(clone,'docs/codex/upstream-inventory.json')),m=json(path.join(clone,'docs/codex/migration-manifest.json')),g=json(path.join(clone,'docs/codex/generation-manifest.json'));
 const tree=git('ls-tree','-r','--name-only',inv.source_commit).toString().trim().split('\n');
 const baseline=inv.files.map(f=>({path:f.path,expected:f.sha256,actual:sha(git('show',inv.source_commit+':'+f.path)),mapped:m.entries.some(e=>e.source===f.path)}));
 const current=baseline.map(f=>({path:f.path,source:f.actual,current:sha(git('show','HEAD:'+f.path)),worktree_sha256:fs.existsSync(path.join(clone,f.path))?sha(fs.readFileSync(path.join(clone,f.path))):null}));
 const targets=g.entries.map(e=>({path:e.target,expected:e.target_sha256,actual:fs.existsSync(path.join(clone,e.target))?sha(fs.readFileSync(path.join(clone,e.target))):null}));
 const evidence=[...new Set(m.entries.flatMap(e=>e.evidence||[]))].map(p=>({path:p,exists:fs.existsSync(path.join(clone,p))}));
 const status=Object.fromEntries(m.statuses.map(s=>[s,m.entries.filter(e=>e.status===s).length]));
 put('inventory.json',{head:git('rev-parse','HEAD').toString().trim(),source:inv.source_commit,tree_files:tree.length,inventory_files:inv.files.length,declarations:inv.hooks.length,migration_rows:m.entries.length,counts:inv.counts,generation_targets:g.entries.length,baseline_errors:baseline.filter(f=>f.expected!==f.actual||!f.mapped),unaccounted_tree:tree.filter(p=>!baseline.some(f=>f.path===p)),changed_originals:current.filter(f=>f.source!==f.current),target_errors:targets.filter(f=>f.expected!==f.actual),missing_evidence:evidence.filter(e=>!e.exists),status,unsupported:m.entries.filter(e=>e.status==='UNSUPPORTED'),history:{ancestor_exit:spawnSync('git',['merge-base','--is-ancestor',inv.source_commit,'HEAD'],{cwd:clone}).status,adaptation_authors:[...new Set(git('log',inv.source_commit+'..HEAD','--format=%an <%ae> | %cn <%ce>').toString().trim().split('\n'))]},license:{baseline:sha(git('show',inv.source_commit+':LICENSE')),current:sha(fs.readFileSync(path.join(clone,'LICENSE')))},readme_attribution:fs.readFileSync(path.join(clone,'README.md'),'utf8').split('\n').slice(0,3)});
}
else if(mode==='sync'){
 if(!git('remote').toString().split(/\r?\n/).includes('upstream'))run('upstream-add','git',['remote','add','upstream','https://github.com/Donchitos/Claude-Code-Game-Studios.git']);
 run('upstream-disable-push','git',['remote','set-url','--push','upstream','DISABLED']);
 run('actual-fetch','git',['fetch','upstream']);
 run('actual-upstream-check','node',['scripts/codex/check-upstream.mjs']);
 run('actual-sync-dry-run','node',['scripts/codex/sync-upstream.mjs','--dry-run']);
 run('upstream-denied-dry-push','node',['scripts/codex/hooks.mjs','PreToolUse','--root','.'],clone,60000,JSON.stringify({tool_name:'PowerShell',tool_input:{command:'git push --dry-run upstream HEAD:refs/heads/codex/cgs31-audit'}}));
}
else throw Error('Usage: audit.mjs ci|inventory|sync');
