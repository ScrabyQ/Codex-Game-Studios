// Opt-in local engine command harness. Never a model/agent orchestrator.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const sha=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const put=(file,data)=>fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
function command(exe,args,cwd,timeout,extra){const r=spawnSync(exe,args,{cwd,encoding:'utf8',windowsHide:true,timeout,maxBuffer:10*1024*1024,env:{...process.env,...extra}});return {exit_code:r.status,signal:r.signal,error:r.error?{code:r.error.code,message:r.error.message}:null,stdout:r.stdout||'',stderr:r.stderr||''};}
const usage='Usage: node scripts/codex/engine-e2e.mjs --engine godot|unity|unreal --phase import|parse|test|run|build|probe [--exe PATH] [--fixture PATH] [--project FILE --target NAME --platform NAME]';
const args=process.argv.slice(2),options=new Map();
if(args.length===1&&args[0]==='--help'){console.log(usage);process.exit(0);}
for(let i=0;i<args.length;i+=2){const key=args[i],value=args[i+1];if(!['--engine','--phase','--exe','--fixture','--project','--target','--platform'].includes(key)||options.has(key)||!value||value.startsWith('--')){console.error('Invalid, duplicate or incomplete argument: '+key+'\n'+usage);process.exit(2);}options.set(key,value);}
const engine=options.get('--engine'),phase=options.get('--phase');
if(!['godot','unity','unreal'].includes(engine)||!phase){console.error(usage);process.exit(2);}
const evidence=fs.mkdtempSync(path.join(tmpdir(),'cgs-engine-'));
const fixtures=path.join(evidence,'fixtures');
fs.cpSync(path.join(repo,'tests/fixtures/engines'),fixtures,{recursive:true});
const root=path.join(fixtures,engine);
if(options.has('--fixture'))fs.cpSync(path.resolve(options.get('--fixture')),root,{recursive:true});
if(engine==='unreal' && phase==='build' && ['--fixture','--project','--target','--platform'].some(x=>!options.has(x)))throw Error('Unreal builds require --fixture, --project (relative to fixture), --target and --platform');
let exe,argv,timeout=60000;
if(engine==='godot'){exe='godot';const base=['--path',root];const files=['src/charge_model.gd','src/charge_beacon.gd','tests/unit/charge_model_test.gd'];argv=phase==='import'?['--headless',...base,'--import']:phase==='parse'?['--headless',...base,'--script',path.join(repo,'.agents/scripts/godot-parse-check.gd'),'--',...files.map(f=>'res://'+f)]:phase==='test'?['--headless',...base,'--script','res://tests/unit/charge_model_test.gd']:phase==='run'?[...base,'--windowed','--resolution','800x480','res://scenes/charge_beacon.tscn','--','--cgs-e2e']:phase==='probe'?['--version']:null;}
if(engine==='unreal'){exe='UnrealBuildTool';const project=options.get('--project');if(project&&(path.isAbsolute(project)||project.split(/[\\/]/).includes('..')))throw Error('--project must be relative to fixture');argv=phase==='build'?[options.get('--target'),options.get('--platform'),'Development','-Project='+path.join(root,project),'-NoEngineChanges','-NoHotReloadFromIDE','-NoUBA','-Log='+path.join(evidence,'unreal-build-tool.log')]:null;timeout=90000;}
if(engine==='unity'){exe='Unity';argv=phase==='probe'?['-version']:null;}
if(!argv)throw Error('Unsupported phase for '+engine+': '+phase);
const envKey={godot:'CGS_GODOT_EXE',unity:'CGS_UNITY_EDITOR',unreal:'CGS_UNREAL_UBT'}[engine];
const executableSelection=options.has('--exe')?'--exe':process.env[envKey]?envKey:'PATH';
exe=options.get('--exe')||process.env[envKey]||exe;
const before={};for(const file of ['src/charge_model.gd','src/charge_beacon.gd','tests/unit/charge_model_test.gd','assets/data/charge.json','localization/en.json','scenes/charge_beacon.tscn','Source/TP_Blank/ChargeModel.h','Source/TP_Blank/ChargeModelTest.cpp'])if(fs.existsSync(path.join(root,file)))before[file]=sha(path.join(root,file));
const bundledDotnet=process.env.CGS_UE_DOTNET_ROOT;
const runtimeEnv=engine==='unreal'?{...(bundledDotnet?{DOTNET_ROOT:bundledDotnet}:{}),DOTNET_MULTILEVEL_LOOKUP:'0',DOTNET_ROLL_FORWARD:'LatestMajor',DOTNET_CLI_HOME:path.join(root,'.runtime'),DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_CLI_TELEMETRY_OPTOUT:'1'}:{};
const hasErrors=r=>/SCRIPT ERROR:|PARSE FAIL:|ERROR:|Result: Failed|error C[0-9]/i.test(r.stdout+r.stderr);
const status=r=>r.error?'PENDING':r.exit_code===0&&!hasErrors(r)?'PASS':'FAIL';
// Each invocation copies a fresh project. Import in that same fixture before
// phases that can depend on the editor's generated global-class metadata.
let preparation=null;
if(engine==='godot'&&['parse','test','run'].includes(phase)){
 const imported=command(exe,['--headless','--path',root,'--import'],root,timeout,runtimeEnv);
 preparation={...imported,status:status(imported)};
}
const phaseExecuted=!preparation||preparation.status==='PASS';
const r=phaseExecuted?command(exe,argv,root,timeout,runtimeEnv):preparation;
const errors=hasErrors(r);
const result={engine,phase,...r,preparation,phase_executed:phaseExecuted,executable_selection:executableSelection,runtime_env:runtimeEnv,source_hashes:before,error_lines_detected:errors,status:status(r),scope:phase==='run'?'Non-headless rendering and synthetic engine-event input; not physical input or human playtest.':'Actual engine/tool process only; no visual claim.',cache_caveat:engine==='unreal'?'UBT may write its default user cache even with redirected environment.':null};
put(path.join(evidence,engine+'-'+phase+'.json'),result);console.log(JSON.stringify(result));process.exitCode=result.status==='PASS'?0:1;
