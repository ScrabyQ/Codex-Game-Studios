import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
export const repo=process.cwd(),evidence=path.resolve('docs/codex/evidence/CGS-27'),fixtures=path.resolve('docs/codex/fixtures/cgs27');
export const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export function hook(event,payload){const r=spawnSync(process.execPath,['scripts/codex/hooks.mjs',event,'--root',repo],{cwd:repo,input:JSON.stringify(payload),encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(event+': '+r.stderr+r.stdout);}
export function put(file,content){file=path.resolve(file);if(![evidence,fixtures].some(root=>file.startsWith(root+path.sep)))throw Error('Out of CGS27 scope: '+file);const text=typeof content==='string'?content:JSON.stringify(content,null,2)+'\n';const p={tool_name:'Write',tool_input:{file_path:file,content:text}};hook('PreToolUse',p);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);hook('PostToolUse',p);}
export function command(exe,args,cwd,timeout=60000,extra={}){hook('PreToolUse',{tool_name:'PowerShell',tool_input:{command:JSON.stringify([exe,...args])}});const started=new Date().toISOString();const runtime=path.join(cwd===repo?evidence:cwd,'.runtime');fs.mkdirSync(runtime,{recursive:true});const r=spawnSync(exe,args,{cwd,encoding:'utf8',windowsHide:true,timeout,maxBuffer:10*1024*1024,env:{...process.env,APPDATA:runtime,LOCALAPPDATA:runtime,...extra}});return {executable:exe,args,cwd,started,finished:new Date().toISOString(),exit_code:r.status,signal:r.signal,error:r.error?{code:r.error.code,message:r.error.message}:null,stdout:r.stdout||'',stderr:r.stderr||''};}
