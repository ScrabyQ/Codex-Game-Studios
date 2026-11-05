import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const script=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(script,'../..');
execFileSync(process.execPath,[path.join(script,'generate.mjs'),'--family','skills','--check'],{cwd:root,stdio:'inherit'});
const registry=JSON.parse(readFileSync(path.join(root,'docs/codex/generation-manifest.json'),'utf8'));
for(const e of registry.entries.filter(e=>e.target.startsWith('.agents/skills/')&&e.target.endsWith('/SKILL.md'))){
 const text=readFileSync(path.join(root,e.target),'utf8');
 for(const m of text.matchAll(/\]\((\.{1,2}\/[^)#\s]+)(?:#[^)]*)?\)/g)){let p=path.resolve(path.dirname(path.join(root,e.target)),m[1]);if(!existsSync(p))throw Error(`Missing relative skill reference ${e.target}: ${m[1]}`)}
}
const manifest=JSON.parse(readFileSync(path.join(root,'docs/codex/migration-manifest.json'),'utf8'));
const skills=manifest.entries.filter(e=>e.category==='skill');
if(skills.length!==74)throw Error(`Expected 74 skill migration entries, found ${skills.length}`);
const counts=Object.fromEntries([...new Set(skills.map(e=>e.status))].sort().map(s=>[s,skills.filter(e=>e.status===s).length]));
console.log(`Skill migration status: ${JSON.stringify(counts)}; generated content is not proof of behavioral parity`);
