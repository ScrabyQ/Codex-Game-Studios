import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const mod=await import(pathToFileURL(path.resolve(process.argv[2]||'scripts/codex/hooks.mjs')).href);
for(const cmd of ['git reset --hard','git push --force origin branch','git push upstream branch','rm -rf important','cat .env.local','edit test.uasset','chmod 777 test']) assert.ok(mod.commandReason(cmd),cmd);
assert.equal(mod.commandReason("echo 'safe'"),null);
console.log('PASS dangerous commands denied; quoted benign display allowed');
