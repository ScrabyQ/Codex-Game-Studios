import {mkdtempSync,readFileSync,writeFileSync,copyFileSync,mkdirSync,readdirSync,readlinkSync} from 'node:fs';
import {spawnSync,execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {baseline} from '../baseline.mjs';
const root=process.cwd(),parent=mkdtempSync(path.join(tmpdir(),'cgs-reconcile-test-')),up=path.join(parent,'upstream'),work=path.join(parent,'work'),sha=baseline(root).source_commit;
function git(cwd,...args){return execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim()}
function checked(dir){assert.equal(path.resolve(git(dir,'rev-parse','--show-toplevel')),path.resolve(dir))}
function config(key,fallback){try{return git(root,'config','--get',key)||fallback}catch{return fallback}}
const identity=['-c','user.name='+config('user.name','CGS Fixture'),'-c','user.email='+config('user.email','fixture@example.invalid')];
git(root,'clone','--quiet','--no-hardlinks',root,up);git(root,'clone','--quiet','--no-hardlinks',root,work);checked(up);checked(work);
// Remove obsolete files only inside this disposable checkout of older history.
for(const p of git(work,'ls-files','--','docs/codex/evidence','docs/codex/fixtures/cgs27').split('\n').filter(Boolean)) { const fs=await import('node:fs'); fs.unlinkSync(path.join(work,p)); }
git(up,'switch','--detach',sha);
const sources=['.claude/skills/help/SKILL.md','.claude/hooks/session-start.sh','.claude/rules/ai-code.md'];
for(const p of sources)writeFileSync(path.join(up,p),readFileSync(path.join(up,p),'utf8')+'\n# CGS29 synthetic upstream change\n');
git(up,...identity,'commit','-am','synthetic upstream changes');
const next=git(up,'rev-parse','HEAD');git(work,'fetch','--quiet',up,next);
// Only alter the fixture Git index for deletion: leave the physical source intact.
git(up,'update-index','--force-remove',sources[1]);git(up,...identity,'commit','-m','synthetic source retirement');
const removed=git(up,'rev-parse','HEAD');git(up,'add',sources[1]);writeFileSync(path.join(up,'.claude/skills/help/added-fixture.md'),'Synthetic new source\n');git(up,'add','.claude/skills/help/added-fixture.md');git(up,...identity,'commit','-m','synthetic source addition');
const added=git(up,'rev-parse','HEAD');git(work,'fetch','--quiet',up,removed);git(work,'fetch','--quiet',up,added);
const newBytes=sources.map(p=>execFileSync('git',['show',next+':'+p],{cwd:work}));
for(const p of ['scripts/codex/upstream-tests.mjs','scripts/codex/upstream-common.mjs','scripts/codex/check-upstream.mjs','scripts/codex/sync-upstream.mjs']){mkdirSync(path.dirname(path.join(work,p)),{recursive:true});copyFileSync(path.join(root,p),path.join(work,p))}
for(const p of ['scripts/codex/baseline.mjs','scripts/codex/reconcile-upstream.mjs','scripts/codex/inventory.mjs','scripts/codex/generate.mjs','scripts/codex/record-migration.mjs','scripts/codex/validate.mjs','scripts/codex/ci.mjs','scripts/codex/tests/negative.mjs','tests/generator-negative.mjs','tests/engine-cli.mjs','scripts/codex/engine-e2e.mjs','tests/hygiene.mjs','scripts/codex/hygiene.mjs','scripts/codex/hooks.mjs','scripts/codex/shell.mjs','scripts/codex/support-generation.mjs','docs/codex/transform-source-pins.json','docs/codex/active-baseline.json']){mkdirSync(path.dirname(path.join(work,p)),{recursive:true});copyFileSync(path.join(root,p),path.join(work,p))}
const run=(script,...a)=>spawnSync(process.execPath,['scripts/codex/'+script,...a],{cwd:work,encoding:'utf8'}),ok=r=>assert.equal(r.status,0,r.stderr||r.stdout),bad=(r,re)=>{assert.notEqual(r.status,0);assert.match(r.stderr,re)};
const report='docs/codex/cgs29-review-fixture.md';writeFileSync(path.join(work,report),'Fixture-only recorded review and test evidence.\n');
copyFileSync(path.join(root,'docs/codex/migration-manifest.json'),path.join(work,'docs/codex/migration-manifest.json'));
const inv=JSON.parse(readFileSync(path.join(work,'docs/codex/upstream-inventory.json'))),reg=JSON.parse(readFileSync(path.join(work,'docs/codex/generation-manifest.json')));
const hash=b=>createHash('sha256').update(b).digest('hex');
const overlayFiles=['docs/codex/overlays/help.json','docs/codex/overlays/helpers/session-start.sh.json'];
const rebased=overlayFiles.map((p,i)=>{const x=JSON.parse(readFileSync(path.join(work,p)));x.source_sha256=hash(newBytes[i]);return JSON.stringify(x,null,2)+'\n'});
const changes=sources.map((source,i)=>({source,old_sha256:inv.files.find(x=>x.path===source).sha256,new_sha256:hash(newBytes[i]),old_mode:inv.files.find(x=>x.path===source).mode,new_mode:inv.files.find(x=>x.path===source).mode,decision:'REBASE',evidence:[report],...(overlayFiles[i]?{overlay:{path:overlayFiles[i],sha256:hash(Buffer.from(rebased[i]))}}:{}),targets:reg.entries.filter(e=>(e.sources||[e.source]).includes(source)).map(e=>({target:e.target,old_sha256:e.target_sha256}))}));
const hooks=inv.hooks.filter(h=>h.command.includes(sources[1])).map(h=>({id:h.id,decision:'REVIEW',evidence:[report]}));
const plan={schema:1,reviewed:true,old_sha:sha,new_sha:next,changes,hooks},planFile='docs/codex/cgs29-fixture-plan.json',savePlan=x=>writeFileSync(path.join(work,planFile),JSON.stringify(x,null,2)+'\n');
function fixtureSnapshot(dir,rel=''){const result=[];for(const e of readdirSync(path.join(dir,rel),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(rel,e.name);if(e.isDirectory())result.push(...fixtureSnapshot(dir,p));else if(e.isSymbolicLink())result.push([p,'link',readlinkSync(path.join(dir,p))]);else if(e.isFile())result.push([p,'file',hash(readFileSync(path.join(dir,p)))]);else throw Error('Unsupported fixture entry: '+p)}return result}
savePlan(plan);const beforeArguments=fixtureSnapshot(work);
bad(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile,'--dry-run'),/Unknown, duplicate or incomplete argument/);
bad(run('reconcile-upstream.mjs','prepare','--root',work,'--root',work,'--plan',planFile),/Unknown, duplicate or incomplete argument/);
bad(run('reconcile-upstream.mjs','prepare','--root',work,'--plan'),/Unknown, duplicate or incomplete argument/);
bad(run('inventory.mjs','--dry-run'),/Unknown or duplicate inventory argument/);
assert.deepEqual(fixtureSnapshot(work),beforeArguments,'invalid arguments must not mutate any fixture file');
const noop={...plan,new_sha:sha,changes:[],hooks:[]};savePlan(noop);ok(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile));
for(const candidate of [removed,added]){savePlan({...plan,new_sha:candidate});bad(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile),/Added or deleted sources require explicit human onboarding\/retirement/)}
savePlan(plan);bad(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile),/not integrated into HEAD/);
git(work,...identity,'merge','--no-commit','--no-ff',next);
savePlan({...plan,changes:changes.map((c,i)=>i?c:{...c,new_sha256:'0'.repeat(64)})});bad(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile),/Stale, unreviewed/);
savePlan(plan);const victim=path.join(work,changes[0].targets[0].target),old=readFileSync(victim);writeFileSync(victim,'manual change');bad(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile),/Manual target drift/);writeFileSync(victim,old);
ok(run('reconcile-upstream.mjs','prepare','--root',work,'--plan',planFile));bad(run('validate.mjs'),/reconciliation PENDING/);bad(run('reconcile-upstream.mjs','finalize','--root',work),/Fresh valid non-pending/);
const archived=path.join(work,JSON.parse(readFileSync(path.join(work,'docs/codex/active-baseline.json'))).plan),archivedBytes=readFileSync(archived);writeFileSync(archived,'{}');bad(run('generate.mjs','--family','skills','--names','help','--reconcile','--targets',changes[0].targets[0].target),/plan changed/);writeFileSync(archived,archivedBytes);
const overlayPath=path.join(work,overlayFiles[0]);writeFileSync(overlayPath,rebased[0]);
writeFileSync(victim,'manual change after prepare');bad(run('generate.mjs','--family','skills','--names','help','--reconcile','--targets',changes[0].targets[0].target),/Manual target drift/);writeFileSync(victim,old);
bad(run('generate.mjs','--family','skills','--names','help','--reconcile','--targets','.agents/skills/help/not-reviewed.md'),/Unreviewed reconciliation target/);
const sourcePath=path.join(work,sources[0]),inventoryPath=path.join(work,'docs/codex/upstream-inventory.json'),beforeSource=readFileSync(sourcePath),beforeInventory=readFileSync(inventoryPath),beforeOverlay=readFileSync(overlayPath);
const auxiliary=beforeSource.toString().replace(/model: haiku\r?\n/,'disable-model-invocation: true\nmodel: haiku\n');assert.notEqual(auxiliary,beforeSource.toString());writeFileSync(sourcePath,auxiliary);const altInv=JSON.parse(beforeInventory);altInv.files.find(x=>x.path===sources[0]).sha256=hash(Buffer.from(auxiliary));writeFileSync(inventoryPath,JSON.stringify(altInv));const altOverlay=JSON.parse(beforeOverlay);altOverlay.source_sha256=hash(Buffer.from(auxiliary));writeFileSync(overlayPath,JSON.stringify(altOverlay));
bad(run('generate.mjs','--family','skills','--names','help','--check','--verify-pending','--complete'),/Missing registered candidate target: .*openai.yaml/);writeFileSync(sourcePath,beforeSource);writeFileSync(inventoryPath,beforeInventory);writeFileSync(overlayPath,beforeOverlay);
bad(run('generate.mjs','--family','support','--reconcile','--targets',changes[1].targets.map(t=>t.target).join(',')),/Helper overlay source mismatch/);
const hookOverlayPath=path.join(work,overlayFiles[1]);writeFileSync(hookOverlayPath,rebased[1]);
for(const c of changes){const skill=c.source.includes('/skills/'),rule=c.source.includes('/rules/');ok(run('generate.mjs','--family',skill?'skills':rule?'rules':'support',...(skill?['--names','help']:[]),'--reconcile','--targets',c.targets.map(t=>t.target).join(',')))}
const mp=path.join(work,'docs/codex/migration-manifest.json'),matrix=JSON.parse(readFileSync(mp));for(const id of [...sources.map(x=>'file:'+x),...hooks.map(x=>x.id)]){const e=matrix.entries.find(x=>x.id===id);e.status='EQUIVALENT';e.verification='Fixture review and test recorded';e.evidence=[report]}writeFileSync(mp,JSON.stringify(matrix,null,2)+'\n');
const hookRow=matrix.entries.find(x=>x.id===hooks[0].id),descriptorPath=path.join(work,'docs/codex/active-baseline.json'),pendingDescriptor=readFileSync(descriptorPath);hookRow.status='ACCEPTED';writeFileSync(mp,JSON.stringify(matrix,null,2)+'\n');bad(run('reconcile-upstream.mjs','finalize','--root',work),/Fresh valid non-pending/);assert.deepEqual(readFileSync(descriptorPath),pendingDescriptor);hookRow.status='EQUIVALENT';writeFileSync(mp,JSON.stringify(matrix,null,2)+'\n');
bad(run('reconcile-upstream.mjs','finalize','--root',work),/Stale migration target mapping/);
bad(run('record-migration.mjs','--source','missing','--task','CGS-29','--status','EQUIVALENT','--evidence',report,'--note','Fixture reviewed'),/one known matrix/);
bad(run('record-migration.mjs','--source',sources[0],'--prefix','.claude/hooks/','--task','CGS-29','--status','EQUIVALENT','--evidence',report,'--note','Fixture reviewed'),/exactly one/);
for(const source of sources)ok(run('record-migration.mjs','--source',source,'--task','CGS-29','--status','EQUIVALENT','--evidence',report,'--note','Fixture reviewed after regeneration'));
const recorded=JSON.parse(readFileSync(mp)).entries.find(e=>e.source===sources[2]);assert.equal(recorded.target,'.agents/rules/ai-code.md');assert.ok(recorded.related_targets.some(t=>t.target==='.agents/rules/index.json'));
const staleMatrix=JSON.parse(readFileSync(mp)),unchangedRule=staleMatrix.entries.find(e=>e.source==='.claude/rules/agent-memory.md');unchangedRule.related_targets=[{target:'.agents/rules/index.json',sha256:'0'.repeat(64)}];writeFileSync(mp,JSON.stringify(staleMatrix,null,2)+'\n');bad(run('reconcile-upstream.mjs','finalize','--root',work),/Stale recorded migration target/);assert.deepEqual(readFileSync(descriptorPath),pendingDescriptor);
ok(run('record-migration.mjs','--source','.claude/rules/agent-memory.md','--task','CGS-29','--status',unchangedRule.status,'--evidence',report,'--note','Fixture refreshed shared rule index mapping'));
ok(run('reconcile-upstream.mjs','finalize','--root',work));ok(run('validate.mjs'));ok(run('generate.mjs','--family','skills','--check'));ok(run('generate.mjs','--family','support','--check'));ok(run('inventory.mjs','--check'));
const snapshotPath=path.join(work,'docs/codex/upstream-snapshot.json'),snapshotBytes=readFileSync(snapshotPath),snapshot=JSON.parse(snapshotBytes);snapshot.ref='tampered';writeFileSync(snapshotPath,JSON.stringify(snapshot));bad(run('inventory.mjs','--check'),/Historical snapshot changed/);writeFileSync(snapshotPath,snapshotBytes);ok(run('inventory.mjs','--check'));
const post=run('ci.mjs','--skip-reconcile');ok(post);assert.match(post.stdout,/reconciliation fixture explicitly skipped/);
console.log(JSON.stringify({result:'PASS',fixture:work,old_sha:sha,new_sha:next,changed:sources,hooks:hooks.map(h=>h.id),postpromotion_command:'node scripts/codex/ci.mjs --skip-reconcile',postpromotion_exit:post.status,postpromotion_output:post.stdout,checks:['no-op','added and deleted source fail-closed','unintegrated source refusal and actual no-commit merge','stale-plan refusal','manual-drift refusal before and after prepare','pending-CI refusal','pending-finalize refusal','archived-plan mutation refusal','unreviewed target refusal','missing auxiliary target refusal','stale overlay refusal and reviewed rebase','reviewed selected target regeneration','invalid hook status refusal with pending descriptor preserved','stale migration mapping refusal','exact source recorder includes rule index','fresh-evidence finalize','active validation and inventory','historical snapshot tamper refusal','all nonrecursive quick CI suites after promotion'],engine:'NOT ASSESSED'},null,2));
