import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), repo = resolve(here, '../..');
try {
  const args = process.argv.slice(2), command = args.shift();
  if (command === 'skills' || command === 'roles') {
    const mode = args.shift(), name = args.shift();
    if (args.length || !['list', 'show'].includes(mode) || (mode === 'show' && (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name))) || (mode === 'list' && name)) throw Error(`Usage: cgs.mjs ${command} list|show [NAME]`);
    const base = join(repo, command === 'skills' ? '.agents/skills' : '.codex/agents');
    if (!existsSync(base)) throw Error(`NOT ASSESSED: ${command} are not installed`);
    if (mode === 'list') {
      const entries = readdirSync(base, { withFileTypes: true }).filter(e => command === 'skills' ? e.isDirectory() && existsSync(join(base, e.name, 'SKILL.md')) : e.isFile() && e.name.endsWith('.toml')).map(e => command === 'skills' ? e.name : e.name.slice(0, -5)).sort();
      if (!entries.length) console.error(`NOT ASSESSED: no native ${command} installed`);
      console.log(entries.join('\n')); if (!entries.length) process.exitCode = 1;
    } else {
      const file = command === 'skills' ? join(base, name, 'SKILL.md') : join(base, `${name}.toml`);
      if (!existsSync(file)) throw Error(`No installed ${command === 'skills' ? 'skill' : 'role'}: ${name}`);
      process.stdout.write(readFileSync(file, 'utf8'));
    }
  } else {
    const dispatch = { config: 'config.mjs', models: 'models.mjs', rules: 'rules.mjs', helper: 'helper.mjs', check: 'validate.mjs', session: 'config.mjs' };
    if (!dispatch[command]) throw Error('Usage: cgs.mjs skills|roles|config|models|rules|helper|check|session ...');
    if (command === 'session') args.unshift('checkpoint');
    const result = spawnSync(process.execPath, [join(here, dispatch[command]), ...args], { cwd: process.cwd(), env: process.env, stdio: 'inherit' });
    if (result.error) throw result.error; process.exitCode = result.status ?? 1;
  }
} catch (e) { console.error(e.message); process.exitCode = 2; }
