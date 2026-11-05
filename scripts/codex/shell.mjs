import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

// Respect explicit overrides; otherwise discover Git Bash from Git's installation.
export function bashPath() {
  if (process.env.CGS_BASH) return process.env.CGS_BASH;
  if (process.platform !== 'win32') return 'bash';
  const git=spawnSync('git',['--exec-path'],{encoding:'utf8',windowsHide:true});
  if (git.status===0) {
    const candidate=path.resolve(git.stdout.trim(),'../../..','bin','bash.exe');
    if (existsSync(candidate)) return candidate;
  }
  return 'bash';
}
