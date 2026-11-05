import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {openSource} from './source.mjs';
import {safeProjectPath} from './safe-path.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const utf=b=>new TextDecoder('utf-8',{fatal:true}).decode(b).replace(/\r\n?/g,'\n');
export function skillSources(root, source, inventory=JSON.parse(readFileSync(safeProjectPath(root,'docs/codex/upstream-inventory.json'),'utf8').replace(/^\uFEFF/,''))){
 source ||= openSource({root,expectedCommit:inventory.source_commit});
 const expected=inventory.files.filter(f=>f.path.startsWith('.claude/skills/'));
 const paths=source.list('.claude/skills/').map(f=>f.path).sort();
 if(JSON.stringify(paths)!==JSON.stringify(expected.map(x=>x.path).sort())) throw Error('Skill source set differs from pinned inventory (new, deleted, or untracked source)');
 for(const e of expected){let b;try{b=source.read(e.path)}catch{throw Error(`Missing source ${e.path}`)};if(sha(b)!==e.sha256 && sha(Buffer.from(utf(b)))!==e.sha256) throw Error(`Source drift ${e.path}`)}
 return expected;
}
export function skillTargets(root,names,source,inventory=JSON.parse(readFileSync(safeProjectPath(root,'docs/codex/upstream-inventory.json'),'utf8').replace(/^\uFEFF/,'')),overlayRoot=root){
 source ||= openSource({root,expectedCommit:inventory.source_commit});
 const sources=skillSources(root,source,inventory), available=sources.filter(s=>/\/SKILL\.md$/.test(s.path)).map(s=>s.path.split('/')[2]);
 const roles=new Set(inventory.files.filter(x=>x.category==='agent').map(x=>path.posix.basename(x.path,'.md')));
 const adaptPaths=value=>value.replace(/\.claude\/agents\/([a-z0-9-]+)\.md/g,(all,n)=>roles.has(n)?`.codex/agents/${n}.toml`:all).replace(/\.claude\/(scripts|hooks|docs|skills)\//g,'.agents/$1/');
 const overlayDir=safeProjectPath(overlayRoot,'docs/codex/overlays');
 if(existsSync(overlayDir))for(const n of readdirSync(overlayDir).filter(n=>n.endsWith('.json')))if(!available.includes(n.slice(0,-5)))throw Error(`Unknown skill overlay ${n}`);
 const selected=names||available; for(const name of selected) if(!available.includes(name)) throw Error(`Unknown skill: ${name}`);
 const plans=[];
 for(const src of sources.filter(s=>selected.includes(s.path.split('/')[2]))){
  let bytes=source.read(src.path); const target=src.path.replace(/^\.claude\/skills\//,'.agents/skills/');let ids=[], explicitInvocation=false;
  if(src.path.endsWith('/SKILL.md')){
   const text=utf(bytes), m=/^---\n([\s\S]*?)\n---\n/.exec(text);if(!m)throw Error(`Malformed frontmatter ${src.path}`);
   const fields={};for(const line of m[1].split('\n')){if(/^\s*#/.test(line))continue;let x=/^([\w-]+):\s*(.*)$/.exec(line);if(!x || x[1] in fields)throw Error(`Malformed frontmatter ${src.path}: ${line}`);fields[x[1]]=x[2]}
   const permitted=['name','description','argument-hint','user-invocable','allowed-tools','model','disable-model-invocation'];for(const k of Object.keys(fields))if(!permitted.includes(k))throw Error(`Unknown source frontmatter ${k} in ${src.path}`);
   if(fields.name!==src.path.split('/')[2]||!fields.description||!fields['allowed-tools'])throw Error(`Invalid frontmatter ${src.path}`);
   if(fields['disable-model-invocation'] && !['true','false'].includes(fields['disable-model-invocation']))throw Error(`Invalid invocation policy ${src.path}`);
   explicitInvocation=fields['disable-model-invocation']==='true';
   let body=text.slice(m[0].length);
   body=body.replace(/!`([^`\n]+)`/g,(_,command)=>`**Explicit bootstrap (execute before using this output, from the resolved project root):** \`${command.replaceAll('${CLAUDE_SKILL_DIR}/../../','.agents/')}\`. If unavailable, report the missing dependency and do not invent results.`);
   body=body.replace(/\bAskUserQuestion\b/g,'available user-question tool (or ask in plain text and wait)');
   body=body.replace(/\bCLAUDE_SKILL_DIR\b/g,'resolved skill directory');
   body=body.replace(/\bCLAUDE_PROJECT_DIR\b/g,'resolved project root');
   body=body.replace(/\bAgent tool\b/g,'native delegation facility');
   body=body.replace(/\bAgent\(/g,'native delegation (');
   body=body.replace(/(?<![\w./])\/([a-z][a-z0-9-]*)/g,(whole,name)=>available.includes(name)?String.fromCharCode(36)+name:whole);
   body=adaptPaths(body);
   const cap=adaptPaths(fields['allowed-tools']).replaceAll('`',"'").replace(/\bAskUserQuestion\b/g,'user-question facility').replace(/CLAUDE_[A-Z_]+/g,'project path');
   const fallback=fields.name==='help' ? `\n\n**Read-only fallback when a bootstrap or artifact helper cannot run:** Read the actual project.yaml and allowed project.local.yaml settings, the config-resolution defaults and rigor expansion, stage mirror, workflow catalog, checkpoint and relevant project artifacts directly. Report each observed fact and its source; apply the catalog's minimal-path checks in order. Do not claim a helper ran or infer an unknown value. If a required fact cannot be established, report it as unknown and stop that recommendation. This explicit fallback overrides source instructions below that assume preprocessing already ran or prohibit re-derivation.` : '';
   const bridge=`## Codex execution contract\n\nResolve the intended project root before executing relative paths: prefer the nearest project containing project.yaml or project.local.yaml, including a nested project; do not silently borrow a parent project. Execute the explicit bootstrap steps in this document before consuming their output. Native Codex does not perform shell preprocessing. Original tool capability scope: \`${cap}\`. Treat this as a ceiling for this skill, not a permission grant; preserve any narrower read-only restriction in the body and the active host permissions. Use a user-question facility when available, otherwise ask in plain text and wait; unanswered required decisions are not consent. Use native subagents only when available and authorized; otherwise read the relevant role and work in-session, disclosing lack of independent review. Upstream slash-command references mean invoke the corresponding installed Codex skill using its $name; do not assume all skills have been migrated. Source argument guidance: ${fields['argument-hint']||'none'}. ${fields['disable-model-invocation']==='true'?'Run only on explicit user invocation.':''}${fallback}\n\n`;
   bytes=Buffer.from(`---\nname: ${fields.name}\ndescription: ${fields.description}\n---\n\n${bridge}${body}`,'utf8');ids=['frontmatter-scope-v1','explicit-bootstrap-v1','codex-question-delegation-v1','native-skill-invocation-v1'];
  }
  else {
   let body=utf(bytes);
   body=body.replace(/!`([^`\n]+)`/g,(_,command)=>`**Explicit bootstrap (from the resolved project root):** \`${command.replaceAll('${CLAUDE_SKILL_DIR}/../../','.agents/')}\`. If unavailable, report the dependency and do not invent results.`);
   body=body.replace(/\bAskUserQuestion\b/g,'available user-question tool (or ask in plain text and wait)').replace(/\bCLAUDE_SKILL_DIR\b/g,'resolved skill directory').replace(/\bCLAUDE_PROJECT_DIR\b/g,'resolved project root').replace(/\bAgent tool\b/g,'native delegation facility').replace(/\bAgent\(/g,'native delegation (');
   body=body.replace(/(?<![\w./])\/([a-z][a-z0-9-]*)/g,(whole,name)=>available.includes(name)?String.fromCharCode(36)+name:whole);
   body=adaptPaths(body);
   bytes=Buffer.from(body,'utf8');ids=['resource-runtime-adaptation-v1'];
  }
  const skill=src.path.split('/')[2], overlayPath=safeProjectPath(overlayRoot,`docs/codex/overlays/${skill}.json`);
  if(existsSync(overlayPath)){
   const raw=readFileSync(overlayPath), overlay=JSON.parse(raw.toString('utf8').replace(/^\uFEFF/,''));
   const skillSource=sources.find(x=>x.path===`.claude/skills/${skill}/SKILL.md`);
   if(overlay.source_sha256!==skillSource.sha256 || !Array.isArray(overlay.edits))throw Error(`Overlay source mismatch or invalid edits: ${skill}`);
   let out=bytes.toString('utf8');
   for(const edit of overlay.edits){
    if(typeof edit.find!=='string'||!edit.find||typeof edit.replace!=='string'||(edit.count!==undefined&&(!Number.isInteger(edit.count)||edit.count<1)))throw Error(`Invalid overlay edit: ${skill}`);
    const relative=src.path.slice(('.claude/skills/'+skill+'/').length), editTarget=edit.target||'SKILL.md';
    if(editTarget.startsWith('/')||editTarget.split('/').includes('..')||!sources.some(x=>x.path===`.claude/skills/${skill}/${editTarget}`))throw Error(`Invalid overlay target: ${skill}/${editTarget}`);
    if(relative!==editTarget)continue;
    const count=out.split(edit.find).length-1, expected=edit.count??1;if(count!==expected)throw Error(`Overlay anchor count mismatch: ${skill}/${relative}, expected ${expected}, found ${count}`);
    out=out.split(edit.find).join(edit.replace);
   }
   bytes=Buffer.from(out,'utf8');ids.push(`overlay-sha256:${sha(raw)}`);
  }
  plans.push({source:src.path,source_sha256:src.sha256,target,content:bytes,transform_ids:ids,owner:'CGS-05',ownership:'generated'});
  if(explicitInvocation)plans.push({source:src.path,source_sha256:src.sha256,target:`.agents/skills/${skill}/agents/openai.yaml`,content:Buffer.from('policy:\n  allow_implicit_invocation: false\n'),transform_ids:['explicit-invocation-policy-v1'],owner:'CGS-05',ownership:'generated'});
 }
 return plans;
}
