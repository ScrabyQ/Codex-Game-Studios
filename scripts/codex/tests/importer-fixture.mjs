import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {openSource} from '../source.mjs';
import {skillTargets} from '../skills-generation.mjs';
import {roleTargets} from '../roles-generation.mjs';

const base=mkdtempSync(path.join(realpathSync(tmpdir()),'cgs import fixture ')), repo=path.join(base,'source'), product=path.join(base,'product');
mkdirSync(repo);mkdirSync(path.join(product,'docs/codex/overlays'),{recursive:true});
const git=(...args)=>execFileSync('git',args,{cwd:repo,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const write=(root,p,text)=>{const f=path.join(root,p);mkdirSync(path.dirname(f),{recursive:true});writeFileSync(f,text)};
const hash=text=>createHash('sha256').update(text).digest('hex');
const sourcePath='.claude/skills/demo/SKILL.md';
const valid='---\nname: demo\ndescription: Fixture skill\nallowed-tools: Read\n---\n\n# Fixture heading\n## Authority\nPrior authorization persists. None grants write.\n### Safety\nSafety clause stays.\n';
git('init');
function commit(text){write(repo,sourcePath,text);git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','fixture');return git('rev-parse','HEAD')}
function inventory(commit,text){write(product,'docs/codex/upstream-inventory.json',JSON.stringify({source_commit:commit,files:[{path:sourcePath,category:'skill',sha256:hash(text)}]}))}
let commitId=commit(valid);inventory(commitId,valid);
const open=()=>openSource({root:product,repository:repo,ref:'HEAD',expectedCommit:commitId});
const generate=()=>skillTargets(product,['demo'],open());
const native=generate()[0].content.toString();
for(const heading of valid.split('\n').filter(line=>/^#{1,4} /.test(line)))assert.ok(native.includes(heading),heading);
for(const clause of ['Prior authorization persists.','None grants write.','Safety clause stays.'])assert.ok(native.includes(clause),clause);
const overlay=(pin,find)=>write(product,'docs/codex/overlays/demo.json',JSON.stringify({source_sha256:pin,edits:[{find,replace:'Reviewed replacement'}]}));
overlay('0'.repeat(64),'Fixture heading');assert.throws(generate,/Overlay source mismatch/);
overlay(hash(valid),'absent anchor');assert.throws(generate,/Overlay anchor count mismatch/);
overlay(hash(valid),'Fixture heading');assert.match(generate()[0].content.toString(),/Reviewed replacement/);
write(repo,'.claude/skills/extra/SKILL.md',valid);git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','extra');commitId=git('rev-parse','HEAD');assert.throws(generate,/source set differs/);
const malformed='---\nname demo\n---\n';write(repo,sourcePath,malformed);git('rm','.claude/skills/extra/SKILL.md');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','malformed');commitId=git('rev-parse','HEAD');inventory(commitId,malformed);assert.throws(generate,/Malformed frontmatter/);
const rolePath='.claude/agents/demo-role.md', role='---\nname: demo-role\ndescription: Fixture role\ntools: Read\n---\n\n# Role responsibilities\n## Safety boundary\nNever grant permissions.\n';
write(repo,rolePath,role);git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','role');commitId=git('rev-parse','HEAD');
write(product,'docs/codex/upstream-inventory.json',JSON.stringify({source_commit:commitId,files:[{path:sourcePath,category:'skill',sha256:hash(malformed)},{path:rolePath,category:'agent',sha256:hash(role)}]}));
const rolePlan=roleTargets(product,['demo-role'],open())[0];
for(const heading of role.split('\n').filter(line=>/^#{1,4} /.test(line)))assert.ok(rolePlan.content.toString().includes(heading));
assert.ok(rolePlan.content.toString().includes('Never grant permissions.'));
console.log('PASS source transform fixtures: source inventory, frontmatter, overlay pin and anchor, safety clause');
