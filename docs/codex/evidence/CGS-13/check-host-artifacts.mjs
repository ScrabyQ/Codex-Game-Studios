// Checks already-authored artifacts. This script does not execute a skill or
// author expected outputs; behavioral coverage is the disclosed host session.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {skillTargets} from '../../../../scripts/codex/skills-generation.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const evidence=path.join(repo,'docs/codex/evidence/CGS-13');
const input=JSON.parse(fs.readFileSync(path.join(evidence,'fixture-inputs.json')));
const live=process.argv.includes('--live');
const root=live?input.fixture:path.join(evidence,'artifacts');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const snap=(n,p)=>fs.readFileSync(path.join(evidence,'snapshots',n,p),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
let checks=[];function check(name,fn){fn();checks.push({name,status:'PASS'});}
const section=(s,n)=>{const match=s.match(new RegExp('^## '+n+'\\r?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))','m'));assert.ok(match,n);return match[1]};
const adr='docs/architecture/adr-0002-save-format.md';
check('Scoped architecture edit preserves every unrelated section',()=>{
 const before=input.inputs['docs/architecture/architecture.md'].content,after=read('docs/architecture/architecture.md');
 for(const n of ['Module Ownership','Data Flow','Required ADRs','Technical Requirements Baseline'])assert.equal(section(after,n),section(before,n));
 assert.match(section(after,'Document Status'),/Version: 3/);assert.match(section(after,'System Layer Map'),/save \| Foundation/);
});
check('Authoring remains Proposed and does not unblock a story',()=>{assert.match(section(snap('01-proposed',adr),'Status'),/^Proposed/);assert.match(snap('01-proposed','production/epics/save/story-001-save.md'),/Status\*\*: Blocked/)});
check('Explicit acceptance preserves Date and unblocks only a governing match',()=>{const proposed=snap('01-proposed',adr),accepted=snap('02-accepted',adr);assert.match(section(accepted,'Status'),/^Accepted/);assert.equal(section(accepted,'Date'),section(proposed,'Date'));assert.match(snap('02-accepted','production/epics/save/story-001-save.md'),/Status\*\*: Ready/);for(const n of ['story-002-unrelated.md','story-003-successor-only.md'])assert.equal(read('production/epics/save/'+n),input.inputs['production/epics/save/'+n].content)});
check('Proposed replacement does not retire predecessor; accepted replacement precedes supersession',()=>{assert.match(section(snap('03-replacement-proposed',adr),'Status'),/^Accepted/);assert.match(section(snap('03-replacement-proposed','docs/architecture/adr-0003-binary-save.md'),'Status'),/^Proposed/);assert.match(section(snap('04-replacement-accepted',adr),'Status'),/^Accepted/);assert.match(section(snap('04-replacement-accepted','docs/architecture/adr-0003-binary-save.md'),'Status'),/^Accepted/)});
check('Supersession preserves old body/date and retains registry history',()=>{const before=snap('02-accepted',adr),after=read(adr);assert.match(section(after,'Status'),/^Superseded by ADR-0003/);for(const n of ['Date','Decision','Context','Consequences','Validation Criteria'])assert.equal(section(after,n),section(before,n));assert.match(section(after,'Related'),/Replacement:.*ADR-0003/);const reg=read('docs/registry/architecture.yaml');assert.match(reg,/health-save-format-json[\s\S]*status: "superseded_by: ADR-0003"/);assert.match(reg,/health-save-format-binary[\s\S]*status: active/);assert.match(read('production/epics/save/story-001-save.md'),/Status\*\*: Blocked/);assert.match(read('production/epics/save/story-001-save.md'),/ADR\*\*: ADR-0002/)});
check('Dependency refusal has byte-identical before/after inputs',()=>{const refusal=JSON.parse(fs.readFileSync(path.join(evidence,'dependency-refusal.json')));assert.match(refusal.decision,/REFUSED.*Proposed ADR-0001/);assert.ok(refusal.files.length>0);for(const f of refusal.files)assert.equal(f.actual_sha256,f.expected_sha256)});
check('TR IDs retained and retired IDs never reused',()=>{const reg=read('docs/architecture/tr-registry.yaml');assert.match(reg,/TR-health-001/);assert.match(reg,/TR-health-002[\s\S]*?status: deprecated/);assert.match(reg,/TR-save-001[\s\S]*?status: active/);assert.equal((reg.match(/id: TR-health-001/g)||[]).length,1);const obs=JSON.parse(fs.readFileSync(path.join(evidence,'helper-observations.json')));assert.ok(obs.some(x=>x.stdout.includes('TR-health-003\tTR-health-002')))});
check('Review does not treat Proposed coverage or absent tests as implementation PASS',()=>{assert.match(read('docs/architecture/requirements-traceability.md'),/Covered \(Proposed\), not Accepted coverage/);assert.match(read('docs/architecture/architecture-review-2026-11-05.md'),/Verdict: CONCERNS/);assert.match(read('docs/architecture/requirements-traceability.md'),/no test exists/)});
check('Accepted-only manifest draft excludes old rules and does not bypass review',()=>{const t=read('docs/architecture/control-manifest.preview.md');assert.match(t,/ADRs Covered\*\*: ADR-0001, ADR-0003/);assert.match(t,/Last Updated\*\*: 2026-11-05/);assert.match(t,/Manifest Version\*\*: 2026-11-05/);assert.match(t,/Draft — BLOCKED/);assert.match(t,/binary envelope containing schema_version = 2/);assert.doesNotMatch(t,/must encode a JSON envelope/);assert.equal(fs.existsSync(path.join(root,'docs/architecture/control-manifest.md')),false)});
check('Reverse thin input emits no design; substantive brief retains provenance and unknown intent',()=>{assert.equal(fs.existsSync(path.join(root,'design/inventory-stub-brief.md')),false);assert.equal(fs.existsSync(path.join(root,'design/gdd/inventory-stub.md')),false);const t=read('design/health-system-brief.md');assert.match(t,/Reverse-documented from implementation/);assert.match(t,/INTENT UNKNOWN/);assert.match(t,/Verified By\*\*: pending review/);assert.equal(fs.existsSync(path.join(root,'design/game-brief.md')),false);for(const p of ['src/gameplay/health_system.gd','src/gameplay/inventory_stub.gd'])assert.equal(hash(read(p)),input.inputs[p].sha256)});
check('Actual helpers ran successfully and receipts were produced',()=>{const o=JSON.parse(fs.readFileSync(path.join(evidence,'helper-observations.json')));assert.ok(o.length>=10);for(const x of o)assert.equal(x.exit_code,0,x.command.join(' '));assert.ok(o.some(x=>x.stdout.includes('ADRS: 3')));assert.ok(o.some(x=>x.stdout.includes('workflow: minimal')));assert.ok(o.some(x=>x.stdout.includes('Reviewed-Content-Hash:')))});
const names=['create-architecture','architecture-decision','architecture-review','create-control-manifest','reverse-document'];
check('All 30 generated files equal source-bound transformation plans (structural only)',()=>{const targets=skillTargets(repo,names);assert.equal(targets.length,30);for(const t of targets)assert.equal(fs.readFileSync(path.join(repo,t.target),'utf8'),Buffer.isBuffer(t.content)?t.content.toString('utf8'):t.content,t.target)});
const result={schema:1,mechanism:'Assertions on actual host-authored artifacts, plus separate structural regeneration comparison; not automated skill invocation',checks,limits:['Native custom roles and independent full review not exercised','Active manifest publication pending resolution of fixture review concerns','Game engine execution and full upstream spec suites not performed']};
fs.writeFileSync(path.join(evidence,'host-artifact-checks.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:checks.length,failed:0,root}));
