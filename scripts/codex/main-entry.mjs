import {realpathSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

// Node may resolve an imported module through a filesystem alias while argv
// retains the path supplied by the caller. Compare canonical paths instead.
export function isMainEntry(moduleUrl, argument = process.argv[1]) {
  if (!argument) return false;
  try {
    const entry = realpathSync(resolve(argument)), module = realpathSync(fileURLToPath(moduleUrl));
    return process.platform === 'win32' ? entry.toLowerCase() === module.toLowerCase() : entry === module;
  } catch { return false; }
}
