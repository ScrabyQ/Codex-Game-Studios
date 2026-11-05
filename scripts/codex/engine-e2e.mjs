// Opt-in local engine command harness. Never a model/agent orchestrator.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {repo,evidence,fixtures,put,command,sha} from '../../docs/codex/evidence/CGS-27/io.mjs';
const usage='Usage: node scripts/codex/engine-e2e.mjs --engine godot|unity|unreal --phase import|parse|test|run|build|probe [--exe PATH]';
const args=process.argv.slice(2),options=new Map();
if(args.length===1&&args[0]==='--help'){console.log(usage);process.exit(0);}
for(let i=0;i<args.length;i+=2){const key=args[i],value=args[i+1];if(!['--engine','--phase','--exe'].includes(key)||options.has(key)||!value||value.startsWith('--')){console.error('Invalid, duplicate or incomplete argument: '+key+'\n'+usage);process.exit(2);}options.set(key,value);}
const engine=options.get('--engine'),phase=options.get('--phase');
if(!['godot','unity','unreal'].includes(engine)||!phase){console.error(usage);process.exit(2);}
const root=path.join(fixtures,engine);if(!fs.existsSync(path.join(root,'project.yaml')))throw Error('Prepare the named disposable fixture first');
let exe,argv,timeout=60000;
if(engine==='godot'){exe='C:/Program Files (x86)/Steam/steamapps/common/Godot Engine/godot.windows.opt.tools.64.exe';const base=['--path',root];const files=['src/charge_model.gd','src/charge_beacon.gd','tests/unit/charge_model_test.gd'];argv=phase==='import'?['--headless',...base,'--import']:phase==='parse'?['--headless',...base,'--script',path.join(repo,'.agents/scripts/godot-parse-check.gd'),'--',...files.map(f=>'res://'+f)]:phase==='test'?['--headless',...base,'--script','res://tests/unit/charge_model_test.gd']:phase==='run'?[...base,'--windowed','--resolution','800x480','res://scenes/charge_beacon.tscn','--','--cgs-e2e']:phase==='probe'?['--version']:null;}
if(engine==='unreal'){exe='C:/Program Files/Epic Games/UE_5.8/Engine/Binaries/DotNET/UnrealBuildTool/UnrealBuildTool.exe';argv=phase==='build'?['TP_BlankEditor','Win64','Development','-Project='+path.join(root,'TP_Blank.uproject'),'-NoEngineChanges','-NoHotReloadFromIDE','-NoUBA','-Log='+path.join(evidence,'unreal-build-tool.log')]:null;timeout=90000;}
if(engine==='unity'){exe='C:/Program Files/Unity/Hub/Editor/6000.3.26f1/Editor/Unity.exe';argv=phase==='probe'?['-version']:null;}
if(!argv)throw Error('Unsupported phase for '+engine+': '+phase);
const envKey={godot:'CGS_GODOT_EXE',unity:'CGS_UNITY_EDITOR',unreal:'CGS_UNREAL_UBT'}[engine];
const executableSelection=options.has('--exe')?'--exe':process.env[envKey]?envKey:'tested-default';
exe=options.get('--exe')||process.env[envKey]||exe;
const before={};for(const file of ['src/charge_model.gd','src/charge_beacon.gd','tests/unit/charge_model_test.gd','assets/data/charge.json','localization/en.json','scenes/charge_beacon.tscn','Source/TP_Blank/ChargeModel.h','Source/TP_Blank/ChargeModelTest.cpp'])if(fs.existsSync(path.join(root,file)))before[file]=sha(path.join(root,file));
const bundledDotnet=process.env.CGS_UE_DOTNET_ROOT||path.resolve(path.dirname(exe),'../../ThirdParty/DotNet/10.0/win-x64');
const runtimeEnv=engine==='unreal'?{...(fs.existsSync(bundledDotnet)?{DOTNET_ROOT:bundledDotnet}:{}),DOTNET_MULTILEVEL_LOOKUP:'0',DOTNET_ROLL_FORWARD:'LatestMajor',DOTNET_CLI_HOME:path.join(root,'.runtime'),DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_CLI_TELEMETRY_OPTOUT:'1'}:{};
const r=command(exe,argv,root,timeout,runtimeEnv);const errors=/SCRIPT ERROR:|PARSE FAIL:|ERROR:|Result: Failed|error C[0-9]/i.test(r.stdout+r.stderr);const result={engine,phase,...r,executable_selection:executableSelection,runtime_env:runtimeEnv,source_hashes:before,error_lines_detected:errors,status:r.error?'PENDING':r.exit_code===0&&!errors?'PASS':'FAIL',scope:phase==='run'?'Non-headless rendering and synthetic engine-event input; not physical input or human playtest.':'Actual engine/tool process only; no visual claim.',cache_caveat:engine==='unreal'?'UBT may write its default user-AppData Trace.uba even with NoUBA and redirected environment. See CGS27 evidence.':null};
put(path.join(evidence,engine+'-'+phase+'.json'),result);console.log(JSON.stringify(result));process.exitCode=result.status==='PASS'?0:1;
