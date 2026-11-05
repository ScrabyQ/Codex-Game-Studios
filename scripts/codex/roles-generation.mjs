import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { openSource } from './source.mjs';
import { safeProjectPath } from './safe-path.mjs';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const LEADERSHIP_ROLES = Object.freeze([
  'creative-director', 'technical-director', 'producer', 'game-designer',
  'lead-programmer', 'art-director', 'audio-director', 'narrative-director',
  'qa-lead', 'release-manager', 'localization-lead',
]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const utf = bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/\r\n?/g, '\n');
const plain = value => value.startsWith('"') ? JSON.parse(value) : value;
// JSON basic strings are valid TOML basic strings for these fields. Escape DEL,
// which JSON permits literally but TOML forbids. Never interpolate raw quotes.
const tomlString = value => JSON.stringify(value).replace(/\u007f/g, '\\u007f');

export function parseRoleSource(text, source) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) throw Error(`Malformed role frontmatter: ${source}`);
  const fields = {};
  const allowed = new Set(['name', 'description', 'tools', 'model', 'maxTurns', 'memory', 'skills', 'disallowedTools', 'effort', 'isolation']);
  for (const line of match[1].split('\n')) {
    if (/^\s*#/.test(line)) continue;
    const m = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!m || !allowed.has(m[1]) || Object.hasOwn(fields, m[1])) throw Error(`Unknown or malformed role field: ${source}: ${line}`);
    fields[m[1]] = plain(m[2]);
  }
  if (!fields.name || !fields.description || !fields.tools) throw Error(`Missing required source role metadata: ${source}`);
  if (fields.maxTurns && !/^\d+$/.test(fields.maxTurns)) throw Error(`Invalid source turn budget: ${source}`);
  if (fields.isolation && fields.isolation !== 'worktree') throw Error(`Unsupported source isolation: ${source}`);
  return { fields, body: text.slice(match[0].length) };
}

