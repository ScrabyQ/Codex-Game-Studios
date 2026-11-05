// Synthetic input preparation and real helper/test execution, not an agent runtime.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {runHelper} from '../../../../scripts/codex/helper.mjs';
export const base=path.resolve('docs/codex/evidence/CGS-22'),fixture=path.join(base,'fixture');
export function put(relative,content){const file=path.join(base,relative);if(!file.startsWith(base+path.sep))throw Error('Out of evidence scope');const text=typeof content==='string'?content:JSON.stringify(content,null,2)+'\n';const payload=JSON.stringify({tool_name:'Write',tool_input:{file_path:file,content:text}});for(const event of ['PreToolUse','PostToolUse']){if(event==='PostToolUse'){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);}const r=spawnSync(process.execPath,['scripts/codex/hooks.mjs',event,'--root','.'],{input:payload,encoding:'utf8'});if(r.status!==0)throw Error(event+': '+r.stderr+r.stdout);}}
export const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(process.argv[1]?.endsWith('prepare-fixture.mjs')){
put('fixture/brief.md','# Synthetic authorized test brief\nAll artifacts are isolated test material. CGS22 authorizes these bounded fixture writes and checks, not canon changes, production fixes, deployments, publication or external tasks. In-session roles are sequential and not independent. Scope: feature: combat, release v0.0.22-fixture, narrative memory-vault, live-ops season 1. No game engine, build, live telemetry or human UI tester is supplied.\n');
put('fixture/project.yaml','project:\n  name: CGS22 fixture\n  stage: Release\nmodes:\n  rigor: full\n  automation: collaborative\nteam:\n  size: small\nplatform:\n  online: false\n  multiplayer: false\n');
put('fixture/design/narrative/canon.md','# Canon supplied as fixture input\nEstablished pillar: lost memories cannot be restored by magic. Records can preserve a surviving fragment. Tone: restrained melancholy. Archivist Mara is precise, never promises impossible healing. No existing mystery changes this rule.\n');
put('fixture/production/narrative/memory-vault/writer-draft.md','# Writer draft supplied as conflicting input\nString key: memory_vault.promise\nMara: This spell restores every lost memory, {player_name}.\nIntent: emotional payoff. Proposed as literal truth, not unreliable narration.\n');
put('fixture/production/narrative/memory-vault/world-builder-draft.md','# World-builder input\nEstablished canon forbids restoration. The vault contains only surviving records, not lost memories. Contradiction: writer draft promises literal restoration. Recommend a discovered surviving fragment. Shared parent: narrative-director.\n');
put('fixture/design/live-ops/economy-rules.md','# Fixture ethics policy\nPremium rewards must be cosmetic only. Paid combat power or competitive advantage is prohibited.\n');
put('fixture/production/live-ops/season-1/economy-input.md','# Proposed economy input\nPremium pass costs 500 credits and grants +20% damage in ranked combat. Free track grants a banner. This is a proposal, not a live economy.\n');
put('fixture/production/live-ops/season-1/analytics-input.md','# Analytics input\nProposed events: season_start, reward_claim. No instrumented build, dashboard or test account supplied. Verification capability PENDING: analytics-engineer cannot verify delivery against an absent fixture endpoint. Do not query unrelated connected services.\n');
put('fixture/production/epics/combat/story-001.md','# Damage normalization\n**Status**: In Review\n**Type**: Logic\n**System**: Combat\n**Owner**: gameplay-programmer\nAcceptance: negative damage never increases health; positive damage lowers health to a minimum of zero.\n');
put('fixture/production/epics/combat/story-002.md','# Combat HUD\n**Status**: In Review\n**Type**: UI\n**System**: Combat\n**Owner**: ui-programmer\nAcceptance: health is readable at 200% scaling. No build, screenshot or human answer supplied.\n');
put('fixture/production/qa/bugs/BUG-0002.md','# Older unrelated result\n**Severity**: S3-Medium\n**Priority**: P2-Fix soon\n**System**: Combat\n**Status**: Closed\n');
put('fixture/production/qa/smoke-fixture.md','# Supplied scenario input, not a measured build result\nVerdict: PASS\nThe test scenario assumes smoke passed; CGS22 has not tested a game build.\n');
put('fixture/src/damage.mjs','// Deliberately faulty synthetic input. QA must not fix it.\nexport function damage(health, amount) { return Math.max(0, health - amount); }\n');
put('fixture/tests/damage.test.mjs',"import assert from 'node:assert/strict';\nimport {damage} from '../src/damage.mjs';\nassert.equal(damage(10,3),7);\nassert.equal(damage(10,20),0);\nassert.equal(damage(10,-5),10,'negative damage must not increase health');\n");
put('input-hashes.json',{damage:sha(path.join(fixture,'src/damage.mjs')),canon:sha(path.join(fixture,'design/narrative/canon.md')),writer:sha(path.join(fixture,'production/narrative/memory-vault/writer-draft.md'))});
const configs=[];
for(const mode of ['collaborative','guided','autonomous']){
 const modeRoot=path.join(fixture,'modes',mode);
 put('fixture/modes/'+mode+'/project.yaml','project:\n  name: CGS22 '+mode+'\n  stage: Polish\nmodes:\n  rigor: full\n  automation: '+mode+'\n');
 const r=runHelper('yaml-helper',['resolve_config','--keys','review_mode,automation,team.size,workflow,qa.level,project.stage'],modeRoot,'pipe');
 configs.push({mode,exit_code:r.status,stdout:r.stdout,stderr:r.stderr});
}
const r=runHelper('yaml-helper',['resolve_config','--keys','review_mode,automation,team.size,workflow,qa.level,project.stage'],fixture,'pipe');
put('config-observations.json',{main:{exit_code:r.status,stdout:r.stdout,stderr:r.stderr},modes:configs});
const test=spawnSync(process.execPath,[path.join(fixture,'tests/damage.test.mjs')],{encoding:'utf8'});
put('qa-test-run.json',{command:'node docs/codex/evidence/CGS-22/fixture/tests/damage.test.mjs',exit_code:test.status,stdout:test.stdout,stderr:test.stderr,damage_sha256:sha(path.join(fixture,'src/damage.mjs'))});
console.log(JSON.stringify({fixture,config_exits:[r.status,...configs.map(c=>c.exit_code)],expected_failing_test_exit:test.status,stderr:test.stderr}));
}
