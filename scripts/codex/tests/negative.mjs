import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.cwd(), tmp=mkdtempSync(path.join(tmpdir(),'cgs-ci-')), validator=path.join(root,'scripts/codex/validate.mjs');
const inv=JSON.parse(readFileSync('docs/codex/upstream-inventory.json')), mig=JSON.parse(readFileSync('docs/codex/migration-manifest.json')), reg=JSON.parse(readFileSync('docs/codex/generation-manifest.json'));
const files=new Set(['docs/codex/upstream-inventory.json','docs/codex/migration-manifest.json','docs/codex/generation-manifest.json','studio-tests/catalog.yaml',...reg.entries.flatMap(e=>[e.target,...(e.sources||[e.source])]),...mig.entries.flatMap(e=>e.evidence||[])]);
for(const m of readFileSync('studio-tests/catalog.yaml','utf8').matchAll(/^    spec: (\S+)/gm))files.add(m[1]);
for(const f of files){const from=path.join(root,f),to=path.join(tmp,f);if(!existsSync(from))throw Error('Fixture input missing: '+f);mkdirSync(path.dirname(to),{recursive:true});copyFileSync(from,to)}
const run=()=>spawnSync(process.execPath,[validator,'--root',tmp],{encoding:'utf8'});
const base=run();assert.equal(base.status,0,base.stderr);
const cases=[];
function changed(name,file,modify,reason){const p=path.join(tmp,file),original=readFileSync(p);try{writeFileSync(p,modify(original));const r=run();assert.notEqual(r.status,0,name);assert.match(r.stderr,reason,name);cases.push({name,exit:r.status,reason:true})}finally{writeFileSync(p,original)}}
changed('inventory duplicate','docs/codex/upstream-inventory.json',b=>{const x=JSON.parse(b);x.files[1].path=x.files[0].path;return JSON.stringify(x)},/Duplicate inventory/);
changed('target corruption',reg.entries[0].target,b=>Buffer.concat([b,Buffer.from('changed')]),/Target drift/);
changed('source corruption',reg.entries[0].sources?.[0]||reg.entries[0].source,b=>Buffer.concat([b,Buffer.from('changed')]),/Source drift/);
changed('duplicate target','docs/codex/generation-manifest.json',b=>{const x=JSON.parse(b);x.entries[1].target=x.entries[0].target;return JSON.stringify(x)},/Duplicate generated/);
changed('missing catalog reference','studio-tests/catalog.yaml',b=>b.toString().replace(/spec: (\S+)/,'spec: studio-tests/does-not-exist.md'),/Missing catalog spec/);
const entry=reg.entries.find(e=>e.target==='.agents/skills/help/SKILL.md'), target=path.join(tmp,entry.target), manifest=path.join(tmp,'docs/codex/generation-manifest.json'), oldTarget=readFileSync(target),oldManifest=readFileSync(manifest);
function targetMutation(name,content,reason){try{writeFileSync(target,content);const x=JSON.parse(oldManifest);x.entries.find(e=>e.target===entry.target).target_sha256=createHash('sha256').update(content).digest('hex');writeFileSync(manifest,JSON.stringify(x));const r=run();assert.notEqual(r.status,0,name);assert.match(r.stderr,reason,name);cases.push({name,exit:r.status,reason:true})}finally{writeFileSync(target,oldTarget);writeFileSync(manifest,oldManifest)}}
targetMutation('wrong native format',Buffer.from('bad frontmatter\n'),/Invalid native skill format/);
targetMutation('unclosed quoted description',Buffer.from('---\nname: help\ndescription: "unclosed\n---\n# Help\n'),/Invalid native skill format/);
targetMutation('broken plain relative reference',Buffer.concat([oldTarget,Buffer.from('\n[missing](references/not-present.md)\n')]),/Missing relative skill reference/);
const outside=path.join(mkdtempSync(path.join(tmpdir(),'cgs-ci-outside-')),'exists.md');writeFileSync(outside,'external fixture');
const escape=path.relative(path.dirname(target),outside).split(path.sep).join('/');
targetMutation('external existing reference',Buffer.concat([oldTarget,Buffer.from('\n[outside]('+escape+')\n')]),/Skill reference escapes project/);
const policy=path.join(tmp,'corrupt-policy.mjs'), source=readFileSync('scripts/codex/hooks.mjs','utf8'), corrupted=source.replace("return 'Destructive Git command denied'",'return null');
assert.notEqual(source,corrupted);writeFileSync(policy,corrupted);
const p=spawnSync(process.execPath,[path.join(root,'scripts/codex/tests/policy.mjs'),policy],{cwd:root,encoding:'utf8'});assert.notEqual(p.status,0);assert.match(p.stderr,/git reset --hard/);cases.push({name:'dangerous policy corruption',exit:p.status,reason:true});
assert.equal(run().status,0,'baseline restored');
console.log(JSON.stringify({baseline:base.status,cases,restored:0},null,2));
