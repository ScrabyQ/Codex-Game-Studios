import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const dir = 'docs/codex/evidence/CGS-07/';
const coordination = JSON.parse(readFileSync(dir + 'native-coordination.json', 'utf8'));
const small = JSON.parse(readFileSync(dir + 'small-task.json', 'utf8'));
for (const evidence of [coordination, small]) {
  assert.equal(evidence.exit_code, 0);
  assert.equal(evidence.result, 'PASS');
  assert.equal(evidence.changed_files.length, 0);
  assert(/not independent|non-independent/i.test(evidence.response));
  assert(!evidence.tool_trace.some(e => /collab|spawn_agent/i.test(e.item?.type || '')), 'Expected no child-agent calls in explicit fallback evidence');
}
const commands = coordination.tool_trace.filter(e => e.type === 'item.completed' && e.item?.type === 'command_execution' && e.item.exit_code === 0);
for (const name of ['technical-director', 'producer']) assert(commands.some(e => e.item.command.includes(`.codex/agents/${name}.toml`)), `Role not actually read: ${name}`);
assert(/5[- ]day|5 days/i.test(coordination.response));
assert(/user.*(final decision|approves)/i.test(coordination.response));
assert(/no delegation/i.test(small.response));
assert(small.tool_trace.some(e => e.type === 'item.completed' && e.item?.exit_code === 0 && e.item.command?.includes('.codex/agents/producer.toml')));
const result = {
  schema: 1, task: 'CGS-07', classification: 'EQUIVALENT',
  checks: [
    { name: 'Native CLI executes two-role in-session coordination', result: 'PASS', evidence: dir + 'native-coordination.json' },
    { name: 'Role files actually read through successful tool calls', result: 'PASS' },
    { name: 'Five-day feasibility gap and user-owned final decision retained', result: 'PASS' },
    { name: 'Small task explains no delegation; no child calls or file changes', result: 'PASS', evidence: dir + 'small-task.json' },
    { name: 'Fallback truthfully labelled not independent', result: 'PASS' },
    { name: 'Native custom role discovery and spawning', result: 'PENDING', reason: 'Model reported only generic/default/worker types; no custom-role spawn was observed. No global trust settings were changed.' },
    { name: 'Native creative-role shell capability enforcement', result: 'PENDING', reason: 'TOML field is documented and parses, but no custom role was loaded to establish runtime enforcement. Role capability ceilings remain instruction-level in fallback.' }
  ],
  limitations: ['Only the two recorded scenarios were executed; full upstream behavioral specifications for all 11 roles remain PENDING.', 'Generic worker with full role instructions can be an independent alternative only after an actual child spawn is observed.', 'Permission inheritance and user authorization remain governed by the active host; source tool scopes are not native per-tool allowlists.']
};
writeFileSync(dir + 'behavior-checks.json', JSON.stringify(result, null, 2) + '\n');
console.log('PASS: observed role reads, quantified coordination, no writes/delegation, honest fallback; native role discovery/enforcement PENDING');
