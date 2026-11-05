#!/usr/bin/env node
/** Deterministic, non-destructive Codex mirror for upstream reference documents. */
import { execFileSync } from 'node:child_process';
import { isMainEntry } from './main-entry.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSource } from './source.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OWNER = 'CGS-26';

const BRIDGES = {
  'config-resolution.md': `> **Codex bridge (CGS-26):** The shell-prefixed bang-backtick preprocessing described below is Claude Code behavior. Codex Skills do not run that preprocessing. Read configuration through the registered Codex helper or by following the documented resolver chain explicitly; any command execution and file write remains subject to the active Codex permission decision. When a question is needed, use a question facility actually available in the current client; otherwise ask in plain text and wait. Do not infer approval from automation mode. The resolver schema, precedence, defaults, provenance, and safety rules below remain authoritative.\n\n`,
  'model-tiers.md': `> **Codex bridge (CGS-26):** The tier tables and model aliases below document the source Claude runtime and are retained as migration rationale. Codex adaptations must not carry Claude model pins or aliases into native role configuration. Use the repository model policy to map task tiers to explicitly available Codex models and effort; if the requested capability is unavailable or unverified, inherit the session default and record the fallback.\n\n`,
  'coordination-rules.md': `> **Codex bridge (CGS-26):** The Agent tool and Claude Agent Teams behavior below describe the source runtime. In Codex, delegate through native subagents when that capability is available and appropriate; otherwise read the role instructions and perform the work in-session, disclosing that this is not an independent review. Do not claim independent parallel review without separate agents. Retain the coordination, ownership, escalation, and conflict rules in this document.\n\n`,
  'quick-start.md': `> **Codex bridge (CGS-26):** This document describes the original Claude Code studio. In Codex, follow the repository AGENTS.md entrypoint and invoke installed Skills through the current client's supported discovery mechanism. Role delegation uses native subagents where available or an explicit in-session fallback. Claude-specific tools, settings, and model aliases in the source guide are not Codex capabilities.\n\n`,
  'automation-modes.md': `> **Codex bridge (CGS-26):** AskUserQuestion is a Claude client feature. A Codex adaptation may use a question tool only when the active client actually exposes one; otherwise ask the same decision in plain text and wait for the user's answer. Mode policy can reduce routine questions, but it never supplies user consent or overrides Codex permissions and approvals. Preserve every mode's decision categories and write/approval boundaries.\n\n`,
  'agent-teams.md': `> **Codex bridge (CGS-26):** Claude Agent Teams are not implied by this reference mirror. Use native Codex subagents only when available; otherwise execute sequentially in-session and state that no independent team review occurred. The source's ownership, coordination, and escalation requirements still apply.\n\n`,
  'hooks-reference.md': `> **Codex bridge (CGS-26):** The event names, payloads, and registration examples below describe the upstream hook system. Codex hooks are a separate opt-in integration and must use verified Codex event payload schemas. Until a matching event is implemented and behaviorally checked, follow the documented manual or CLI fallback; do not treat an upstream hook declaration as active in Codex.\n\n`,
  'setup-requirements.md': `> **Codex bridge (CGS-26):** Requirements below are for the upstream Claude Code setup. Codex-specific prerequisites and supported commands are documented by the project onboarding. Keep any engine, utility, and data-format requirements that apply to the game project; do not infer that Claude-specific prerequisites configure Codex.\n\n`,
  'context-management.md': `> **Codex bridge (CGS-26):** Claude-only tools and dynamic skill preprocessing referenced below are not available by implication in Codex. Read the project checkpoint and referenced files explicitly; use an actually available question facility or plain-text question-and-wait for gated decisions. Preserve user approval and write-permission requirements across compaction or recovery.\n\n`,
  'error-recovery-protocol.md': `> **Codex bridge (CGS-26):** Replace source-runtime question widgets with a question facility available in the active Codex client, or ask in plain text and wait. Recovery and retry must retain the original approval boundary; an automation mode or previous partial step is not consent for a new write.\n\n`,
};
const PATH_BRIDGE = `> **Codex path bridge (CGS-26):** Paths below that begin with .claude/skills/, .claude/scripts/, or .claude/hooks/ describe the preserved upstream source layout. For Codex runtime use, resolve corresponding adapted resources under .agents/skills/, .agents/scripts/, and .agents/hooks/. Hook paths are helper files only; Codex hook registration remains separate, opt-in, and subject to payload verification. Explicit legacy examples remain useful for upstream comparison.\n\n`;

const DOC_PATH_RE = /\.claude\/docs\//g;

function git(args, root = ROOT) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function listSourcePaths(root = ROOT) {
  return git(['ls-files', '-z', '--', '.claude/docs'], root).split('\0').filter(Boolean).sort();
}

function normalizeLf(text) {
  return text.replace(/\r\n?/g, '\n');
}

/**
 * Return deterministic source-to-target plans for all tracked .claude/docs files.
 * Content adaptations are additive except for links that name the old docs root.
 */
