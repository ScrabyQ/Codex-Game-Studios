import { runHelper } from './helper.mjs';
import { resolve } from 'node:path';
const args = process.argv.slice(2); const command = args.shift();
try {
  const i = args.indexOf('--root'); let root = process.cwd();
  if (i >= 0) { if (!args[i + 1]) throw new Error('--root needs a value'); root = resolve(args[i + 1]); args.splice(i, 2); }
  let helper, pass;
  if (command === 'resolve') { helper = 'yaml-helper'; pass = ['resolve_config', ...args]; }
  else if (command === 'set') { helper = 'config-set'; pass = [...args, '--root', root]; }
  else if (command === 'checkpoint') { helper = 'session-state'; pass = [...args, '--root', root]; }
  else throw new Error('Usage: config.mjs resolve|set|checkpoint [--root DIR] [arguments]');
  const result = runHelper(helper, pass, root); process.exitCode = result.status ?? 1;
} catch (e) { console.error(e.message); process.exitCode = 2; }
