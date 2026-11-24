'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {Worker}=require('node:worker_threads'),{calculateCP}=require('../utils');
function createCompiler({root,catalog,candidates}){
 const jobs=new Map(),cpms=new Map(catalog.multipliers.map(x=>[x.level,x.cpm])),species=new Map(catalog.pokemon.map(p=>[p.speciesId,p]));
 const auto=Math.max(1,Math.min(32,os.availableParallelism()-1)),requested=Number(process.env.MONOGO_WORKERS||auto),workerCount=Number.isInteger(requested)&&requested>0?Math.min(64,requested):auto;
 const directory=key=>path.join(root,'data','teams',key);
 function validate(team){
  if(!Array.isArray(team)||team.length!==3||new Set(team.map(p=>p?.speciesId)).size!==3)throw Error('Choose three distinct Pokémon');
  for(const a of team){const p=species.get(a.speciesId),v=a.iv,m=a.moves;
   if(!p||!v||!['attack','defense','stamina'].every(k=>Number.isInteger(v[k])&&v[k]>=0&&v[k]<=15)||!cpms.has(a.level)||calculateCP(p.baseStats,v,cpms.get(a.level))!==a.cp)throw Error('Invalid CP/IV configuration');
   if(!m||!p.fastMoves.includes(m.fast)||!Array.isArray(m.charged)||m.charged.length<1||m.charged.length>3||new Set(m.charged).size!==m.charged.length||!m.charged.every((id,i)=>(i===2?p.extraChargedMoves:p.chargedMoves).includes(id))||(p.thirdMoveCost===false&&m.charged.length!==1)||(a.megaLevel??null)!==p.megaLevel)throw Error('Invalid moveset or Mega level: '+p.speciesId);
  }
 }
 function snapshot(j){const inflight=[...j.active.values()],sum=k=>j.totals[k]+inflight.reduce((n,x)=>n+(x[k]||0),0),seconds=Math.max(.001,((j.ended||Date.now())-j.started)/1000);
  return {key:j.key,state:j.state,error:j.error,workers:j.workers.size,total:j.total,processed:sum('processed'),successful:sum('successful'),attempted:sum('attempted'),failed:sum('failed'),saved:j.saved,forms:catalog.pokemon.length,rate:Math.round((sum('successful')-j.cachedSuccessful)/seconds),elapsedSeconds:seconds};}
 async function stop(j,state,error){if(j.state!=='running')return;j.state='stopping';j.error=error;await Promise.allSettled([...j.workers].map(w=>w.terminate()));j.workers.clear();j.active.clear();j.ended=Date.now();j.state=state;}
 function start(team){
  validate(team);
  const key=crypto.createHash('sha256').update(JSON.stringify({version:3,revision:catalog.revision,league:catalog.league,team})).digest('hex'),previous=jobs.get(key);
  if(previous&&['running','stopping','complete'].includes(previous.state))return snapshot(previous);
  if([...jobs.values()].some(j=>['running','stopping'].includes(j.state)))throw Error('Another compilation is running');
  const dir=directory(key);fs.mkdirSync(dir,{recursive:true});
  const j={key,state:'running',started:Date.now(),workers:new Set(),active:new Map(),totals:{successful:0,failed:0,attempted:0,processed:0},saved:0,total:catalog.coverage.movesets*27,cachedSuccessful:0},queue=[];
  for(const p of catalog.pokemon){const file=path.join(dir,p.speciesId+'.json');if(fs.existsSync(file)){try{const shard=JSON.parse(fs.readFileSync(file,'utf8'));if(shard.key!==key||shard.revision!==catalog.revision||shard.summary?.processed!==candidates.get(p.speciesId).length*27||!Object.keys(j.totals).every(k=>Number.isFinite(shard.summary[k])))throw Error('Invalid shard');for(const k of Object.keys(j.totals))j.totals[k]+=shard.summary[k];j.saved++;continue;}catch(e){/* rebuild unreadable shard */}}queue.push(p);}
  j.cachedSuccessful=j.totals.successful;jobs.set(key,j);queue.sort((a,b)=>candidates.get(b.speciesId).length-candidates.get(a.speciesId).length);
  function finish(){if(j.state!=='running'||j.saved!==catalog.pokemon.length)return;
   try{const target=path.join(dir,'manifest.json');fs.writeFileSync(target+'.tmp',JSON.stringify({key,revision:catalog.revision,team,coverage:catalog.coverage,summary:j.totals,completedAt:new Date().toISOString(),complete:j.totals.failed===0}));fs.renameSync(target+'.tmp',target);}catch(e){void stop(j,'error',String(e));return;}void stop(j,'complete');}
  function dispatch(w){if(j.state!=='running')return;const p=queue.shift();if(p){j.active.set(w,{});w.postMessage(p);}else{j.workers.delete(w);void w.terminate();finish();}}
  if(!queue.length){finish();return snapshot(j);}
  for(let i=0;i<Math.min(workerCount,queue.length);i++){const w=new Worker(path.join(__dirname,'compile-worker.js'),{workerData:{team,key,revision:catalog.revision,dir}});j.workers.add(w);
   w.on('message',m=>{if(j.state!=='running')return;if(m.type==='ready')dispatch(w);else if(m.type==='progress')j.active.set(w,m);else if(m.type==='done'){j.active.delete(w);for(const k of Object.keys(j.totals))j.totals[k]+=m[k];j.saved++;dispatch(w);}});
   w.on('error',e=>{if(j.workers.has(w))void stop(j,'error',String(e));});w.on('exit',code=>{if(j.state==='running'&&j.workers.has(w))void stop(j,'error','Worker exited: '+code);});
  }return snapshot(j);
 }
 return {start,status:key=>jobs.has(key)?snapshot(jobs.get(key)):null,cancel:async key=>{const j=jobs.get(key);if(j)await stop(j,'cancelled');return j?snapshot(j):null;},directory};
}
module.exports={createCompiler};
