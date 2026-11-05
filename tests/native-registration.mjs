import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,realpathSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const parent=realpathSync(tmpdir()),root=mkdtempSync(path.join(parent,'cgs native author ')),repo=process.cwd();
const put=(p,s)=>{const f=path.join(root,p);mkdirSync(path.dirname(f),{recursive:true});writeFileSync(f,s)};
const json=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const call=(...args)=>spawnSync(process.execPath,[path.join(repo,'scripts/codex/generate.mjs'),'--root',root,...args],{encoding:'utf8'});
const skill='.agents/skills/author-demo/SKILL.md',role='.codex/agents/author-role.toml',targets=skill+','+role;
const skillBody='---\nname: author-demo\ndescription: A native fixture skill.\n---\n\n# Native skill\n';
const roleBody='name = "author-role"\ndescription = "A native fixture role."\ndeveloper_instructions = "Capability ceiling: read only; no shell or write tools."\n\n[features]\nshell_tool = false\n';
try{
 const sha='1'.repeat(40);
 put('docs/codex/active-baseline.json',JSON.stringify({schema:1,historical_source_commit:sha,source_commit:sha,reconciliation_evidence:[],state:'active'}));
 put('docs/codex/upstream-inventory.json',JSON.stringify({schema:1,source_commit:sha,counts:{},files:[],hooks:[]}));
 put('docs/codex/migration-manifest.json',JSON.stringify({schema:1,source_commit:sha,statuses:['PENDING','PORTED','EQUIVALENT','UNSUPPORTED'],entries:[]}));
 put('docs/codex/generation-manifest.json',JSON.stringify({schema:1,source_commit:sha,entries:[]}));
 put('.agents/rules/index.json',JSON.stringify({schema:1,rules:[]}));
 put('.codex/model-policy.json',JSON.stringify({families:{},skills:{'author-demo':{family:'inherit'}},roles:{'author-role':{family:'inherit'}}}));
 const catalog='skills:\n  - name: author-demo\n    spec: studio-tests/author-demo.md\nroles:\n  - name: author-role\n    spec: studio-tests/author-role.md\n';put('studio-tests/catalog.yaml',catalog);
 put('studio-tests/author-demo.md','# Skill spec\n');put('studio-tests/author-role.md','# Role spec\n');
 put(skill,skillBody);put(role,roleBody);
 const registry='docs/codex/generation-manifest.json',before=readFileSync(path.join(root,registry));
 assert.notEqual(call('--register-native','--targets',targets).status,0);
 assert.notEqual(call('--record-native','--targets',skill).status,0);
 assert.notEqual(call('--register-native','--targets','docs/unsafe.md','--review','reviewed').status,0);
 assert.notEqual(call('--register-native','--targets','.agents/hooks/unsafe.sh','--review','reviewed').status,0);
 assert.notEqual(call('--register-native','--targets','.agents/skills/author-demo/.env.local','--review','reviewed').status,0);
 assert.notEqual(call('--register-native','--targets',skill,'--review','Reviewed incomplete selection').status,0);assert.deepEqual(readFileSync(path.join(root,registry)),before);
 put('studio-tests/catalog.yaml',catalog.replace('studio-tests/author-role.md','studio-tests/missing.md'));assert.notEqual(call('--register-native','--targets',targets,'--review','Reviewed native files').status,0);assert.deepEqual(readFileSync(path.join(root,registry)),before);put('studio-tests/catalog.yaml',catalog);
 put(role,'invalid role');assert.notEqual(call('--register-native','--targets',targets,'--review','Reviewed native files').status,0);assert.deepEqual(readFileSync(path.join(root,registry)),before);put(role,roleBody);
 const accepted=call('--register-native','--targets',targets,'--review','Reviewed native files and structure');assert.equal(accepted.status,0,accepted.stderr||accepted.stdout);
 const entries=json(registry).entries;assert.equal(entries.length,2);
 for(const e of entries){assert.equal(e.ownership,'native');assert.equal(e.authored_provenance.review,'Reviewed native files and structure');assert.ok(!('source' in e)&&!('source_sha256' in e)&&!('retired_provenance' in e))}
 assert.deepEqual(json('docs/codex/migration-manifest.json').entries,[]);
 assert.equal(existsSync(path.join(root,'.git')),false);assert.equal(existsSync(path.join(root,'.claude')),false);
 assert.equal(call('--check').status,0);
 put(skill,skillBody+'\nReviewed update.\n');assert.notEqual(call('--check').status,0);
 assert.equal(call('--record-native','--targets',skill).status,0);assert.equal(call('--check').status,0);
 const extra='.agents/skills/new-demo/SKILL.md';put(extra,'---\nname: new-demo\ndescription: Another skill.\n---\n# Demo\n');
 put(role,roleBody+'\n# Unselected edit\n');const prior=readFileSync(path.join(root,registry));
 const drift=call('--register-native','--targets',extra,'--review','Reviewed additional skill');assert.notEqual(drift.status,0);assert.match(drift.stderr,/Unselected target drift/);assert.deepEqual(readFileSync(path.join(root,registry)),prior);
 console.log('PASS source-free authored Skill and role registration, rollback, drift and recorded edits');
}finally{if(path.dirname(path.resolve(root))!==parent)throw Error('Unsafe fixture cleanup');rmSync(root,{recursive:true,force:true})}
