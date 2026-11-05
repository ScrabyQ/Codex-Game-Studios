import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {bashPath} from '../scripts/codex/shell.mjs';

const parent=realpathSync(tmpdir()),temp=mkdtempSync(path.join(parent,'cgs code root ')),helper=path.resolve('.agents/hooks/yaml-helper.sh');
function fixture(name,shared,local,dirs=[],legacy=''){
 const root=path.join(temp,name);mkdirSync(root);
 if(shared!==null)writeFileSync(path.join(root,'project.yaml'),shared);
 if(local!==null)writeFileSync(path.join(root,'project.local.yaml'),local);
 for(const dir of dirs)mkdirSync(path.join(root,dir));
 if(legacy){mkdirSync(path.join(root,'.agents/docs'),{recursive:true});writeFileSync(path.join(root,'.agents/docs/technical-preferences.md'),legacy)}
 return root;
}
function selected(root){const r=spawnSync(bashPath(),['-c','source "$1"; resolve_code_root','fixture',helper],{cwd:root,encoding:'utf8',env:{...process.env,CGS_PROJECT_DIR:root}});assert.equal(r.status,0,r.stderr);return r.stdout}
try{
 assert.equal(selected(fixture('locked','engine:\n  name: Unity\n','engine:\n  name: Godot\n')), 'Assets\tengine.name');
 assert.equal(selected(fixture('shared-only','engine:\n  name: Godot\n',null)), 'src\tengine.name');
 assert.equal(selected(fixture('local-only',null,'engine:\n  name: Godot\n',['Source'])), 'Source\tdetected');
 assert.equal(selected(fixture('invalid','engine:\n  name: Bogus\n','engine:\n  name: Godot\n',[],'Engine: Unity 6\n')), 'Assets\t.agents/docs/technical-preferences.md');
 assert.equal(selected(fixture('undecidable',null,'engine:\n  name: Godot\n')), '\tunset');
 console.log('PASS locked engine root selection, missing local/shared config, invalid enum and legacy fallback');
}finally{if(path.dirname(path.resolve(temp))!==parent)throw Error('Unsafe fixture cleanup');rmSync(temp,{recursive:true,force:true})}
