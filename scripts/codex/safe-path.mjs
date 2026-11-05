import { lstatSync, realpathSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

// Refuse secret paths, Windows drive syntax and symlinks before any file read.
export function safeProjectPath(root, relative, { roots } = {}) {
  if(typeof relative!=='string'||!relative||relative.includes('\\')||relative.includes(':')||relative.startsWith('/')||relative.split('/').some(p=>!p||p==='.'||p==='..'||/^\.env/i.test(p)))throw Error(`Unsafe project path: ${relative}`);
  if(roots&&!roots.some(prefix=>relative.startsWith(prefix)))throw Error(`Unrecognized project target: ${relative}`);
  const base=realpathSync(root);let current=base;
  for(const part of relative.split('/')){
    current=path.join(current,part);
    try{if(lstatSync(current).isSymbolicLink())throw Error(`Symlink in project path: ${relative}`)}catch(e){if(e.code==='ENOENT')break;throw e}
  }
  const result=path.resolve(base,...relative.split('/')), rel=path.relative(base,result);
  if(!rel||rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel))throw Error(`Project path escapes root: ${relative}`);
  return result;
}
export function readManualTarget(root, relative) {
  if(typeof relative!=='string'||relative.split('/').some(p=>/^\.git$/i.test(p))||!(/\.md$/i.test(relative)||/^scripts\/codex\/[a-z0-9._/-]+\.mjs$/i.test(relative)))throw Error(`Unsupported manual target: ${relative}`);
  const file=safeProjectPath(root,relative);
  if(!statSync(file).isFile())throw Error(`Manual target is not a regular file: ${relative}`);
  const bytes=readFileSync(file);if(bytes.includes(0))throw Error(`Binary manual target: ${relative}`);
  new TextDecoder('utf-8',{fatal:true}).decode(bytes);return bytes;
}
export function safeExternalFile(file, {allowMissing = false} = {}) {
  const absolute=path.resolve(file),parsed=path.parse(absolute);let current=parsed.root;
  for(const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)){
    if(/^\.env/i.test(part))throw Error(`Secret path cannot be read: ${file}`);
    current=path.join(current,part);
    try { if(lstatSync(current).isSymbolicLink())throw Error(`Symlink in external path: ${file}`); }
    catch(e) { if(!allowMissing||e.code!=='ENOENT')throw e; }
  }
  return absolute;
}
