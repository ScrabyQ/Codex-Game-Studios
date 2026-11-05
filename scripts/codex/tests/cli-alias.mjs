import assert from 'node:assert/strict';
import {mkdtempSync,realpathSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const repo=realpathSync(process.cwd()),parent=realpathSync(tmpdir()),fixture=mkdtempSync(path.join(parent,'cgs cli alias ')),alias=path.join(fixture,'product alias');
try{
 symlinkSync(repo,alias,process.platform==='win32'?'junction':'dir');
 const executable=(name,args=[],input)=>spawnSync(process.execPath,[path.join(alias,'scripts/codex',name+'.mjs'),...args],{cwd:repo,input,encoding:'utf8'});
 const cases=[
  ['helper',['skill-lint','--root',path.join(fixture,'missing'),'demo'],/missing|not a directory/i],
  ['engine-roles',['--invalid'],/Usage/],
  ['hygiene',[path.join(fixture,'missing')],/ENOENT|no such file/i],
  ['models',['invalid'],/Usage/],
  ['native-smoke',[],/Usage/],
  ['reference-generation',['--invalid'],/Usage|source|commit|Git/i],
  ['rules',['--path','../outside'],/normalized|relative/i]
 ];
 for(const [name,args,pattern] of cases){const r=executable(name,args);assert.notEqual(r.status,0,`${name} silently skipped through alias`);assert.match(r.stderr,pattern,`${name}: ${r.stderr}`)}
 const hook=executable('hooks',['PreToolUse','--root',repo],JSON.stringify({tool_name:'Bash',tool_input:{command:'git push --force'}}));
 assert.notEqual(hook.status,0,'aliased safety hook silently skipped');assert.match(hook.stdout,/deny/);
 for(const name of [...cases.map(c=>c[0]),'hooks']){
  const script='await import(process.argv[2]); console.log("IMPORTED")',url=pathToFileURL(path.join(alias,'scripts/codex',name+'.mjs')).href;
  const r=spawnSync(process.execPath,['--input-type=module','-e',script,'sentinel',url],{cwd:repo,encoding:'utf8'});
  assert.equal(r.status,0,`${name} import: ${r.stderr}`);assert.equal(r.stdout.trim(),'IMPORTED',`${name} unexpectedly ran its CLI`);
 }
 console.log('PASS aliased CLI execution, safety denial, selected-root refusal and import-only behavior');
}finally{if(path.dirname(path.resolve(fixture))!==parent)throw Error('Unsafe fixture cleanup');rmSync(fixture,{recursive:true,force:true})}
