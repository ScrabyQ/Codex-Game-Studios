import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=path.join(repo,'scripts/codex/engine-e2e.mjs');
const temp=mkdtempSync(path.join(tmpdir(),'cgs engine cli '));
const env={...process.env,TMP:temp,TEMP:temp,TMPDIR:temp};
const run=(args,extra={})=>spawnSync(process.execPath,[script,...args],{cwd:repo,env:{...env,...extra},encoding:'utf8'});
for(const args of [
  ['--engine','godot','--phase','run','--dry-run'],
  ['--engine','godot','--phase','run','--bogus','yes'],
  ['--engine','godot','--engine','unreal','--phase','run'],
  ['--engine','godot','--phase','run','--exe']
]) {
  const before=readdirSync(temp),result=run(args);
  assert.equal(result.status,2);
  assert.match(result.stderr,/Invalid, duplicate or incomplete/);
  assert.equal(result.stdout,'');
  assert.deepEqual(readdirSync(temp),before,'invalid arguments must not create output');
}
const missing=path.join(temp,'not-installed','godot');
for(const mode of ['explicit','environment']) {
  const result=run(['--engine','godot','--phase','probe',...(mode==='explicit'?['--exe',missing]:[])],
    mode==='environment'?{CGS_GODOT_EXE:missing}:{CGS_GODOT_EXE:path.join(temp,'other')});
  assert.equal(result.status,1,result.stderr);
  const record=JSON.parse(result.stdout);
  assert.equal(record.executable_selection,mode==='explicit'?'--exe':'CGS_GODOT_EXE');
  assert.equal(record.status,'PENDING');
  assert.equal(record.error.code,'ENOENT');
}
// A cold parse must not proceed if the prerequisite import cannot run or fails.
for (const [executable,expected] of [[missing,'PENDING'],[process.execPath,'FAIL']]) {
  const result=run(['--engine','godot','--phase','parse','--exe',executable]);
  assert.equal(result.status,1,result.stderr);
  const record=JSON.parse(result.stdout);
  assert.equal(record.status,expected);
  assert.equal(record.preparation.status,expected);
  assert.equal(record.phase_executed,false);
}
console.log('PASS engine CLI rejects invalid flags without output and reports missing executables as PENDING');
