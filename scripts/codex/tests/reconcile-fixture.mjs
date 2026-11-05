import assert from 'node:assert/strict';
import {spawnSync,execFileSync} from 'node:child_process';
import {cpSync,existsSync,mkdtempSync,mkdirSync,readFileSync,realpathSync,writeFileSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {readManualTarget} from '../safe-path.mjs';

// Both Git histories are new, disposable, unrelated to the product checkout.
const repo=process.cwd(),base=mkdtempSync(path.join(realpathSync(tmpdir()),'cgs reconcile native '));
const source=path.join(base,'source'),product=path.join(base,'product'),out=path.join(base,'inventory');
mkdirSync(source);mkdirSync(product);
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const commit=(cwd,message)=>{git(cwd,'add','.');git(cwd,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--quiet','-m',message);return git(cwd,'rev-parse','HEAD')};
const put=(root,p,value)=>{const f=path.join(root,p);mkdirSync(path.dirname(f),{recursive:true});writeFileSync(f,value)};
const json=(root,p)=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const sourcePaths={
  skill:n=>`.claude/skills/${n}/SKILL.md`,
  agent:n=>`.claude/agents/${n}.md`,
  rule:n=>`.claude/rules/${n}.md`,
  hook:n=>`.claude/hooks/${n}.sh`,
  template:n=>`.claude/docs/templates/${n}.md`
};
const content=(kind,name)=>kind==='skill'?`---\nname: ${name}\ndescription: Fixture skill\nallowed-tools: Read\n---\n# Fixture ${name}\n`:kind==='agent'?`---\nname: ${name}\ndescription: Fixture agent\ntools: Read\n---\n# Fixture ${name}\n`:kind==='hook'?`#!/bin/sh\necho ${name}\n`:`# Synthetic fixture ${name}\n`;
git(source,'init','--quiet');
put(source,'LICENSE','MIT fixture license\n');
const settings=handler=>JSON.stringify({hooks:{SessionStart:[{matcher:'',hooks:[{type:'command',command:'bash .claude/hooks/'+handler+'.sh',timeout:10}]}]}});
put(source,'.claude/settings.json',settings('hook-delete'));
for(const [p,s] of [['README.md','# Source README\n'],['.claude/hooks/update-check.sh','#!/bin/sh\necho old\n'],['GUIDE-OLD.md','# Renamed source\n'],['OLD.md','# Removed source\n']])put(source,p,s);
for(const [kind,make] of Object.entries(sourcePaths))for(const state of ['change','delete','rename'])put(source,make(kind+'-'+state),content(kind,kind+'-'+state));
const old=commit(source,'Initial synthetic source');
for(const [kind,make] of Object.entries(sourcePaths)){
  const changed=make(kind+'-change');put(source,changed,content(kind,kind+'-change')+'\n# Updated\n');
  git(source,'rm','--quiet',make(kind+'-delete'));
  const renamed=make(kind+'-rename'),replacement=make(kind+'-renamed');mkdirSync(path.dirname(path.join(source,replacement)),{recursive:true});git(source,'mv',renamed,replacement);
  put(source,make(kind+'-added'),content(kind,kind+'-added')+Array.from({length:30},(_,i)=>`Added ${kind} distinct content ${i}\n`).join(''));
}
put(source,'README.md','# Updated source README\n');put(source,'.claude/hooks/update-check.sh','#!/bin/sh\necho new\n');git(source,'mv','GUIDE-OLD.md','GUIDE-NEW.md');git(source,'rm','--quiet','OLD.md');
put(source,'.claude/settings.json',settings('hook-change'));
const next=commit(source,'Synthetic source changes');
cpSync(path.join(repo,'scripts/codex'),path.join(product,'scripts/codex'),{recursive:true});
const inventory=spawnSync(process.execPath,[path.join(repo,'scripts/codex/inventory.mjs'),'--candidate',old,'--output-dir',out,'--source-repo',source],{cwd:repo,encoding:'utf8'});
assert.equal(inventory.status,0,inventory.stderr);
const inv=json(out,'upstream-inventory.json'),matrix=json(out,'migration-manifest.json');
const targets={
  skill:'.agents/skills/demo/SKILL.md',
  agent:'.codex/agents/demo-agent.toml',
  rule:'.agents/rules/demo.md',
  hook:'.agents/hooks/demo.sh',
  template:'.agents/docs/templates/demo.md'
};
const native={
  skill:'---\nname: demo\ndescription: Fixture skill\n---\n# Native skill\n',
  agent:'name = "demo-agent"\ndescription = "Fixture role"\ndeveloper_instructions = "Fixture instructions"\n',
  rule:'# Native scoped rule\n',
  hook:'#!/bin/sh\necho native\n',
  template:'# Native template\n'
};
const entries=[];
for(const [kind,target] of Object.entries(targets)){
 const sourcePath=sourcePaths[kind](kind+'-change'),info=inv.files.find(f=>f.path===sourcePath);
 put(product,target,native[kind]);
 entries.push({source:sourcePath,source_sha256:info.sha256,target,target_sha256:sha(native[kind]),ownership:'generated',transform_ids:['synthetic-test']});
 const row=matrix.entries.find(e=>e.source===sourcePath);row.target=target;row.target_sha256=sha(native[kind]);
}
const ruleIndex='.agents/rules/index.json',index=JSON.stringify({schema:1,rules:[{id:'demo',target:targets.rule,patterns:['demo/**']}]})+'\n';
put(product,ruleIndex,index);
const ruleSource=sourcePaths.rule('rule-change'),ruleInfo=inv.files.find(f=>f.path===ruleSource);
entries.push({source:ruleSource,source_sha256:ruleInfo.sha256,target:ruleIndex,target_sha256:sha(index),ownership:'generated',transform_ids:['synthetic-index']});
const retiredTarget='.agents/hooks/retired.sh',retiredSource=sourcePaths.hook('hook-delete'),retiredInfo=inv.files.find(f=>f.path===retiredSource),retiredContent='#!/bin/sh\necho retired\n';
put(product,retiredTarget,retiredContent);
entries.push({source:retiredSource,source_sha256:retiredInfo.sha256,target:retiredTarget,target_sha256:sha(retiredContent),ownership:'generated',transform_ids:['synthetic-test']});
const retiredRow=matrix.entries.find(e=>e.source===retiredSource);retiredRow.target=retiredTarget;retiredRow.target_sha256=sha(retiredContent);
const manuals=[['README.md','README.md','# Native README\n'],['.claude/hooks/update-check.sh','scripts/codex/manual-check.mjs','// Native check\n'],['GUIDE-OLD.md','docs/manual-guide.md','# Native guide\n'],['OLD.md','docs/retained.md','# Retained native document\n']];
for(const [sourcePath,target,bytes] of manuals){put(product,target,bytes);const row=matrix.entries.find(e=>e.source===sourcePath);row.target=target;row.target_sha256=sha(bytes)}
delete matrix.entries.find(e=>e.source==='README.md').target_sha256;
for(const target of ['.git/config','.env.local','Content/test.uasset','../outside.md'])assert.throws(()=>readManualTarget(product,target));
for(const e of matrix.entries){e.status=e.target?'EQUIVALENT':'UNSUPPORTED';e.verification=e.target?'Synthetic reviewed baseline':'Synthetic source intentionally unsupported';}
put(product,'docs/codex/upstream-inventory.json',JSON.stringify(inv));
put(product,'docs/codex/migration-manifest.json',JSON.stringify(matrix));
put(product,'docs/codex/generation-manifest.json',JSON.stringify({schema:1,source_commit:old,entries}));
put(product,'docs/codex/active-baseline.json',JSON.stringify({schema:1,historical_source_commit:old,source_commit:old,reconciliation_evidence:[],state:'active'}));
put(product,'.codex/model-policy.json',JSON.stringify({families:{},roles:{'demo-agent':{family:'inherit'}},skills:{demo:{family:'inherit'}}}));
put(product,'studio-tests/catalog.yaml','skills:\n  - name: demo\n    spec: studio-tests/demo.md\nroles:\n  - name: demo-agent\n    spec: studio-tests/demo-agent.md\n');
put(product,'studio-tests/demo.md','# Fixture\n');put(product,'studio-tests/demo-agent.md','# Fixture\n');
put(product,'.gitignore','/.scratch/\n');
const overlayPath='docs/codex/overlays/skill-change.json',overlaySource=sourcePaths.skill('skill-change');
const oldOverlay=JSON.stringify({source_sha256:inv.files.find(f=>f.path===overlaySource).sha256,edits:[{find:'Fixture',replace:'Adapted'}]})+'\n';
put(product,overlayPath,oldOverlay);
const cli=(script,...args)=>spawnSync(process.execPath,[path.join(product,'scripts/codex',script+'.mjs'),...args],{cwd:product,encoding:'utf8',maxBuffer:16*1024*1024});
const valid=cli('validate','--root',product);assert.equal(valid.status,0,valid.stderr||valid.stdout);
git(product,'init','--quiet');git(product,'config','core.autocrlf','false');commit(product,'Initial synthetic native product');
const before=git(product,'status','--porcelain=v1');
const inspect=cli('check-upstream','--root',product,'--source-repo',source,'--source-ref',next);
assert.equal(inspect.status,0,inspect.stderr);
const report=JSON.parse(inspect.stdout);
for(const kind of Object.keys(sourcePaths))for(const change of ['added','deleted','renamed','modified'])assert(report.changes.some(c=>c.category===kind&&c.change===change),kind+' '+change);
for(const [sourcePath,target] of manuals)assert(report.changes.find(c=>c.old_path===sourcePath)?.targets.some(t=>t.target===target&&t.ownership==='manual'),`missing manual target ${target}`);
const declarationChange=report.changes.find(c=>c.new_path==='.claude/settings.json');
assert.equal(declarationChange.declarations.length,1);
assert.match(declarationChange.declarations[0].old.command,/hook-delete\.sh/);
assert.match(declarationChange.declarations[0].new.command,/hook-change\.sh/);
assert.equal(git(product,'status','--porcelain=v1'),before);
// Generate a real added-skill candidate directly from the new source commit.
const candidateInventory=path.join(base,'new-inventory'),staging=path.join(base,'staged-overlays'),candidateDir=path.join(base,'new-candidates');mkdirSync(staging);
const candidateInv=cli('inventory','--candidate',next,'--source-repo',source,'--source-ref',next,'--output-dir',candidateInventory);
assert.equal(candidateInv.status,0,candidateInv.stderr||candidateInv.stdout);
const stagedOverlayPath='docs/codex/overlays/skill-added.json',newSkillHash=json(candidateInventory,'upstream-inventory.json').files.find(f=>f.path===sourcePaths.skill('skill-added')).sha256;
const candidateOverlay=pin=>JSON.stringify({source_sha256:pin,edits:[{find:'# Fixture skill-added',replace:'# Reviewed added skill'}]})+'\n';
put(staging,stagedOverlayPath,candidateOverlay('0'.repeat(64)));
const staleCandidate=cli('generate','--root',product,'--family','skills','--names','skill-added','--source-repo',source,'--source-ref',next,'--source-inventory',path.join(candidateInventory,'upstream-inventory.json'),'--overlay-root',staging,'--candidate-dir',candidateDir);
assert.notEqual(staleCandidate.status,0);assert.match(staleCandidate.stderr,/Overlay source mismatch/);assert.equal(existsSync(candidateDir),false);
const addedOverlay=candidateOverlay(newSkillHash);put(staging,stagedOverlayPath,addedOverlay);
const generated=cli('generate','--root',product,'--family','skills','--names','skill-added','--source-repo',source,'--source-ref',next,'--source-inventory',path.join(candidateInventory,'upstream-inventory.json'),'--overlay-root',staging,'--candidate-dir',candidateDir);
assert.equal(generated.status,0,generated.stderr||generated.stdout);
const addedSkill='.agents/skills/skill-added/SKILL.md',addedSkillContent=readFileSync(path.join(candidateDir,addedSkill));
assert.match(addedSkillContent.toString(),/# Reviewed added skill/);
assert.equal(existsSync(path.join(product,addedSkill)),false);
assert.equal(git(product,'status','--porcelain=v1'),before,'candidate generation changed the native product');
const onboardSkill=root=>{const policy=json(root,'.codex/model-policy.json');policy.skills['skill-added']={family:'inherit'};put(root,'.codex/model-policy.json',JSON.stringify(policy));put(root,'studio-tests/catalog.yaml','skills:\n  - name: demo\n    spec: studio-tests/demo.md\n  - name: skill-added\n    spec: studio-tests/skill-added.md\nroles:\n  - name: demo-agent\n    spec: studio-tests/demo-agent.md\n');put(root,'studio-tests/skill-added.md','# Fixture\n');};
const updated=new Map(Object.entries(targets).map(([kind,target])=>[target,native[kind]+'\n# Reviewed update\n']));
for(const [sourcePath,target,bytes] of manuals)updated.set(target,sourcePath==='README.md'||sourcePath.endsWith('update-check.sh')?bytes+'\nReviewed change\n':bytes);
updated.set(ruleIndex,index);
const addedTarget='.agents/docs/templates/added.md',addedContent='# Reviewed new template\n';
updated.set(addedTarget,addedContent);
updated.set(addedSkill,addedSkillContent);
const newOverlay=JSON.stringify({source_sha256:report.changes.find(c=>c.new_path===overlaySource).new_sha256,edits:[{find:'Fixture',replace:'Adapted'}]})+'\n';
const changes=report.changes.map(c=>{
 const fields=Object.fromEntries(['old_path','new_path','old_blob','new_blob','old_sha256','new_sha256','old_mode','new_mode'].map(k=>[k,c[k]]));
 const mapped=c.targets.map(t=>({target:t.target,old_sha256:t.recorded_sha256,new_sha256:t.target===retiredTarget?null:sha(updated.get(t.target)),action:t.target===retiredTarget?'retire':t.target===ruleIndex||t.ownership==='manual'&&sha(updated.get(t.target))===t.recorded_sha256?'retain':'update',...(t.ownership==='manual'?{ownership:'manual'}:{})}));
 if(c.new_path===sourcePaths.template('template-added'))mapped.push({target:addedTarget,old_sha256:null,new_sha256:sha(addedContent),action:'add',registration:{source:c.new_path,transform_ids:['reviewed-test']}});
 if(c.new_path===sourcePaths.skill('skill-added'))mapped.push({target:addedSkill,old_sha256:null,new_sha256:sha(addedSkillContent),action:'add',registration:{source:c.new_path,transform_ids:['reviewed-test']}});
 const overlays=c.old_path===overlaySource?[{path:overlayPath,old_sha256:sha(oldOverlay),new_sha256:sha(newOverlay)}]:c.new_path===sourcePaths.skill('skill-added')?[{path:stagedOverlayPath,old_sha256:null,new_sha256:sha(addedOverlay)}]:[];
 return {...fields,decision:c.change==='deleted'?'retire':c.change==='modified'||mapped.length?'adapt':'retain',targets:mapped,overlays,declarations:c.declarations};
});
const plan={schema:2,reviewed:true,old_sha:old,new_sha:next,changes};
const planPath=path.join(base,'reviewed-plan.json'),save=p=>writeFileSync(planPath,JSON.stringify(p,null,2)+'\n');
const prepare=()=>cli('reconcile-upstream','prepare','--root',product,'--plan',planPath,'--source-repo',source,'--source-ref',next);
const denied=(result,pattern)=>{assert.notEqual(result.status,0);assert.match(result.stderr,pattern);};
const descriptor='docs/codex/active-baseline.json',baselineBytes=readFileSync(path.join(product,descriptor));
save({...plan,reviewed:false});denied(prepare(),/Invalid reviewed plan/);
save({...plan,changes:changes.slice(1)});denied(prepare(),/every source change/);
const missingDeclaration=structuredClone(plan);missingDeclaration.changes.find(c=>c.new_path==='.claude/settings.json').declarations=[];save(missingDeclaration);denied(prepare(),/changed hook declarations/);
const alteredDeclaration=structuredClone(plan);alteredDeclaration.changes.find(c=>c.new_path==='.claude/settings.json').declarations[0].new.command='wrong';save(alteredDeclaration);denied(prepare(),/changed hook declarations/);
save(plan);
denied(cli('reconcile-upstream','prepare','--root',product,'--plan',planPath,'--source-repo',source,'--source-ref',old),/Plan source commit mismatch/);
const unrelated=path.join(base,'unrelated');mkdirSync(unrelated);git(unrelated,'init','--quiet');put(unrelated,'unrelated.txt','unrelated history\n');const unrelatedHead=commit(unrelated,'Unrelated history');
const rewritten=cli('reconcile-upstream','prepare','--root',product,'--plan',planPath,'--source-repo',unrelated,'--source-ref',unrelatedHead);assert.notEqual(rewritten.status,0,'unrelated history must fail closed');
const badSource=structuredClone(plan);badSource.changes[0].new_sha256='0'.repeat(64);save(badSource);denied(prepare(),/Source change guard mismatch/);
const badTarget=structuredClone(plan),mappedChange=badTarget.changes.find(c=>c.targets.some(t=>t.old_sha256));mappedChange.targets.find(t=>t.old_sha256).old_sha256='0'.repeat(64);save(badTarget);denied(prepare(),/Target old hash mismatch/);
const missingOverlay=structuredClone(plan);missingOverlay.changes.find(c=>c.old_path===overlaySource).overlays=[];save(missingOverlay);denied(prepare(),/overlay binding/i);
const wrongOverlay=structuredClone(plan);wrongOverlay.changes.find(c=>c.old_path===overlaySource).overlays[0].old_sha256='0'.repeat(64);save(wrongOverlay);denied(prepare(),/overlay/i);
const badDecision=structuredClone(plan);badDecision.changes.find(c=>c.old_path===retiredSource).decision='adapt';save(badDecision);denied(prepare(),/Decision does not match/);
const badRetain=structuredClone(plan);badRetain.changes.find(c=>c.old_path===overlaySource).decision='retain';save(badRetain);denied(prepare(),/Retained target content cannot change/);
// A reviewed overlay hash is insufficient if its embedded pin names another source.
const pinProduct=path.join(base,'wrong-pin-product');git(base,'-c','core.autocrlf=false','clone','--quiet','--no-hardlinks',product,pinProduct);
const pinPlan=structuredClone(plan),wrongPin=JSON.stringify({source_sha256:'0'.repeat(64),edits:[{find:'Fixture',replace:'Adapted'}]})+'\n';
pinPlan.changes.find(c=>c.old_path===overlaySource).overlays[0].new_sha256=sha(wrongPin);
const pinPlanPath=path.join(base,'wrong-pin-plan.json');writeFileSync(pinPlanPath,JSON.stringify(pinPlan));
const pinCli=(...args)=>spawnSync(process.execPath,[path.join(pinProduct,'scripts/codex/reconcile-upstream.mjs'),...args],{cwd:pinProduct,encoding:'utf8'});
const pinPrepare=pinCli('prepare','--root',pinProduct,'--plan',pinPlanPath,'--source-repo',source,'--source-ref',next);assert.equal(pinPrepare.status,0,pinPrepare.stderr);
put(pinProduct,overlayPath,wrongPin);put(pinProduct,stagedOverlayPath,addedOverlay);for(const [target,bytes] of updated)put(pinProduct,target,bytes);unlinkSync(path.join(pinProduct,retiredTarget));
denied(pinCli('apply','--root',pinProduct),/Overlay source pin mismatch/);
assert.equal(json(pinProduct,descriptor).reconciliation_phase,'prepared');
// Even a reviewed target hash cannot authorize structurally invalid native content.
const invalidProduct=path.join(base,'invalid-target-product');git(base,'-c','core.autocrlf=false','clone','--quiet','--no-hardlinks',product,invalidProduct);
const invalidPlan=structuredClone(plan),invalidBytes='invalid native frontmatter\n';
invalidPlan.changes.find(c=>c.old_path===overlaySource).targets.find(t=>t.target===targets.skill).new_sha256=sha(invalidBytes);
const invalidPlanPath=path.join(base,'invalid-target-plan.json');writeFileSync(invalidPlanPath,JSON.stringify(invalidPlan));
const invalidCli=(...args)=>spawnSync(process.execPath,[path.join(invalidProduct,'scripts/codex/reconcile-upstream.mjs'),...args],{cwd:invalidProduct,encoding:'utf8'});
const invalidPrepare=invalidCli('prepare','--root',invalidProduct,'--plan',invalidPlanPath,'--source-repo',source,'--source-ref',next);assert.equal(invalidPrepare.status,0,invalidPrepare.stderr);
put(invalidProduct,overlayPath,newOverlay);put(invalidProduct,stagedOverlayPath,addedOverlay);for(const [target,bytes] of updated)put(invalidProduct,target,bytes);put(invalidProduct,targets.skill,invalidBytes);unlinkSync(path.join(invalidProduct,retiredTarget));onboardSkill(invalidProduct);
const metadata=['docs/codex/active-baseline.json','docs/codex/upstream-inventory.json','docs/codex/generation-manifest.json','docs/codex/migration-manifest.json'];
const prior=metadata.map(p=>readFileSync(path.join(invalidProduct,p)));
const invalidApply=invalidCli('apply','--root',invalidProduct);denied(invalidApply,/apply failed validation; metadata restored/i);assert.match(invalidApply.stderr,/Invalid native skill format/);
for(let i=0;i<metadata.length;i++)assert.deepEqual(readFileSync(path.join(invalidProduct,metadata[i])),prior[i],metadata[i]);
save(plan);const driftTarget=targets.skill,driftFile=path.join(product,driftTarget),driftBefore=readFileSync(driftFile);writeFileSync(driftFile,'manual edit');denied(prepare(),/Dirty product or target drift/);assert.equal(readFileSync(driftFile,'utf8'),'manual edit');writeFileSync(driftFile,driftBefore);
const manualTarget=path.join(product,'README.md'),manualBefore=readFileSync(manualTarget);writeFileSync(manualTarget,'unreviewed manual edit');denied(prepare(),/Dirty product or target drift/);assert.equal(readFileSync(manualTarget,'utf8'),'unreviewed manual edit');writeFileSync(manualTarget,manualBefore);
put(product,'untracked-work.txt','local user work\n');denied(prepare(),/Dirty product or target drift/);unlinkSync(path.join(product,'untracked-work.txt'));
assert.deepEqual(readFileSync(path.join(product,descriptor)),baselineBytes);
const ready=prepare();assert.equal(ready.status,0,ready.stderr||ready.stdout);
const pending=json(product,descriptor);assert.equal(pending.state,'pending');assert.equal(pending.reconciliation_phase,'prepared');
assert.ok(pending.plan.startsWith('.scratch/'));assert.equal(existsSync(path.join(product,'.claude')),false);
denied(cli('reconcile-upstream','finalize','--root',product),/Apply reviewed target changes first/);
const archivePlan=path.join(product,pending.plan),archived=readFileSync(archivePlan);writeFileSync(archivePlan,'{}');denied(cli('reconcile-upstream','apply','--root',product),/Reviewed plan changed/);writeFileSync(archivePlan,archived);
put(product,stagedOverlayPath,addedOverlay);
denied(cli('reconcile-upstream','apply','--root',product),/Reviewed overlay hash mismatch/);
put(product,overlayPath,newOverlay);
denied(cli('reconcile-upstream','apply','--root',product),/Reviewed target hash mismatch/);
assert.equal(json(product,descriptor).reconciliation_phase,'prepared');
for(const [target,bytes] of updated)put(product,target,bytes);
unlinkSync(path.join(product,retiredTarget));
onboardSkill(product);
const applied=cli('reconcile-upstream','apply','--root',product);assert.equal(applied.status,0,applied.stderr||applied.stdout);
assert.equal(json(product,descriptor).reconciliation_phase,'applied');
put(product,'fake-review.txt','file existence is not review\n');
denied(cli('reconcile-upstream','finalize','--root',product),/Explicit review still pending/);
unlinkSync(path.join(product,'fake-review.txt'));
const matrixFile='docs/codex/migration-manifest.json';
const matrixBefore=readFileSync(path.join(product,matrixFile));
denied(cli('record-migration','--root',product,'--source',overlaySource,'--status','EQUIVALENT'),/reviewed verification note/i);
assert.deepEqual(readFileSync(path.join(product,matrixFile)),matrixBefore);
for(const sourcePath of [overlaySource,sourcePaths.skill('skill-added')]){
 const recorded=cli('record-migration','--root',product,'--source',sourcePath,'--status','EQUIVALENT','--review','Reviewed synthetic candidate and native checks');
 assert.equal(recorded.status,0,recorded.stderr||recorded.stdout);
 assert.equal(json(product,matrixFile).entries.find(e=>e.source===sourcePath).status,'EQUIVALENT');
}
for(const sourcePath of ['README.md','.claude/hooks/update-check.sh','GUIDE-NEW.md']){const recorded=cli('record-migration','--root',product,'--source',sourcePath,'--status','EQUIVALENT','--review','Reviewed manually maintained target');assert.equal(recorded.status,0,recorded.stderr||recorded.stdout);assert.equal(json(product,matrixFile).entries.find(e=>e.source===sourcePath).status,'EQUIVALENT')}
assert.ok(json(product,matrixFile).retired_manual_mappings.some(e=>e.source==='OLD.md'&&e.target==='docs/retained.md'));
const declarationId=declarationChange.declarations[0].id;
const declarationReview=cli('record-migration','--root',product,'--id',declarationId,'--status','UNSUPPORTED','--review','Synthetic hook declaration explicitly reviewed as unsupported');
assert.equal(declarationReview.status,0,declarationReview.stderr||declarationReview.stdout);
assert.equal(json(product,matrixFile).entries.find(e=>e.id===declarationId).status,'UNSUPPORTED');
const reviewed=json(product,matrixFile),currentReg=json(product,'docs/codex/generation-manifest.json');
for(const entry of reviewed.entries)if(entry.status==='PENDING'){const mapped=currentReg.entries.some(e=>e.source===entry.source||e.sources?.includes(entry.source));entry.status=mapped?'EQUIVALENT':'UNSUPPORTED';entry.verification=mapped?'Reviewed synthetic target and native checks':'Synthetic source deliberately unsupported';}
put(product,matrixFile,JSON.stringify(reviewed));
const reviewedTarget=path.join(product,targets.skill),reviewedBytes=readFileSync(reviewedTarget);
writeFileSync(reviewedTarget,Buffer.concat([reviewedBytes,Buffer.from('\nUnreviewed drift\n')]));
const finalDrift=cli('reconcile-upstream','finalize','--root',product);assert.notEqual(finalDrift.status,0);assert.equal(json(product,descriptor).state,'pending');
writeFileSync(reviewedTarget,reviewedBytes);
const finished=cli('reconcile-upstream','finalize','--root',product);assert.equal(finished.status,0,finished.stderr||finished.stdout);
assert.equal(json(product,descriptor).state,'active');
const finalCheck=cli('validate','--root',product);assert.equal(finalCheck.status,0,finalCheck.stderr||finalCheck.stdout);
const retainedPath='docs/retained.md',retiredBefore=json(product,matrixFile).retired_manual_mappings.find(e=>e.target===retainedPath),retainedFile=path.join(product,retainedPath);
writeFileSync(retainedFile,'# Reviewed native revision\n');
denied(cli('validate','--root',product),/retired manual target drift/i);
denied(cli('generate','--root',product,'--record-native','--targets','README.md'),/Unselected target drift/);
const recordRetired=cli('generate','--root',product,'--record-native','--targets',retainedPath);assert.equal(recordRetired.status,0,recordRetired.stderr||recordRetired.stdout);
const retiredAfter=json(product,matrixFile).retired_manual_mappings.find(e=>e.target===retainedPath);
assert.equal(retiredAfter.source,retiredBefore.source);assert.equal(retiredAfter.source_commit,retiredBefore.source_commit);assert.equal(retiredAfter.source_sha256,retiredBefore.source_sha256);assert.equal(retiredAfter.target_sha256,sha('# Reviewed native revision\n'));
assert.equal(cli('validate','--root',product).status,0);
const intactMatrix=readFileSync(path.join(product,matrixFile));
const duplicateRetired=json(product,matrixFile);duplicateRetired.retired_manual_mappings.push(structuredClone(duplicateRetired.retired_manual_mappings[0]));put(product,matrixFile,JSON.stringify(duplicateRetired));denied(cli('validate','--root',product),/Duplicate retired manual mappings/);
const invalidRetired=json(product,matrixFile);invalidRetired.retired_manual_mappings=[{...retiredAfter,source_commit:'invalid'}];put(product,matrixFile,JSON.stringify(invalidRetired));denied(cli('validate','--root',product),/Invalid retired manual provenance/);writeFileSync(path.join(product,matrixFile),intactMatrix);
assert.equal(existsSync(path.join(product,'.claude')),false);
const finalReg=json(product,'docs/codex/generation-manifest.json');assert(finalReg.entries.some(e=>e.target===addedTarget));assert(!finalReg.entries.some(e=>e.target===retiredTarget));
console.log('PASS synthetic five-family change detection, guarded prepare/apply/finalize, explicit review, addition and retirement');
