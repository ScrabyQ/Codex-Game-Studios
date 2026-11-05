// Integrator-approved accounting; does not execute tests or infer quality from presence.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const checks=read('docs/codex/evidence/CGS-24/checks.json');
const parity=read('docs/codex/evidence/CGS-24/parity.json');
if(checks.status!=='PASS'||checks.tests.length!==18||checks.tests.some(x=>x.status!=='PASS')||parity.declarations.length!==15||parity.declarations.some(x=>x.fallbackStatus!=='PASS'))throw Error('Reviewed test evidence changed');
const registry=read('docs/codex/generation-manifest.json');
const matrix=read('docs/codex/migration-manifest.json');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const evidence=['docs/codex/evidence/CGS-24/checks.json','docs/codex/evidence/CGS-24/parity.json','docs/codex/hooks.md'];
const decl=matrix.entries.filter(x=>x.category==='hook-declaration');
if(decl.length!==15)throw Error('Declaration inventory mismatch');
for(const e of decl){
  Object.assign(e,{status:'EQUIVALENT',task:'CGS-24',target:'scripts/codex/hooks.mjs',target_sha256:hash('scripts/codex/hooks.mjs'),evidence,
    verification:'15/15 explicit CLI fallbacks tested; supported native configuration optional and activation PENDING. Notification is manual; missing artifact never certifies quality. Linux execution PENDING.'});
}
for(const e of matrix.entries.filter(x=>x.source.startsWith('.claude/hooks/'))){
  const t=registry.entries.find(x=>x.source===e.source);
  if(!t||hash(t.target)!==t.target_sha256||t.source_sha256!==e.source_sha256)throw Error('Unreconciled hook '+e.source);
  Object.assign(e,{task:'CGS-24',target:t.target,target_sha256:t.target_sha256,evidence:[...new Set([...(e.evidence||[]),...evidence])],status:'EQUIVALENT',
    verification:'Preserved source-bound backend and tested adapter equivalent; see per-declaration protocol/limits in parity matrix. Native activation and Linux remain PENDING.'});
  if(e.source.endsWith('/log-instructions.sh'))Object.assign(e,{status:'UNSUPPORTED',verification:'Claude InstructionsLoaded diagnostic is preserved, but no equivalent Codex automatic event is asserted. Explicit rule selector provides tested path-policy selection; automatic rule-load telemetry is unavailable.'});
  if(e.source.endsWith('/update-check.sh'))Object.assign(e,{status:'PENDING',verification:'Cached update notice preserved; no background refresh installed. Actual upstream update workflow verification belongs to CGS-29.'});
}
const story=matrix.entries.find(x=>x.source==='.claude/scripts/story-status.sh');
const t=registry.entries.find(x=>x.source===story.source);
if(hash(t.target)!==t.target_sha256)throw Error('Story target changed');
Object.assign(story,{status:'EQUIVALENT',task:'CGS-25',target:t.target,target_sha256:t.target_sha256,evidence:['docs/codex/evidence/CGS-25/helper-root-regression.json'],verification:'Actual two-sibling-project regression verifies selected root, status ordering and counts; invalid roots fail rather than reporting another project.'});
writeFileSync('docs/codex/migration-manifest.json',JSON.stringify(matrix,null,2)+'\n');
console.log('Recorded reviewed 15 hook declarations, 18 backend dispositions and selected-root story status');
