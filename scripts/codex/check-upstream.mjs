import { inspect, options } from './upstream-common.mjs';
try { console.log(JSON.stringify(inspect(options(process.argv.slice(2))), null, 2)); }
catch (e) { console.error(`Upstream check refused: ${e.message}`); process.exitCode = 2; }
