import { existsSync, readFileSync, realpathSync } from 'node:fs';
import {bashPath} from './shell.mjs';
import {isMainEntry} from './main-entry.mjs';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const events = ['SessionStart', 'PreToolUse', 'PostToolUse', 'PreCompact', 'Stop', 'SubagentStart', 'SubagentStop', 'Notification'];
export function projectRoot(cwd = process.cwd()) {
  let p = resolve(cwd);
  while (true) {
    if (['project.yaml', 'project.local.yaml', '.git', '.agents'].some(f => existsSync(resolve(p, f))) && !/[/\\]\.agents$/i.test(p)) return p;
    const next = dirname(p); if (next === p) throw new Error('No project root; supply --root'); p = next;
  }
}
function pathInfo(root, path) {
  if (typeof path !== 'string' || !path.trim() || /[\0\r\n]/.test(path)) throw new Error('Missing or invalid file path');
  const full = resolve(root, path.replaceAll('\\', '/'));
  const rel = relative(root, full).replaceAll('\\', '/');
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel)) throw new Error('File path outside selected project');
  let ancestor = full; while (!existsSync(ancestor) && dirname(ancestor) !== ancestor) ancestor = dirname(ancestor);
  const actual = relative(realpathSync(root), realpathSync(ancestor));
  if (actual === '..' || actual.startsWith('..' + (process.platform === 'win32' ? '\\' : '/')) || isAbsolute(actual)) throw new Error('File path resolves outside selected project');
  if (/(^|\/)\.env[^/]*$/i.test(rel)) throw new Error('Secret .env path denied');
  if (/\.(uasset|umap)$/i.test(rel)) throw new Error('Binary Unreal asset path denied');
  return { full, rel };
}
function disablesUpstreamPush(command) {
  // Only this complete configuration command is exempt from push classification.
  // A chained command, alternate URL or extra option must still be inspected.
  return /^\s*git(?:\.exe)?\s+remote\s+set-url\s+--push\s+upstream\s+(?:DISABLED|"DISABLED"|'DISABLED')\s*$/i.test(command);
}
export function commandReason(command) {
  if (typeof command !== 'string' || !command.trim()) return 'Missing shell command';
  // This is a finite conservative detector, not a shell parser/security boundary.
  // A simple quoted display command is data, unless interpolation is present.
  if (/^\s*(echo|printf|Write-Output)\s+(?:'[^'\r\n]*'|"[^"\r\n]*")\s*$/i.test(command) && !/[$`]/.test(command)) return null;
  if (/(^|[\s/'"\\])\.env[^\s/'"\\;|&)]*/i.test(command)) return 'Command references a secret .env path';
  if (/\.(uasset|umap)\b/i.test(command)) return 'Command references a binary Unreal asset';
  if (/\b(sudo|doas)\b|\bchmod\s+777\b/i.test(command)) return 'Privileged or world-writable command denied';
  if (/\b(?:rm|remove-item|del|erase|rmdir|rd)(?:\.exe)?\b/i.test(command)) {
    const recursive = /(?:\s-[a-z]*[rR][a-z]*\b|--recursive|-(?:recurse|r)\b|\/s\b)/i.test(command);
    const force = /(?:\s-[a-z]*f[a-z]*\b|--force|-force\b|\/q\b)/i.test(command);
    if (recursive && force) return 'Recursive forced deletion denied';
    if (/\bRemove-Item\b/i.test(command) && recursive) return 'Recursive PowerShell deletion denied';
  }
  if (/\bgit(?:\.exe)?\b/i.test(command)) {
    if (/\bpush\b/i.test(command) && /--force(?:-with-lease|-if-includes)?\b|\s-[a-z]*f[a-z]*\b|(?:\s|["'])\+[^\s]+/i.test(command)) return 'Force push denied';
    if (/\breset\b[^\r\n;&|]*--hard\b|\bclean\b[^\r\n;&|]*(?:--force\b|\s-[a-z]*f[a-z]*\b)/i.test(command)) return 'Destructive Git command denied';
    if (/\bpush\b/i.test(command) && !disablesUpstreamPush(command) && /(?:^|[\s"'=])upstream(?=$|[\s"'])|Donchitos[/:\\]Claude-Code-Game-Studios/i.test(command)) return 'Push to upstream denied';
  }
  return null;
}
function jsonCheck(path, content) {
  if (/\.json$/i.test(path)) { try { JSON.parse(content.replace(/^\uFEFF/, '')); } catch { throw new Error(`Invalid proposed JSON: ${path}`); } }
}
export function patchFiles(text, root, post = false) {
  if (typeof text !== 'string') throw new Error('Unrecognized apply_patch payload');
  const lines = text.replaceAll('\r\n', '\n').trimEnd().split('\n');
  if (lines.shift() !== '*** Begin Patch' || lines.pop() !== '*** End Patch') throw new Error('Malformed apply_patch envelope');
  const files = []; let i = 0;
  while (i < lines.length) {
    const h = /^\*\*\* (Add|Update|Delete) File: (.+)$/.exec(lines[i++]);
    if (!h) throw new Error('Unrecognized patch file header');
    const info = pathInfo(root, h[2]); let destination = info, body = [];
    if (lines[i]?.startsWith('*** Move to: ')) { destination = pathInfo(root, lines[i++].slice(13)); }
    while (i < lines.length && !/^\*\*\* (Add|Update|Delete) File: /.test(lines[i])) body.push(lines[i++]);
    if (post) { files.push({ ...destination, deleted: h[1] === 'Delete' }); continue; }
    let content;
    if (h[1] === 'Add') {
      if (body.some(l => !l.startsWith('+'))) throw new Error('Malformed Add patch');
      content = body.map(l => l.slice(1)).join('\n') + '\n';
    } else if (h[1] === 'Delete') {
      if (body.length) throw new Error('Malformed Delete patch');
      content = ''; // Registry removal remains advisory through its backend.
    } else {
      content = readFileSync(info.full, 'utf8').replaceAll('\r\n', '\n');
      let j = 0;
      while (j < body.length) {
        if (!body[j].startsWith('@@')) throw new Error('Malformed Update hunk'); j++;
        const old = [], next = [];
        while (j < body.length && !body[j].startsWith('@@')) {
          const l = body[j++]; if (l === '*** End of File') continue;
          if (!/^[ +\-]/.test(l)) throw new Error('Malformed Update line');
          if (l[0] !== '+') old.push(l.slice(1)); if (l[0] !== '-') next.push(l.slice(1));
        }
        const needle = old.join('\n');
        if (!needle || content.indexOf(needle) < 0 || content.indexOf(needle) !== content.lastIndexOf(needle)) throw new Error(`Patch reconstruction ambiguous: ${info.rel}; use a unique context or explicit file edit`);
        content = content.replace(needle, next.join('\n'));
      }
    }
    if (h[1] !== 'Delete') jsonCheck(destination.rel, content);
    files.push({ ...destination, content, deleted: h[1] === 'Delete' });
    if (destination.rel !== info.rel) files.push({ ...info, content: '', deleted: true });
  }
  if (!files.length) throw new Error('Empty patch'); return files;
}
function fileInputs(payload, root, post) {
  const input = payload.tool_input, tool = payload.tool_name;
  if (tool === 'apply_patch') return patchFiles(typeof input === 'string' ? input : input?.command ?? input?.patch ?? input?.input, root, post);
  if (!['Write', 'Edit', 'Read'].includes(tool)) return [];
  const info = pathInfo(root, input?.file_path ?? input?.path);
  if (post || tool === 'Read') return [info];
  let content = input.content;
  if (tool === 'Edit') {
    if (typeof input.old_string !== 'string' || !input.old_string || typeof input.new_string !== 'string') throw new Error('Unrecognized Edit payload');
    const before = readFileSync(info.full, 'utf8');
    if (!before.includes(input.old_string) || (!input.replace_all && before.indexOf(input.old_string) !== before.lastIndexOf(input.old_string))) throw new Error('Edit context missing or ambiguous');
    content = input.replace_all ? before.split(input.old_string).join(input.new_string) : before.replace(input.old_string, input.new_string);
  }
  if (typeof content !== 'string') throw new Error('Missing proposed file content'); jsonCheck(info.rel, content);
  return [{ ...info, content }];
}
function backend(name, payload, root, options) {
  const script = resolve(options.backendRoot ?? repo, '.agents/hooks', name + '.sh');
  if (!existsSync(script)) throw new Error(`Required hook backend missing: ${name}`);
  const required = ['.agents/hooks/yaml-helper.sh'];
  if (['validate-read', 'validate-write', 'validate-registry'].includes(name)) required.push('.agents/scripts/hook-input.sh');
  if (name === 'validate-read') required.push('.agents/scripts/read-guard.sh');
  if (['validate-write', 'validate-push'].includes(name)) required.push('.agents/scripts/write-guard.sh');
  if (name === 'validate-registry') required.push('.agents/scripts/registry.sh');
  for (const file of required) if (!existsSync(resolve(root, file))) throw new Error(`Required project helper missing: ${file}`);
  const shell = options.bash ?? bashPath();
  const out = spawnSync(shell, [script], { cwd: root, input: JSON.stringify(payload), encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024, env: { ...process.env, CGS_PROJECT_DIR: root } });
  if (out.error || out.signal || out.status === null) throw new Error(`Hook ${name} did not run: ${out.error?.message ?? out.signal}`);
  let message = out.stdout.trim();
  try { const obj = JSON.parse(message); message = obj.systemMessage ?? obj.hookSpecificOutput?.additionalContext ?? message; } catch { /* Original lifecycle text is wrapped below. */ }
  return { name, code: out.status, message: [message, out.stderr.trim()].filter(Boolean).join('\n') };
}
export function handle(event, payload, options = {}) {
  const observations = [], calls = []; let root;
  const run = (name, value = payload) => {
    const result = backend(name, value, root, options); calls.push(result);
    if (result.message) observations.push(result.message);
    if (result.code !== 0) throw new Error(result.message || `${name} failed (${result.code})`);
  };
  try {
    if (!events.includes(event)) throw new Error(`Unsupported event: ${event}`);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Hook payload must be an object');
    root = resolve(options.root ?? projectRoot(payload.cwd ?? process.cwd()));
    if (payload.hook_event_name && payload.hook_event_name !== event) throw new Error('Hook event mismatch');
    payload = { ...payload, cwd: root, hook_event_name: event };
    if (event === 'Notification') observations.push(`Manual status: ${payload.message ?? 'Codex needs your attention'}. No native Notification event or approval grant is implied.`);
    else if (event === 'PreToolUse' || event === 'PostToolUse') {
      if (typeof payload.tool_name !== 'string') throw new Error('Missing tool_name');
      const shell = ['Bash', 'PowerShell', 'exec_command', 'shell_command'].includes(payload.tool_name);
      if (shell && event === 'PreToolUse') {
        const command = payload.tool_input?.command ?? payload.tool_input?.cmd;
        const reason = commandReason(command); if (reason) throw new Error(reason);
        if (/\bgit(?:\.exe)?\b[\s\S]*\bpush\b/i.test(command) && !disablesUpstreamPush(command)) {
          const remotes = spawnSync('git', ['remote', '-v'], { cwd: root, encoding: 'utf8' });
          if (remotes.error) throw new Error('Cannot inspect Git push destination: git unavailable');
          for (const line of (remotes.stdout ?? '').split('\n')) {
            const name = line.split(/\s/)[0];
            if (/Donchitos[/:\\]Claude-Code-Game-Studios/i.test(line) && (name === 'origin' || command.split(/[\s"';|&]+/).includes(name))) throw new Error('Configured push destination points to Donchitos upstream');
          }
        }
        payload = { ...payload, tool_name: payload.tool_name === 'PowerShell' ? 'PowerShell' : 'Bash', tool_input: { ...payload.tool_input, command } };
        run('validate-commit'); run('validate-push');
      } else if (['apply_patch', 'Write', 'Edit', 'Read'].includes(payload.tool_name)) {
        const files = fileInputs(payload, root, event === 'PostToolUse');
        for (const file of files) {
          const p = { ...payload, tool_name: payload.tool_name === 'Read' ? 'Read' : 'Write', tool_input: { ...payload.tool_input, file_path: file.full, content: file.content } };
          if (event === 'PreToolUse') {
            if (p.tool_name === 'Read') run('validate-read', p);
            else { run('validate-registry', p); run('validate-write', p); }
          } else if (!file.deleted && p.tool_name !== 'Read') {
            // Validate actual bytes, independently of Python availability.
            if (/^(assets|Assets|Content)\/(.*\/)?[Dd]ata\/.*\.json$/i.test(file.rel)) jsonCheck(file.rel, readFileSync(file.full, 'utf8'));
            run('validate-assets', p); run('validate-skill-change', p);
          }
        }
      } else if (/read|write|edit|patch|exec|shell/i.test(payload.tool_name)) throw new Error(`Unmapped critical tool: ${payload.tool_name}; use the documented explicit file/shell payload`);
    } else if (event === 'SessionStart') { run('session-start'); run('detect-gaps'); }
    else if (event === 'PreCompact') run('pre-compact');
    else if (event === 'Stop') run('session-stop');
    else if (event === 'SubagentStart') run('log-agent');
    else if (event === 'SubagentStop') {
      run('log-agent-stop');
      if (payload.expected_artifact) {
        const p = pathInfo(root, payload.expected_artifact);
        observations.push(existsSync(p.full) ? `Artifact present: ${p.rel}; existence is not a quality verdict.` : `Artifact missing: ${p.rel}; phase is not done.`);
      } else observations.push('Artifact check PENDING: Codex transcript format is not stable. Re-run SubagentStop with expected_artifact from the delegated return contract; inspect that file before accepting the phase.');
    }
    return { code: 0, root, observations, calls, output: observations.length ? { systemMessage: observations.join('\n'), ...(['SessionStart', 'PreToolUse', 'PreCompact'].includes(event) ? { hookSpecificOutput: { hookEventName: event, additionalContext: observations.join('\n') } } : {}) } : {} };
  } catch (e) {
    const reason = e.message;
    return { code: 2, root, observations, calls, reason, output: event === 'PreToolUse' ? { hookSpecificOutput: { hookEventName: event, permissionDecision: 'deny', permissionDecisionReason: reason } } : { systemMessage: reason } };
  }
}
if (isMainEntry(import.meta.url)) {
  const args = process.argv.slice(2); let event = args.shift(), root, inputFile;
  const execute = event === 'run'; if (execute) event = 'PreToolUse';
  try {
    while (args.length) { const a = args.shift(); if (a === '--root') root = args.shift(); else if (a === '--input') inputFile = args.shift(); else throw new Error(`Unknown argument: ${a}`); }
    const input = JSON.parse(readFileSync(inputFile ?? 0, 'utf8').replace(/^\uFEFF/, ''));
    const result = handle(event, input, { root });
    console.log(JSON.stringify(result.output));
    if (result.code) { console.error(result.reason); process.exitCode = result.code; }
    else if (execute) {
      if (!['Bash', 'PowerShell', 'exec_command', 'shell_command'].includes(input.tool_name)) throw new Error('run supports shell payloads only');
      const shell = input.tool_name === 'PowerShell' ? 'powershell.exe' : (bashPath());
      const command = input.tool_input.command ?? input.tool_input.cmd;
      const r = spawnSync(shell, input.tool_name === 'PowerShell' ? ['-NoProfile', '-NonInteractive', '-Command', command] : ['-c', command], { cwd: result.root, stdio: 'inherit' });
      if (r.error) throw r.error; process.exitCode = r.status ?? 2;
    }
  } catch (e) { console.error(`Hook input/execution failed: ${e.message}`); process.exitCode = 2; }
}