export async function referenceTargets({ root = ROOT, source: gitSource = openSource({root}) } = {}) {
  const plans = [];
  for (const source of gitSource.list('.claude/docs/').map(f=>f.path).sort()) {
    const bytes = gitSource.read(source);
    let content = normalizeLf(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    const transform_ids = [];
    if (DOC_PATH_RE.test(content)) {
      content = content.replace(DOC_PATH_RE, '.agents/docs/');
      transform_ids.push('codex-doc-reference-paths-v1');
    }
    const basename = path.posix.basename(source);
    if (BRIDGES[basename]) {
      content = BRIDGES[basename] + content;
      transform_ids.push(`codex-runtime-bridge-${basename.replace(/\.[^.]+$/, '')}-v1`);
    }
    if (!source.includes('/templates/') && /\.claude\/(?:scripts|skills|hooks)\//.test(content)) {
      content = PATH_BRIDGE + content;
      transform_ids.push('codex-runtime-path-bridge-v1');
    }
    const relative = source.replace(/^\.claude\/docs\//, '');
    plans.push({
      source,
      target: `.agents/docs/${relative}`,
      content: content.endsWith('\n') ? content : `${content}\n`,
      transform_ids,
      owner: OWNER,
    });
  }
  const brief = plans.find((plan) => plan.target === '.agents/docs/templates/patch-notes-brief.md');
  if (!brief) throw new Error('Required upstream patch-notes-brief.md source is missing');
  plans.push({
    source: '.claude/docs/templates/patch-notes-brief.md',
    target: '.agents/docs/templates/patch-notes-template.md',
    content: brief.content,
    transform_ids: ['codex-conditional-template-alias-v1'],
    owner: OWNER,
  });
  const skillContractSource = '.claude/docs/templates/SKILL-CONTRACT-TEMPLATE.md';
  plans.push({
    source: skillContractSource,
    target: '.agents/docs/templates/SKILL-CONTRACT-TEMPLATE-codex.md',
    content: `# Codex Skill Authoring Contract\n\nThis compact contract is for a new Codex Skill. Use only frontmatter fields supported by the current Codex Skills specification. The minimal example below uses the required identity fields; add optional fields only after checking that specification. The preserved upstream Claude contract remains alongside this file as a source example.\n\n## Minimal supported frontmatter\n\n~~~yaml\n---\nname: [skill-name]\ndescription: [one sentence describing when to use this skill]\n---\n~~~\n\n## Authoring contract\n\n- State the skill's purpose, trigger conditions, and boundaries in SKILL.md body text.\n- Preserve its required inputs, outputs, checks, and approval boundaries.\n- Keep referenced resources inside the skill directory or use stable repository paths.\n- Do not assume dynamic shell preprocessing, Claude-specific tools, hooks, or model pins.\n- For questions, use a facility exposed by the active client; otherwise ask in plain text and wait.\n- Request only permissions needed for the documented workflow.\n- Validate the skill with the current Codex tooling and record runtime evidence separately from structural review.\n`,
    transform_ids: ['codex-skill-authoring-template-v1'],
    owner: OWNER,
  });
  return plans;
}

async function writeAbsent(plans) {
  const divergent = [];
  const missing = [];
  let created = 0;
  for (const plan of plans) {
    const targetPath = path.join(ROOT, plan.target);
    let existing;
    try {
      existing = await readFile(targetPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (existing !== undefined) {
      if (normalizeLf(existing) !== plan.content) divergent.push(plan.target);
      continue;
    }
    missing.push({ plan, targetPath });
  }
  if (divergent.length) {
    throw new Error(`Refusing to overwrite ${divergent.length} existing divergent target(s):\n${divergent.join('\n')}`);
  }
  for (const { plan, targetPath } of missing) {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, plan.content, { encoding: 'utf8', flag: 'wx' });
    created++;
  }
  return created;
}

async function main() {
  const args = process.argv.slice(2);
  const plans = await referenceTargets();
  if (args.length === 1 && args[0] === '--write') {
    const created = await writeAbsent(plans);
    process.stdout.write(`planned=${plans.length} created=${created} owner=${OWNER}\n`);
    return;
  }
  if (args.length === 1 && args[0] === '--json') {
    process.stdout.write(`${JSON.stringify(plans, null, 2)}\n`);
    return;
  }
  if (args.length === 0 || (args.length === 1 && args[0] === '--check')) {
    process.stdout.write(`planned=${plans.length} owner=${OWNER}\n`);
    for (const plan of plans) process.stdout.write(`${plan.source} -> ${plan.target}${plan.transform_ids.length ? ` [${plan.transform_ids.join(',')}]` : ''}\n`);
    return;
  }
  process.stderr.write('Usage: node scripts/codex/reference-generation.mjs [--check|--json|--write]\n');
  process.exitCode = 2;
}

if (isMainEntry(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
