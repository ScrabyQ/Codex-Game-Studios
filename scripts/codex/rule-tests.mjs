import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectRules } from './rules.mjs';
const cases = {
  'agent-memory': ['.agents/agent-memory/designer/notes.md', '.agents/skills/design/SKILL.md'],
  'ai-code': ['Assets/Game/AI/Brain.cs', 'Assets/Game/Audio/Brain.cs'],
  'data-files': ['Content/World/Data/items.json', 'Content/World/Data/items.csv'],
  'design-docs': ['design/gdd/combat.md', 'design/narrative/combat.md'],
  'engine-code': ['Source/Game/Core/Engine.cpp', 'Source/Game/Gameplay/Engine.cpp'],
  'gameplay-code': ['Assets/Gameplay/Hero.cs', 'Assets/Core/Hero.cs'],
  'narrative': ['design/narrative/lore.md', 'design/gdd/lore.md'],
  'network-code': ['Source/Game/Network/Packet.h', 'Source/Game/Audio/Packet.h'],
  'prototype-code': ['prototypes/demo/main.gd', 'src/demo/main.gd'],
  'scene-files': ['scenes/main.tscn', 'scenes/main.gd'],
  'shader-code': ['assets/effects/water.gdshader', 'assets/effects/water.png'],
  'skill-authoring': ['.codex/agents/writer.toml', '.agents/docs/writer.md'],
  'test-standards': ['Source/Game/Tests/example.cpp', 'Source/Game/Core/example.cpp'],
  'ui-code': ['Assets/UI/Menu.cs', 'Assets/Gameplay/Menu.cs']
};
const index = JSON.parse(readFileSync('.agents/rules/index.json', 'utf8'));
assert.equal(index.schema,1);assert.ok(index.rules.length>0);
for (const [id, [yes, no]] of Object.entries(cases)) {
  assert.ok(selectRules(yes).some(r => r.id === id), `${id} positive ${yes}`);
  assert.ok(!selectRules(no).some(r => r.id === id), `${id} negative ${no}`);
}
assert.ok(selectRules('Assets\\UI\\Menu.cs').some(r => r.id === 'ui-code'));
assert.ok(selectRules('main.tscn').some(r => r.id === 'scene-files'));
assert.ok(selectRules('Assets/UI/Menu.cs').some(r => r.id === 'ui-code'));
assert.ok(!selectRules('assets/UI/Menu.cs').some(r => r.id === 'ui-code'));
assert.ok(selectRules('Source/A/Tests/UI/Menu.cpp').some(r => r.id === 'ui-code'));
assert.ok(selectRules('Source/A/Tests/UI/Menu.cpp').some(r => r.id === 'test-standards'));
assert.throws(() => selectRules('../project.yaml')); assert.throws(() => selectRules('C:\\project.yaml'));
for (const rule of index.rules) assert.ok(readFileSync(rule.target, 'utf8').trim(), rule.target);
console.log(`PASS: ${index.rules.length} native rules, positive and negative scope cases, overlap, globstar, braces, Windows slashes, case sensitivity and path rejection.`);
