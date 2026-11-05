import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,realpathSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {hash} from './upstream-common.mjs';

const root=process.cwd(), fixture=mkdtempSync(path.join(realpathSync(tmpdir()),'cgs sync fixture ')), source=path.join(fixture,'source repo'),product=path.join(fixture,'product repo');
mkdirSync(source);mkdirSync(product);
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const write=(dir,p,s)=>{const f=path.join(dir,p);mkdirSync(path.dirname(f),{recursive:true});writeFileSync(f,s)};
const commit=(dir,msg)=>{git(dir,'add','-A');git(dir,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m',msg);return git(dir,'rev-parse','HEAD')};
const call=(script,args=[])=>spawnSync(process.execPath,[path.join(root,'scripts/codex',script+'.mjs'),'--root',product,'--source-repo',source,'--source-ref','main',...args],{encoding:'utf8'});
git(source,'init','-b','main');git(product,'init','-b','main');
git(source,'config','core.autocrlf','false');git(product,'config','core.autocrlf','false');
const groups={skill:'.claude/skills/demo/SKILL.md',agent:'.claude/agents/demo.md',rule:'.claude/rules/demo.md',hook:'.claude/hooks/demo.sh',template:'.claude/docs/templates/demo.md'};
for(const [kind,p] of Object.entries(groups))write(source,p,`original ${kind}\n`);
write(source,'.claude/rules/retired.md','retire\n');write(source,'.claude/hooks/rename-me.sh','rename exact\n');
const baseline=commit(source,'baseline');
const target='.agents/skills/demo/SKILL.md',content='native maintained skill\n';write(product,target,content);
write(product,'.gitignore','/.scratch/\n/.codex/worktrees/\n');
write(product,'docs/codex/active-baseline.json',JSON.stringify({schema:1,historical_source_commit:baseline,source_commit:baseline,reconciliation_evidence:[],state:'active'}));
write(product,'docs/codex/migration-manifest.json',JSON.stringify({source_commit:baseline,entries:[{id:'file:'+groups.skill,source:groups.skill,target,status:'EQUIVALENT'}]}));
write(product,'docs/codex/generation-manifest.json',JSON.stringify({source_commit:baseline,entries:[{source:groups.skill,target,target_sha256:hash(content),ownership:'generated',transform_ids:[]}]}));
commit(product,'product');
for(const [kind,p] of Object.entries(groups)){write(source,p,`changed ${kind}\n`);const add=p.replace('demo','added');write(source,add,`new ${kind}\n`)}
commit(source,'intermediate');
git(source,'rm','.claude/rules/retired.md');git(source,'mv','.claude/hooks/rename-me.sh','.claude/hooks/renamed.sh');const next=commit(source,'new tip');
const report=call('sync-upstream',['--dry-run']);assert.equal(report.status,0,report.stderr);const plan=JSON.parse(report.stdout);
assert.equal(plan.baseline_sha,baseline);assert.equal(plan.upstream_sha,next);
for(const kind of Object.keys(groups)){assert.ok(plan.changes.some(c=>c.category===kind&&c.change==='modified'));assert.ok(plan.changes.some(c=>c.category===kind&&c.change==='added'))}
assert.ok(plan.changes.every(c=>c.status==='PENDING'&&c.old_path!==undefined&&c.new_path!==undefined));
assert.ok(plan.changes.some(c=>c.old_path==='.claude/rules/retired.md'&&c.change==='deleted'));
assert.ok(plan.changes.some(c=>c.old_path==='.claude/hooks/rename-me.sh'&&c.new_path==='.claude/hooks/renamed.sh'&&c.change==='renamed'));
assert.ok(plan.changes.find(c=>c.source===groups.skill).targets.some(t=>t.target===target));
const before=git(product,'for-each-ref','--format=%(refname) %(objectname)');
for(const branch of ['main','source/ccgs-main','SOURCE/CCGS-MAIN']){const r=call('sync-upstream',['--prepare','--branch',branch]);assert.equal(r.status,2);assert.match(r.stderr,/protected/)}
assert.equal(git(product,'for-each-ref','--format=%(refname) %(objectname)'),before);
write(product,target,content+'local drift\n');const drift=call('sync-upstream',['--dry-run']);assert.equal(JSON.parse(drift.stdout).target_drift.length,1);assert.notEqual(call('sync-upstream',['--prepare']).status,0);
write(product,target,content);write(product,'dirty-user.txt','keep\n');assert.notEqual(call('sync-upstream',['--prepare']).status,0);assert.equal(readFileSync(path.join(product,'dirty-user.txt'),'utf8'),'keep\n');
git(product,'add','dirty-user.txt');commit(product,'preserve user file');
const mirrorWorktree=path.join(source,'forbidden-worktree');const denied=call('sync-upstream',['--prepare','--worktree',mirrorWorktree]);assert.equal(denied.status,2);assert.match(denied.stderr,/external source repository/);assert.equal(existsSync(mirrorWorktree),false);
const alias=path.join(fixture,'source-alias');
try{symlinkSync(source,alias,process.platform==='win32'?'junction':'dir');const viaAlias=path.join(alias,'forbidden-alias-worktree'),r=call('sync-upstream',['--prepare','--worktree',viaAlias]);assert.equal(r.status,2,r.stderr);assert.match(r.stderr,/external source repository/);assert.equal(existsSync(viaAlias),false)}catch(e){if(!['EPERM','EACCES','ENOTSUP'].includes(e.code))throw e;console.log('PENDING source alias creation unavailable')}
const checkout=path.join(fixture,'review worktree');const prepared=call('sync-upstream',['--prepare','--branch','codex/fixture-sync','--worktree',checkout]);assert.equal(prepared.status,0,prepared.stderr);assert.equal(JSON.parse(prepared.stdout).preparation,'PROPOSAL_REVIEW_REQUIRED');
assert.equal(git(checkout,'rev-parse','HEAD'),git(product,'rev-parse','HEAD'));assert.equal(existsSync(path.join(checkout,'.claude')),false);assert.equal(readFileSync(path.join(checkout,target),'utf8'),content);
assert.notEqual(spawnSync('git',['rev-parse','--verify','MERGE_HEAD'],{cwd:checkout}).status,0);assert.equal(git(product,'status','--porcelain'), '');
console.log('PASS isolated source diff, pending coverage, protected branches, drift, dirty tree and no source merge');
