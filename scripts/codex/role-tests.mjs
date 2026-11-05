import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { LEADERSHIP_ROLES, roleTargets, parseRoleSource, adaptRoleBody } from './roles-generation.mjs';

const root = resolve('.'), plans = roleTargets(root);
const hash = x => createHash('sha256').update(x).digest('hex');
assert.equal(plans.length, 11);
const rows = [];
for (const plan of plans) {
  const generated = readFileSync(join(root, plan.target), 'utf8');
  assert.equal(generated, plan.content.toString());
  const properties = {};
  for (const line of generated.split('\n')) {
    if (/^(name|description|developer_instructions) = /.test(line)) {
      const [key, ...rest] = line.split(' = ');
      properties[key] = JSON.parse(rest.join(' = '));
    }
  }
  const source = readFileSync(join(root, plan.source), 'utf8').replace(/\r\n?/g, '\n');
  const { fields, body } = parseRoleSource(source, plan.source);
  assert.equal(properties.name, fields.name);
  assert.equal(properties.description, fields.description);
  const instructions = properties.developer_instructions;
  const sourceHeadings = body.match(/^#{1,6} .*$/gm);
  for (const heading of sourceHeadings) assert(instructions.includes(heading), `Lost heading: ${fields.name}: ${heading}`);
  const adaptedBody = instructions.split('## Adapted source role\n\n')[1];
  // Every original body character remains accounted for by explicit transforms;
  // this check compares the whole body, not a handful of identity tokens.
  const inventory = JSON.parse(readFileSync(join(root, 'docs/codex/upstream-inventory.json'), 'utf8'));
  const skillNames = inventory.files.filter(x => /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(x.path)).map(x => x.path.split('/')[2]);
  assert.equal(adaptedBody, adaptRoleBody(body, skillNames).body);
  for (const token of ['prior user authorization persists', 'not independent', 'advisory planning guidance', 'responsibility limits', 'expected output', 'escalation conditions']) assert(instructions.toLowerCase().includes(token), `${fields.name}: ${token}`);
  assert(!/^(model|maxTurns|tools|memory|skills|sandbox_mode|approval_policy)\s*=/m.test(generated));
  assert(!/AskUserQuestion|\.claude\//.test(instructions));
  assert.equal(generated.includes('shell_tool = false'), fields.disallowedTools === 'Bash');
  rows.push({ source: plan.source, source_sha256: plan.source_sha256, target: plan.target, target_sha256: hash(plan.content), source_body_characters: body.length, adapted_body_characters: adaptedBody.length, headings_preserved: sourceHeadings.length, shell_disabled: fields.disallowedTools === 'Bash', result: 'PASS' });
}
assert.throws(() => roleTargets(root, ['missing-role']), /Unknown role/);
assert.throws(() => roleTargets(root, [LEADERSHIP_ROLES[0], LEADERSHIP_ROLES[0]]), /duplicates/);
assert.throws(() => parseRoleSource('---\nname: fake\nunknown: true\n---\nbody', 'negative.md'), /Unknown or malformed/);
// A mutated source fixture must fail the hash guard. No source repository file is changed.
const scratch = mkdtempSync(join(tmpdir(), 'cgs07-role-'));
mkdirSync(join(scratch, 'docs/codex'), { recursive: true });
mkdirSync(join(scratch, '.claude/agents'), { recursive: true });
writeFileSync(join(scratch, 'docs/codex/upstream-inventory.json'), readFileSync(join(root, 'docs/codex/upstream-inventory.json')));
// Full role set is required by the source-set guard, so include all definitions.
const inventory = JSON.parse(readFileSync(join(root, 'docs/codex/upstream-inventory.json'), 'utf8'));
for (const file of inventory.files.filter(x => /^\.claude\/agents\/[^/]+\.md$/.test(x.path))) writeFileSync(join(scratch, file.path), readFileSync(join(root, file.path)));
const { execFileSync } = await import('node:child_process');
execFileSync('git', ['init', '--quiet'], { cwd: scratch });
writeFileSync(join(scratch, '.claude/agents/technical-director.md'), readFileSync(join(scratch, '.claude/agents/technical-director.md'), 'utf8') + '\nUnauthorized source mutation\n');
assert.throws(() => roleTargets(scratch, ['technical-director']), /Source drift/);
const evidence = { schema: 1, task: 'CGS-07', runtime: process.version, generated_roles: rows, negative_tests: ['Unknown role rejected', 'Duplicate role rejected', 'Unknown source metadata rejected', 'Mutated source rejected'], result: 'PASS', scope: 'Deterministic full-body transformation and source integrity checks only; actual native loading/delegation has separate evidence.' };
console.log('PASS: 11 roles, complete transformed bodies/headings, capability restrictions, no model pins; 4 negative guards');
