// Apply the integrator-reviewed content audit, never infer runtime coverage.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,relative,isAbsolute,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const matrix=read('docs/codex/migration-manifest.json');
const audit=read('docs/codex/evidence/CGS-28/preservation/source-integrity.json');
const proposal=read('docs/codex/evidence/CGS-28/preservation/disposition-proposal.json');
const records=new Map(audit.files.map(x=>[x.source,x]));
if(records.size!==638||audit.stats.working_missing!==0)throw Error('Incomplete source audit');
const selected=proposal.entries.filter(x=>x.proposed_status!=='PENDING');
if(selected.length!==206)throw Error('Unexpected reviewed content disposition set');
const byId=new Map(matrix.entries.map(x=>[x.id,x]));
const git=(args,options={})=>execFileSync('git',args,{cwd:root,maxBuffer:64*1024*1024,...options});
const batch=git(['cat-file','--batch'],{input:selected.map(x=>records.get(x.source)?.baseline_git_blob).join('\n')+'\n'});
let offset=0;
const changes=selected.map(p=>{
  const e=byId.get(p.id), a=records.get(p.source);
  if(!e||!a||e.source!==p.source||e.source_sha256!==p.source_sha256||a.baseline_sha256!==e.source_sha256)throw Error('Unreconciled source '+p.id);
  if(!['PENDING',p.proposed_status].includes(e.status))throw Error('Refusing unrelated disposition change '+p.id);
  const end=batch.indexOf(10,offset), header=/^([a-f0-9]+) blob (\d+)$/.exec(batch.subarray(offset,end).toString());
  if(!header||header[1]!==a.baseline_git_blob)throw Error('Invalid source Git object');
  const size=Number(header[2]), bytes=batch.subarray(end+1,end+1+size);offset=end+size+2;
  if(createHash('sha256').update(bytes).digest('hex')!==e.source_sha256)throw Error('Source blob drift '+p.source);
  for(const f of [p.target,...p.evidence]){
    const abs=resolve(root,f), rel=relative(root,abs);
    if(rel==='..'||rel.startsWith('..\\')||rel.startsWith('../')||isAbsolute(rel)||!existsSync(abs))throw Error('Missing or external audit artifact '+f);
  }
  return {e,p,a};
});
for(const {e,p,a} of changes)Object.assign(e,{status:p.proposed_status,task:'CGS-28',target:p.target,
  evidence:[...new Set([...(e.evidence||[]),...p.evidence])],verification:p.verification,
  verification_scope:p.proposed_status==='UNSUPPORTED'?'Automatic Claude-client integration; preserved source and explicit fallback documented':'Reference/specification/project content retention; no runtime or model-behavior claim',
  preservation_source_commit:matrix.source_commit,preservation_git_blob:a.baseline_git_blob});
writeFileSync(resolve(root,'docs/codex/migration-manifest.json'),JSON.stringify(matrix,null,2)+'\n');
console.log(JSON.stringify({reviewed_content_dispositions:changes.length,remaining_pending:matrix.entries.filter(x=>x.status==='PENDING').length,runtime_coverage_inferred:false}));
