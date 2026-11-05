// Fixture-only logic/integration evidence. No rendered UI or engine claim.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHealth} from '../src/gameplay/health.mjs';
import {projectHealth,requestGuard} from '../src/ui/guard-hud.mjs';
const config=JSON.parse(readFileSync(new URL('../config/health.json',import.meta.url)));
const health=createHealth(config);
assert.equal(health.snapshot().health,config.maxHealth);
health.damage(25);assert.equal(health.snapshot().health,75);
for(const amount of [-1,NaN,Infinity,'5']){assert.throws(()=>health.damage(amount));assert.equal(health.snapshot().health,75);}
const snapshot=health.snapshot();assert.throws(()=>{snapshot.health=999});assert.equal(health.snapshot().health,75);
let localizationCall;const view=projectHealth(snapshot,(key,args)=>{localizationCall={key,args};return `${args.current}/${args.maximum}`});
assert.equal(view.label,'75/100');assert.equal(localizationCall.key,'hud.health');assert.deepEqual(localizationCall.args,{current:75,maximum:100});
const events=[];for(const input of ['keyboard','gamepad'])requestGuard(input,e=>events.push(e));
assert.deepEqual(events.map(e=>e.type),['guard-requested','guard-requested']);assert.equal(health.snapshot().health,75);
assert.throws(()=>requestGuard('unknown',()=>{}));
health.damage(10000);assert.equal(health.snapshot().health,0);
assert.equal(snapshot.health,75,'previous snapshots remain stable');
console.log('PASS: health ownership, invalid inputs, clamping, immutable snapshots, localization and action-event routing');
