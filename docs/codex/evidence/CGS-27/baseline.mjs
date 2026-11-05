import fs from 'node:fs';
import path from 'node:path';
import {repo,evidence,fixtures,put,command} from './io.mjs';
fs.mkdirSync(path.join(evidence,'.local-git'),{recursive:true});
const identity={name:command('git',['config','user.name'],repo).stdout.trim(),email:command('git',['config','user.email'],repo).stdout.trim()},baselines=[];
for(const id of ['godot','unity','unreal']){const root=path.join(fixtures,id),gitdir=path.join(evidence,'.local-git',id);if(fs.existsSync(path.join(gitdir,'HEAD')))throw Error('Existing baseline; do not replace');const args=['--git-dir='+gitdir,'--work-tree='+root];for(const a of [['init'],['-c','core.autocrlf=false','add','.'],['-c','user.name='+identity.name,'-c','user.email='+identity.email,'commit','-m','test: establish CGS27 fixture baseline','-m','Task: CGS-27']]){const r=command('git',[...args,...a],root);if(r.exit_code!==0)throw Error(r.stderr);}baselines.push({engine:id,git_dir:gitdir,work_tree:root,baseline:command('git',[...args,'rev-parse','HEAD'],root).stdout.trim()});}
put(path.join(evidence,'git-baselines.json'),baselines);console.log(JSON.stringify({baseline_count:baselines.length}));
