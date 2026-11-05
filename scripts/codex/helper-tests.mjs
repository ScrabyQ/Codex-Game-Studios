import assert from 'node:assert/strict';
import {bashPath} from './shell.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, readdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
const repo = resolve('.'), root = mkdtempSync(join(tmpdir(), 'cgs helper test '));
const script = join(repo, 'scripts/codex/helper.mjs');
if (process.argv.includes('--syntax')) {
  const shell = bashPath();
  const sh = ['scripts','hooks'].flatMap(group=>readdirSync(join(repo,'.agents',group)).filter(n=>n.endsWith('.sh')).map(n=>join(repo,'.agents',group,n)));
  for (const t of sh) {
    const r = spawnSync(shell, ['-n', t], { encoding: 'utf8' });
    assert.equal(r.status, 0, `${t}: ${r.stderr || r.error || 'shell syntax check could not run'}`);
  }
  console.log(`PASS: Bash syntax for ${sh.length} helper scripts; behavioral execution is not established.`);
  process.exit(0);
}
const node = (entry, args, input) => spawnSync(process.execPath, [join(repo, 'scripts/codex', entry), ...args], { cwd: repo, input, encoding: 'utf8', env: process.env });
const helper = (name, args = [], input) => node('helper.mjs', [name, '--root', root, ...args], input);
const ok = r => { assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`); return r.stdout; };
// Exercise planning, catalog observations, and ID allocation in a separate project.
const planning=mkdtempSync(join(tmpdir(),'cgs planning regression '));
const fixtureWrite=(p,s)=>{const target=join(planning,p);mkdirSync(resolve(target,'..'),{recursive:true});writeFileSync(target,s);};
fixtureWrite('project.yaml','project:\n  stage: Concept\nmodes:\n  automation: autonomous\n');
fixtureWrite('production/stage.txt','Concept\n');
copyFileSync(join(repo,'.agents/docs/workflow-catalog.yaml'),(mkdirSync(join(planning,'.agents/docs'),{recursive:true}),join(planning,'.agents/docs/workflow-catalog.yaml')));
fixtureWrite('production/epics/demo/story-001.md','# First\n\nStatus: Blocked\n\n## Acceptance Criteria\n- [ ] one\n');
fixtureWrite('production/epics/demo/story-002.md','# Second\n\nStatus: Ready\n\n## Acceptance Criteria\n- [ ] two\n');
fixtureWrite('production/sprint-status.yaml','stories:\n  - file: production/epics/demo/story-001.md\n    status: Blocked\n  - file: production/epics/demo/story-002.md\n    status: Ready\n');
const planningHelper=(name,args=[])=>node('helper.mjs',[name,'--root',planning,...args]);
const stageYaml=readFileSync(join(planning,'project.yaml')),stageMirror=readFileSync(join(planning,'production/stage.txt'));
for(const scope of ['--all','--sprint']) {
  const output=ok(planningHelper('story-facts',['--lint','--granularity','coarse',scope]));
  assert.match(output,/stories\s+2\s/);assert.match(output,/complete\s+0/);assert.match(output,/blocked\s+1/);
  assert.match(output,/story-001\.md/);assert.match(output,/story-002\.md/);
}
const catalog=ok(planningHelper('artifact-check',['--path','minimal']));assert.match(catalog,/NO_CHECK: 2/);
const status=ok(planningHelper('story-status'));assert.match(status,/COMPLETE\s+0 of 2/);assert.match(status,/BLOCKED/);
assert.deepEqual(readFileSync(join(planning,'project.yaml')),stageYaml);assert.deepEqual(readFileSync(join(planning,'production/stage.txt')),stageMirror);
const registry='requirements:\n- id: TR-health-001\n  status: active\n- id: TR-health-002\n  status: deprecated\n';
fixtureWrite('docs/architecture/tr-registry.yaml',registry);
assert.match(ok(planningHelper('registry',['next-id','tr','health'])),/TR-health-003\s+TR-health-002/);
assert.equal(readFileSync(join(planning,'docs/architecture/tr-registry.yaml'),'utf8'),registry);
const decision=spawnSync(bashPath(),['-c','source "$1"; log_decision "$2" "$3" "$4" "$5" "$6" "$7"','fixture',join(repo,'.agents/hooks/yaml-helper.sh'),'team-release','Stage guard','Stop; explicit user override','Stop: no override','Automation grants no permission','stage-guard'],{cwd:planning,env:{...process.env,CGS_PROJECT_DIR:planning},encoding:'utf8'});
assert.equal(decision.status,0,decision.stderr);
const decisionLog=readFileSync(join(planning,'production/session-logs/decision-log.md'),'utf8');
assert.match(decisionLog,/\*\*Chosen:\*\* Stop: no override/);assert.match(decisionLog,/\*\*Reason:\*\* Automation grants no permission/);
assert.deepEqual(readFileSync(join(planning,'project.yaml')),stageYaml);assert.deepEqual(readFileSync(join(planning,'production/stage.txt')),stageMirror);
mkdirSync(join(root, '.agents/docs/templates'), { recursive: true });
mkdirSync(join(root, 'production'), { recursive: true });
writeFileSync(join(root, 'project.yaml'), 'project:\n  stage: Concept\nmodes:\n  rigor: standard\n');
writeFileSync(join(root, 'production/stage.txt'), 'Concept\n');
const relativeSet = node('config.mjs', ['set', '--root', relative(repo, root), 'modes.rigor', 'full']);
assert.equal(relativeSet.status, 0, relativeSet.stderr); assert.match(readFileSync(join(root, 'project.yaml'), 'utf8'), /rigor: full/);
writeFileSync(join(root, '.agents/docs/templates/session-state.md'), '<!-- STATUS -->\r\nReady\r\n<!-- /STATUS -->\r\n<!-- CHECKPOINT -->\r\nold\r\n<!-- /CHECKPOINT -->\r\nnarrative\r\n');
ok(helper('set-stage', ['Systems Design']));
assert.match(readFileSync(join(root, 'project.yaml'), 'utf8'), /stage: Systems Design/);
assert.equal(readFileSync(join(root, 'production/stage.txt'), 'utf8').trim(), 'Systems Design');
assert.equal(helper('set-stage', ['Invalid Stage']).status, 3);
ok(helper('session-state', ['checkpoint'], 'fresh checkpoint\n'));
assert.match(readFileSync(join(root, 'production/session-state/active.md'), 'utf8'), /fresh checkpoint\r\n<!-- \/CHECKPOINT -->\r\nnarrative/);
const story = join(root, 'story with spaces.md');
writeFileSync(story, '# Story\n\nStatus: In Progress\n\n## Acceptance Criteria\n- [ ] works\n');
const facts = ok(helper('story-facts', ['--lint', 'story with spaces.md'])); assert.match(facts, /STORY/); assert.match(facts, /story with spaces\.md/);
assert.equal(helper('story-facts', ['missing story.md']).status, 3);
mkdirSync(join(root, 'docs/architecture'), { recursive: true });
writeFileSync(join(root, 'docs/architecture/adr-0001-choice.md'), '# ADR\n\n## Status\nAccepted\n\n## Date\n2026-11-05\n');
assert.match(ok(helper('adr-status')), /adr-0001[^\n]*Accepted/i);
writeFileSync(join(root, 'docs/architecture/adr-0001-choice.md'), '# ADR\n\n## Status\nSuperseded by ADR-0002\n\n## Date\n2026-11-05\n');
assert.match(ok(helper('adr-status')), /adr-0001[^\n]*Superseded/i);
assert.match(ok(helper('registry', ['next-id', 'adr'])), /0002/);
const stamp = ok(helper('review-receipts', ['hash', 'story with spaces.md'])); assert.match(stamp, /Reviewed-Content-Hash:/);
writeFileSync(join(root, 'receipt.md'), stamp);
assert.match(ok(helper('review-receipts', ['check', 'receipt.md', 'story with spaces.md'])), /UNCHANGED/);
writeFileSync(story, '# Story\n\nStatus: Complete\n');
assert.match(ok(helper('review-receipts', ['check', 'receipt.md', 'story with spaces.md'])), /CHANGED/);
assert.match(ok(helper('read-guard', ['check', 'story with spaces.md'])), /watched\s+no/);
assert.match(ok(helper('write-guard', ['prototype', 'prototypes/example/code.gd'])), /prototype|PROTOTYPE/i);
const missing = ok(helper('test-run', ['godot', '--exe', 'missing-engine-for-test'])); assert.match(missing, /ran\s+no/);
mkdirSync(join(root, 'addons/gdUnit4/bin'), { recursive: true });
writeFileSync(join(root, 'addons/gdUnit4/bin/GdUnitCmdTool.gd'), '# synthetic fixture; no engine run\n');
const syntheticSuccess = ok(helper('test-run', ['godot', '--cmd', 'exit 0'])); assert.match(syntheticSuccess, /rule\s+godot:0\s/);
const syntheticFailure = ok(helper('test-run', ['godot', '--cmd', 'exit 100'])); assert.match(syntheticFailure, /rule\s+godot:100\s/);
const skillDir = join(root, '.agents/skills/demo'); mkdirSync(skillDir, { recursive: true });
mkdirSync(join(root, '.agents/scripts'), { recursive: true }); mkdirSync(join(root, 'scripts/codex'), { recursive: true });
copyFileSync(join(repo, 'scripts/codex/native-helper-check.mjs'), join(root, 'scripts/codex/native-helper-check.mjs'));
for (const t of ['.agents/scripts/skill-lint.sh', '.agents/scripts/agent-check.sh']) copyFileSync(join(repo,t),join(root,t));
const bash = bashPath();
const wrapper = (name, args) => spawnSync(bash, [join(root, '.agents/scripts', `${name}.sh`), ...args, '--root', root], { cwd: root, encoding: 'utf8' });
writeFileSync(join(skillDir, 'SKILL.md'), '---\nname: demo\ndescription: "valid"\n---\n# Example\n');
assert.equal(node('native-helper-check.mjs', ['skill', 'demo', '--root', root]).status, 0);
assert.equal(wrapper('skill-lint', ['demo']).status, 0);
assert.equal(helper('skill-lint', ['demo']).status, 0);
writeFileSync(join(skillDir, 'SKILL.md'), '---\nname: demo\ndescription: "unclosed\n---\n# Example\n');
assert.notEqual(node('native-helper-check.mjs', ['skill', 'demo', '--root', root]).status, 0);
assert.notEqual(wrapper('skill-lint', ['demo']).status, 0);
assert.notEqual(helper('skill-lint', ['demo']).status, 0);
const roles = join(root, '.codex/agents'); mkdirSync(roles, { recursive: true });
writeFileSync(join(roles, 'demo.toml'), 'name = "demo"\ndescription = "role"\ndeveloper_instructions = "act"\n[features]\nshell_tool = false\n');
assert.equal(node('native-helper-check.mjs', ['role', '--agent', 'demo', '--root', root]).status, 0);
assert.equal(wrapper('agent-check', ['--agent', 'demo']).status, 0);
assert.equal(helper('agent-check', ['--agent', 'demo']).status, 0);
// Run the dispatcher from a separate installation beneath the OS temporary mount.
// On Git Bash this may be spelled /tmp even when Node needs a Windows path.
writeFileSync(join(skillDir, 'SKILL.md'), '---\nname: demo\ndescription: "valid"\n---\n# Example\n');
const mountedRepo=mkdtempSync(join(tmpdir(),'cgs wrapper [native] '));
for(const file of ['.agents/scripts/skill-lint.sh','.agents/scripts/agent-check.sh','scripts/codex/native-helper-check.mjs','scripts/codex/helper.mjs','scripts/codex/main-entry.mjs','scripts/codex/shell.mjs']){mkdirSync(resolve(mountedRepo,file,'..'),{recursive:true});copyFileSync(join(repo,file),join(mountedRepo,file))}
for(const [name,args] of [['skill-lint',['demo']],['agent-check',['--agent','demo']]]){
 const result=spawnSync(process.execPath,[join(mountedRepo,'scripts/codex/helper.mjs'),name,'--root',root,...args],{cwd:mountedRepo,encoding:'utf8'});
 assert.equal(result.status,0,`${name} temporary installation: ${result.stderr||result.stdout}`);
}
const invalidRoot=mkdtempSync(join(tmpdir(),'cgs selected [native] '));
mkdirSync(join(invalidRoot,'.agents/skills/demo'),{recursive:true});writeFileSync(join(invalidRoot,'.agents/skills/demo/SKILL.md'),'invalid skill\n');
mkdirSync(join(invalidRoot,'.codex/agents'),{recursive:true});writeFileSync(join(invalidRoot,'.codex/agents/demo.toml'),'invalid role\n');
for(const [name,args] of [['skill-lint',['demo']],['agent-check',['--agent','demo']]]){
 const result=spawnSync(process.execPath,[join(mountedRepo,'scripts/codex/helper.mjs'),name,'--root',invalidRoot,...args],{cwd:mountedRepo,encoding:'utf8'});
 assert.notEqual(result.status,0,`${name} must reject invalid content in selected root`);
 assert.match(result.stdout,/NOT_ASSESSED_OR_INVALID/);
}
// A symlinked installation reproduces macOS /var -> /private/var aliases.
const alias=mountedRepo+'-alias';
try {
 symlinkSync(mountedRepo,alias,process.platform==='win32'?'junction':'dir');
 for(const [name,args] of [['skill-lint',['demo']],['agent-check',['--agent','demo']]]){
  const result=spawnSync(process.execPath,[join(alias,'scripts/codex/helper.mjs'),name,'--root',invalidRoot,...args],{cwd:mountedRepo,encoding:'utf8'});
  assert.notEqual(result.status,0,`${name} must execute and reject invalid content through an installation alias`);
  assert.match(result.stdout,/NOT_ASSESSED_OR_INVALID/);
 }
} catch(error) {if(!['EPERM','EACCES','ENOTSUP'].includes(error.code))throw error;console.log('PENDING installation alias creation unavailable')}
if(process.platform==='win32'){
 const posix=spawnSync(bash,['-c','cygpath -u "$1"','fixture',root],{encoding:'utf8'});assert.equal(posix.status,0,posix.stderr);
 for(const [name,args] of [['skill-lint',['demo']],['agent-check',['--agent','demo']]]){
  const result=spawnSync(bash,[join(mountedRepo,'.agents/scripts',name+'.sh'),...args,'--root',posix.stdout.trim()],{cwd:mountedRepo,encoding:'utf8'});
  assert.equal(result.status,0,`${name} POSIX root: ${result.stderr||result.stdout}`);
 }
}
writeFileSync(join(roles, 'demo.toml'), 'name = "demo"\ndescription = "broken\n');
assert.notEqual(node('native-helper-check.mjs', ['role', '--agent', 'demo', '--root', root]).status, 0);
assert.notEqual(wrapper('agent-check', ['--agent', 'demo']).status, 0);
assert.notEqual(helper('agent-check', ['--agent', 'demo']).status, 0);
const cgs = node('cgs.mjs', ['skills', 'list']); assert.equal(cgs.status, 0); assert.match(cgs.stdout, /help/);
const noBash = spawnSync(process.execPath, [script, 'story-facts', '--root', root], { cwd: repo, env: { ...process.env, CGS_BASH: join(root, 'missing-bash') }, encoding: 'utf8' });
assert.notEqual(noBash.status, 0); assert.match(noBash.stderr, /ENOENT|spawn/i);
if (process.platform === 'win32') {
  const withoutClaude = spawnSync(process.execPath, [script, 'story-facts', '--root', root, 'story with spaces.md'], { cwd: repo, env: { ...process.env, CGS_BASH: bash, PATH: [resolve(bash, '../../usr/bin'), resolve(bash, '..')].join(';') }, encoding: 'utf8' });
  assert.equal(withoutClaude.status, 0, withoutClaude.stderr); assert.match(withoutClaude.stdout, /STORY/);
}
console.log(`PASS: stage, checkpoint, story/ADR facts, registry, receipt stamp, read/write observations, missing engine, native structural failures, dispatcher; fixture ${root}`);
