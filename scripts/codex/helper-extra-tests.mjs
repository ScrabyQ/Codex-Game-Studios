import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';import {deflateSync} from 'node:zlib';
import {bashPath} from './shell.mjs';
function pngChunk(name,data){const type=Buffer.from(name);let crc=0xffffffff;for(const b of Buffer.concat([type,data])){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}const len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([len,type,data,sum]);}
function fixturePng(){const h=Buffer.alloc(13);h.writeUInt32BE(2,0);h.writeUInt32BE(2,4);h[8]=8;h[9]=6;return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),pngChunk('IHDR',h),pngChunk('IDAT',deflateSync(Buffer.alloc(18))),pngChunk('IEND',Buffer.alloc(0))]);}
const repo=process.cwd();fs.mkdirSync(path.join(repo,'.scratch'),{recursive:true});const dir=fs.mkdtempSync(path.join(repo,'.scratch','cgs28-extra-')),bash=bashPath();
const write=(p,s)=>{const f=path.join(dir,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s)};
for(const d of ['scripts','hooks'])for(const n of fs.readdirSync(path.join(repo,'.agents',d))){const p=path.join(repo,'.agents',d,n);if(fs.statSync(p).isFile())write('.agents/'+d+'/'+n,fs.readFileSync(p))}
write('.agents/framework-version',fs.readFileSync(path.join(repo,'.agents/framework-version')));
write('project.yaml','engine:\n  name: godot\n  version: 4.4.0\nupdates:\n  check: false\n');write('design/gdd/combat.md','# Combat\n\n## Overview\nA game system.\n\n## Edge Cases\n[To be designed]\n');write('docs/architecture/adr-0001-first.md','# ADR 1\n\n## ADR Dependencies\n| Depends On | None |\n');write('src/example.gd','# TODO improve\nextends Node\nfunc run():\n  print("hello")\n');write('design/full.md','# Full\n\nText\n\n## Empty\n\n## Draft\n[TBD]\n');write('design/empty.md','\n');write('test-results/one.log','alpha PASSED\nbeta FAILED\n');write('test-results/two.log','alpha FAILED\nbeta FAILED\n');write('assets/art/sample.png',fixturePng());write('production/session-state/active.md','<!-- CHECKPOINT -->\nStage: design\n<!-- /CHECKPOINT -->\n\n## Notes\n'+Array.from({length:35},(_,i)=>'Fixture narrative '+i).join('\n')+'\n');write('production/stage.txt','Production\n');write('.codex/agents/sample.toml','name = "sample"\ndeveloper_instructions = "AskUserQuestion .agents/skills/example\\nsecond"\n');
const specs=[
['adr-dep-graph','scripts','adr-dep-graph.sh',['docs/architecture'],/ADRS:\s*1/],
['asset-scan','scripts','asset-scan.sh',['--root',dir,'--engine','godot','--files','--max-dim','1'],/DIM\s+assets\/art\/sample\.png\s+2x2\s+1/],
['code-markers','scripts','code-markers.sh',['--root',dir,'src'],/TODO/],
['compat-inventory','scripts','compat-inventory.sh',['--agent','sample',dir],/agents=1[\s\S]*NOTE: Native TOML[\s\S]*COUNT: questions AskUserQuestion files=1 hits=1/],
['compat-inventory-missing','scripts','compat-inventory.sh',['--agent','missing',dir],/NOT FOUND/],
['content-count','scripts','content-count.sh',['--root',dir,'band','1','2'],/50/],
['debt-register','scripts','debt-register.sh',['--root',dir,'score','High','M'],/1\.5/],
['flaky-stats','scripts','flaky-stats.sh',['--root',dir,'--format','text','test-results/one.log','test-results/two.log'],/alpha/],
['gdd-structure-check','scripts','gdd-structure-check.sh',['design/gdd/combat.md'],/PLACEHOLDER/],
['inputs-check','scripts','inputs-check.sh',['--root',dir,'design/full.md','design/empty.md','design/missing.md'],/FOUND[\s\S]*EMPTY[\s\S]*ABSENT/],
['md-section','scripts','md-section.sh',['status','design/full.md'],/PLACEHOLDER/],
['migrate-v1-config','scripts','migrate-v1-config.sh',['--dry-run'],/split.brain|diverge|conflict|legacy/i],
['plan-math','scripts','plan-math.sh',['pct','1','4','--root',dir],/25/],
['project-coherence','scripts','project-coherence.sh',[],/NOT CHECKED|MATCH|DIFFERS/],
['review-scope','scripts','review-scope.sh',[],/PRIOR_REVIEW/],
['rotate-session-state','scripts','rotate-session-state.sh',['--dry-run'],/DRY RUN/],
['test-scaffold','scripts','test-scaffold.sh',['godot','--dry-run','--root',dir],/WOULD_CREATE/]
];
function snapshot(d,rel=''){const o={};for(const n of fs.readdirSync(path.join(d,rel))){const p=path.join(rel,n),a=fs.statSync(path.join(d,p));if(a.isDirectory())Object.assign(o,snapshot(d,p));else o[p]=crypto.createHash('sha256').update(fs.readFileSync(path.join(d,p))).digest('hex')}return o}
let rows=[];for(const [name,family,file,args,expected] of specs){const before=JSON.stringify(snapshot(dir));const target=path.join(dir,'.agents',family,file),r=spawnSync(bash,[target,...args],{cwd:dir,encoding:'utf8',env:{...process.env,CGS_PROJECT_DIR:dir,CI:'1',XDG_CACHE_HOME:path.join(dir,'cache'),GIT_CEILING_DIRECTORIES:path.dirname(dir)},timeout:30000});const output=(r.stdout||'')+(r.stderr||'');rows.push({source:'.claude/'+family+'/'+file,command:[bash,target,...args],cwd:dir,exit:r.status,error:r.error?.message||null,stdout:r.stdout,stderr:r.stderr,assertion:expected.toString(),fixture_unchanged:before===JSON.stringify(snapshot(dir)),expected_exit:name==='migrate-v1-config'?3:name==='compat-inventory-missing'?1:0,passed:r.status===(name==='migrate-v1-config'?3:name==='compat-inventory-missing'?1:0)&&expected.test(output)&&!/Traceback|SyntaxError|uncaught|Error:/.test(output)&&before===JSON.stringify(snapshot(dir))});console.log(name,'exit',r.status,'assert',rows.at(-1).passed)}
// Explicit write cases operate only under new nested disposable roots.
for(const [group,file] of [['scripts','migrate-v1-config.sh'],['scripts','rotate-session-state.sh']])for(const kind of ['migration-apply','rotation-apply'])write(kind+'/.agents/'+group+'/'+file,fs.readFileSync(path.join(dir,'.agents',group,file)));
write('migration-apply/production/stage.txt','Production\n');
write('rotation-apply/production/session-state/active.md','<!-- CHECKPOINT -->\nStage: design\n<!-- /CHECKPOINT -->\n\n## Notes\n'+Array.from({length:35},(_,i)=>'Fixture narrative '+i).join('\n')+'\n');
write('scaffold-apply/project.yaml','engine:\n  name: godot\n  version: 4.4.0\n');
for(const [name,script,args,cwd,check] of [
  ['migration-apply',path.join(dir,'migration-apply/.agents/scripts/migrate-v1-config.sh'),[],path.join(dir,'migration-apply'),()=>fs.existsSync(path.join(dir,'migration-apply/project.yaml'))&&fs.existsSync(path.join(dir,'migration-apply/production/stage.txt'))&&fs.existsSync(path.join(dir,'migration-apply/production/migration-report.md'))],
  ['rotation-apply',path.join(dir,'rotation-apply/.agents/scripts/rotate-session-state.sh'),[],path.join(dir,'rotation-apply'),()=>{const root=path.join(dir,'rotation-apply'),f=fs.readFileSync(path.join(root,'production/session-state/active.md'),'utf8'),logs=fs.readdirSync(path.join(root,'production/session-logs'));return f.includes('<!-- /CHECKPOINT -->')&&!f.includes('Fixture narrative 34')&&logs.some(n=>fs.readFileSync(path.join(root,'production/session-logs',n),'utf8').includes('Fixture narrative 34'))}],
  ['scaffold-apply',path.join(dir,'.agents/scripts/test-scaffold.sh'),['godot','--root',path.join(dir,'scaffold-apply')],path.join(dir,'scaffold-apply'),()=>fs.existsSync(path.join(dir,'scaffold-apply/tests/README.md'))&&fs.existsSync(path.join(dir,'scaffold-apply/tests/smoke/critical-paths.md'))]
]){const r=spawnSync(bash,[script,...args],{cwd,encoding:'utf8',env:{...process.env,CGS_PROJECT_DIR:cwd,CI:'1',GIT_CEILING_DIRECTORIES:path.dirname(dir)},timeout:30000});const output=(r.stdout||'')+(r.stderr||'');let assertion=false;try{assertion=check()}catch{}const passed=r.status===0&&assertion&&!/Traceback|SyntaxError|uncaught|Error:/.test(output);rows.push({source:name,command:[bash,script,...args],cwd,exit:r.status,error:r.error?.message||null,stdout:r.stdout,stderr:r.stderr,expected_exit:0,assertion:'actual fixture output files and preservation',passed});console.log(name,'exit',r.status,'assert',passed)}
if(rows.some(r=>!r.passed))process.exitCode=1;