export function adaptRoleBody(body, skillNames = []) {
  const ids = [];
  const rewrite = (id, regex, replacement) => {
    const next = body.replace(regex, replacement);
    if (next !== body) ids.push(id);
    body = next;
  };
  rewrite('role-question-routing-v1', /`AskUserQuestion` is not in your `tools:` grant, so whoever called you presents\nyour decisions\./g,
    'When delegated, return required user decisions to the caller. The caller uses an available native user-question facility, or asks in plain text and waits. When acting directly, ask through that same available facility.');
  rewrite('role-question-name-v1', /\bAskUserQuestion\b/g, 'available native user-question facility (or plain-text question and wait)');
  rewrite('role-file-tools-v1', /Write\/Edit/g, 'file-write tools');
  rewrite('role-reference-paths-v1', /\.claude\/(docs|scripts|hooks|skills|agent-memory|rules)\//g, '.agents/$1/');
  rewrite('role-native-role-paths-v1', /\.claude\/agents\/([a-z0-9-]+)\.md/g, '.codex/agents/$1.toml');
  rewrite('role-instructions-path-v1', /\bCLAUDE\.md\b/g, 'AGENTS.md');
  rewrite('role-native-delegation-v1', /\bAgent tool\b/g, 'available native delegation facility');
  rewrite('role-native-skill-invocation-v1', /(?<![\w./])\/([a-z][a-z0-9-]*)/g,
    (whole, name) => skillNames.includes(name) ? `$${name}` : whole);
  return { body, transform_ids: ids };
}

function roleBridge(fields) {
  const allowed = fields.tools.split(/,\s*/);
  const denied = (fields.disallowedTools || '').split(/,\s*/).filter(Boolean);
  const shell = allowed.includes('Bash') && !denied.includes('Bash');
  const skills = (fields.skills || '').replace(/^\[|\]$/g, '').split(/,\s*/).filter(Boolean);
  return `## Codex role execution contract\n\n` +
    `This role inherits the parent's permissions and model. No source model or turn-limit metadata is a Codex configuration setting. Resolve model policy through .codex/model-policy.json using capabilities actually available to this host/account; do not assume host collaboration model IDs work in the CLI.\n\n` +
    `The source capability ceiling is: ${allowed.join(', ')}.${denied.length ? ` Source exclusions: ${denied.join(', ')}.` : ''} These are responsibility limits, not permission grants or a claim of native per-tool allowlists. Map Read/Glob/Grep to available read/search facilities and Write/Edit to authorized file editing. ${shell ? 'Shell work is allowed only within the assigned task and inherited permissions.' : 'Do not execute shell commands, including through another tool. If no permitted file-reading tool exists, request the necessary file contents from the caller and report missing evidence.'} ${allowed.includes('WebSearch') ? 'Use available web research only when relevant and permitted.' : 'Do not perform web research for this role; ask the caller for needed external evidence.'}\n\n` +
    `Prior user authorization persists. Interpret the source approval workflow below in that context: do not repeat permission requests for an already authorized action; obtain a reviewable decision only for unresolved choices or actions outside authorization. Required unanswered questions are not consent. Source examples of publishing, messaging, tagging, committing, or deployment describe responsibilities, never permission to perform external actions.\n\n` +
    `Before delegation, explain the concrete need for another perspective or independent work. For a small bounded task, work directly and briefly state why no delegation is needed. Never launch the full hierarchy by default. When authorized native delegation and the requested role are available, pass a bounded brief: objective, relevant inputs, owned paths, non-goals, inherited permissions, expected output, evidence criteria, and escalation conditions. If unavailable, read the role definition and disclose "in-session role review; not independent"; do not claim another agent ran. Escalate missing capabilities or decisions to the caller.\n\n` +
    `Return findings, evidence and its limits, changed paths if any, unresolved decisions, and a concrete handoff. Preserve the source gate-specific first-line verdict when applicable; NOT ASSESSED is required where necessary evidence could not be assessed. Do not silently approve missing evidence or change domain ownership.\n\n` +
    `${fields.maxTurns ? `The source suggests a ${fields.maxTurns}-turn work budget. This is advisory planning guidance, not an enforced Codex maxTurns setting; checkpoint and report unfinished scope instead of claiming completion at a limit.\n\n` : ''}` +
    `${fields.memory ? `Source project memory maps to .agents/agent-memory/${fields.name}/ as optional ignored file persistence, not automatic Codex memory. Recover from production/session-state/active.md when present. Write memory/checkpoints only within authorized scope; a read-only task writes neither.\n\n` : ''}` +
    `${fields.isolation ? 'The source requests worktree isolation. Use an isolated worktree when supported and authorized, verify the actual workspace before writing, and report any inability to obtain isolation to the caller. Do not claim that this role automatically creates or enforces a worktree.\n\n' : ''}` +
    `${skills.length ? `Source skill dependencies: ${skills.map(name => `.agents/skills/${name}/SKILL.md`).join(', ')}. Read only those needed for the task; no automatic preload is assumed. If a dependency is not installed or verified, report that limitation rather than claiming it ran.\n\n` : ''}` +
    `## Adapted source role\n\n`;
}

/** Pure plan API for the guarded generator. Default selection is CGS-07's 11
 * leadership roles; later workers must explicitly name their owned roles. */
export function roleTargets(root, names = LEADERSHIP_ROLES, source, inventory = JSON.parse(readFileSync(safeProjectPath(root, 'docs/codex/upstream-inventory.json'), 'utf8').replace(/^\uFEFF/, ''))) {
  source ||= openSource({root, expectedCommit: inventory.source_commit});
  const sources = inventory.files.filter(file => /^\.claude\/agents\/[^/]+\.md$/.test(file.path));
  const available = new Map(sources.map(file => [path.basename(file.path, '.md'), file]));
  const actual = source.list('.claude/agents/').map(file => file.path).sort();
  if (JSON.stringify(actual) !== JSON.stringify(sources.map(file => file.path).sort())) throw Error('Role source set differs from pinned inventory; reconcile new/deleted sources');
  if (!Array.isArray(names) || new Set(names).size !== names.length) throw Error('Role selection must be an array without duplicates');
  const skillNames = inventory.files.filter(file => /^\.claude\/skills\/[^/]+\/SKILL\.md$/.test(file.path)).map(file => file.path.split('/')[2]);
  return names.map(name => {
    const entry = available.get(name);
    if (!entry) throw Error(`Unknown role: ${name}`);
    const bytes = source.read(entry.path);
    const text = utf(bytes);
    if (sha(bytes) !== entry.sha256 && sha(Buffer.from(text)) !== entry.sha256) throw Error(`Source drift: ${entry.path}`);
    const { fields, body } = parseRoleSource(text, entry.path);
    if (fields.name !== name) throw Error(`Role name/path mismatch: ${entry.path}`);
    const adapted = adaptRoleBody(body, skillNames);
    const shellDenied = (fields.disallowedTools || '').split(/,\s*/).includes('Bash');
    const content = `# Generated from ${entry.path}; SHA-256 ${entry.sha256}\n# Full adapted body; regenerate through scripts/codex/generate.mjs, never overwrite manual drift.\n` +
      `name = ${tomlString(name)}\ndescription = ${tomlString(fields.description)}\ndeveloper_instructions = ${tomlString(roleBridge(fields) + adapted.body)}\n` +
      (shellDenied ? '\n[features]\nshell_tool = false\n' : '');
    return {
      source: entry.path, source_sha256: entry.sha256,
      target: `.codex/agents/${name}.toml`, content: Buffer.from(content, 'utf8'),
      transform_ids: ['role-frontmatter-to-toml-v1', 'role-execution-contract-v1', ...adapted.transform_ids, ...(shellDenied ? ['role-disable-shell-v1'] : [])],
      owner: LEADERSHIP_ROLES.includes(name) ? 'CGS-07' : /^(godot-|unity-|unreal-|ue-)/.test(name) ? 'CGS-09' : 'CGS-08',
      ownership: 'generated',
    };
  });
}
