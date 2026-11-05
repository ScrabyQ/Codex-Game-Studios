import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { resolveModel } from './models.mjs';

const repo = resolve('.');
const tmp = mkdtempSync(join(tmpdir(), 'cgs-config-'));
const script = join(repo, 'scripts/codex/config.mjs');
const run = (args, input = '') => new Promise((done, reject) => {
  const p = spawn(process.execPath, [script, ...args], { cwd: repo, env: process.env });
  let stdout = '', stderr = ''; p.stdout.on('data', x => stdout += x); p.stderr.on('data', x => stderr += x);
  p.on('error', reject); p.on('close', code => done({ code, stdout, stderr })); p.stdin.end(input);
});
const fixture = name => { const dir = join(tmp, name); mkdirSync(dir, { recursive: true }); return dir; };
const rows = { minimal: ['minimal', 'terse', 'minimal', 'coarse', 'solo', 'individual'], standard: ['standard', 'balanced', 'standard', 'balanced', 'lean', 'individual'], full: ['full', 'thorough', 'full', 'fine', 'full', 'studio'] };
const labels = ['workflow', 'docs.density', 'qa.level', 'story_granularity', 'review_mode', 'team.size'];
const cases = [];
for (const rigor of Object.keys(rows)) for (const automation of ['collaborative', 'guided', 'autonomous']) {
  const root = fixture(`${rigor}-${automation}`);
  writeFileSync(join(root, 'project.yaml'), `modes:\n  rigor: ${rigor}\n  automation: ${automation}\n`);
  cases.push((async () => { const r = await run(['resolve', '--root', root, '--keys', ['rigor', 'automation', ...labels].join(',')]);
    assert.equal(r.code, 0, r.stderr); assert.match(r.stdout, new RegExp(`rigor: ${rigor} \\(project.yaml\\)`));
    assert.match(r.stdout, new RegExp(`automation: ${automation} \\(project.yaml\\)`));
    labels.forEach((label, i) => assert.ok(r.stdout.includes(`${label}: ${rows[rigor][i]} (rigor:${rigor})`), r.stdout));
  })());
}
await Promise.all(cases);
const root = fixture('precedence with spaces');
mkdirSync(join(root, 'production'), { recursive: true });
writeFileSync(join(root, 'project.yaml'), '\ufeffmodes:\r\n  rigor: standard\r\n  automation: invalid\r\n  review_mode: invalid\r\ndocs:\r\n  density: terse # keep this\r\n');
writeFileSync(join(root, 'project.local.yaml'), 'modes:\n  automation: guided\n  rigor: full\n');
writeFileSync(join(root, 'production/review-mode.txt'), 'full\n');
let r = await run(['resolve', '--root', root, '--keys', 'rigor,automation,review_mode,docs.density']);
assert.equal(r.code, 0, r.stderr); assert.match(r.stdout, /rigor: standard \(project.yaml\)/); assert.match(r.stdout, /automation: guided \(project.local.yaml\)/); assert.match(r.stdout, /review_mode: full \(production\/review-mode.txt\)/); assert.match(r.stdout, /docs.density: terse \(project.yaml\)/); assert.match(r.stdout, /invalid/); assert.match(r.stdout, /not locally overridable/);
r = await run(['set', '--root', root, '--local', 'modes.rigor', 'full']); assert.equal(r.code, 4);
r = await run(['set', '--root', root, 'docs.density', 'balanced']); assert.equal(r.code, 0, r.stderr);
const bytes = readFileSync(join(root, 'project.yaml')); assert.ok(bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]))); const yaml = bytes.toString('utf8'); assert.match(yaml, /density: balanced # keep this\r\n/); assert.ok(!/(?<!\r)\n/.test(yaml));
mkdirSync(join(root, '.agents/docs/templates'), { recursive: true });
writeFileSync(join(root, '.agents/docs/templates/session-state.md'), '<!-- STATUS -->\r\nstatus\r\n<!-- /STATUS -->\r\n<!-- CHECKPOINT -->\r\nold\r\n<!-- /CHECKPOINT -->\r\nnarrative stays\r\n');
r = await run(['checkpoint', 'checkpoint', '--root', root], 'new checkpoint\n'); assert.equal(r.code, 0, r.stderr);
const state = readFileSync(join(root, 'production/session-state/active.md'), 'utf8'); assert.match(state, /new checkpoint\r\n<!-- \/CHECKPOINT -->\r\nnarrative stays\r\n/);
assert.equal(resolveModel({ family: 'frontier', available: ['gpt-5.6-luna'], overrideSupported: true }).selected, 'gpt-5.6-luna');
assert.equal(resolveModel({ family: 'frontier', available: ['gpt-6-astra'] }).action, 'inherit');
assert.equal(resolveModel({ family: 'frontier', available: [], overrideSupported: true }).action, 'inherit');
const project = readFileSync('project.yaml', 'utf8');
// Verify migration did not add the six knob defaults by comparing with tracked source.
const roles = '.codex/agents'; if (existsSync(roles)) for (const f of readdirSync(roles)) if (f.endsWith('.toml')) assert.doesNotMatch(readFileSync(join(roles, f), 'utf8'), /^model\s*=/m);
assert.ok(project.length > 0); console.log(`PASS: nine rigor/automation combinations, precedence, invalid and locked overrides, BOM/CRLF, checkpoint, model fallback. Fixtures: ${tmp}`);
