'use strict';
const {parentPort,workerData}=require('node:worker_threads');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const engine=require('./headless').createEngine(),rules=require('../leagues').getLeague('master-mega');
const {team,key,revision,dir}=workerData;
parentPort.on('message',p=>{
 const entries=[],movesets=rules.configs(p);let successful=0,failed=0,attempted=0,last=Date.now();
 for(const moves of movesets){
  const b={speciesId:p.speciesId,name:p.speciesName,level:p.opponentLevel,megaLevel:p.megaLevel,iv:{attack:15,defense:15,stamina:15},moves},results={};
  try{for(const a of team){results[a.speciesId]={};for(let x=0;x<3;x++)for(let y=0;y<3;y++){attempted++;results[a.speciesId][x+'-'+y]=engine.simulate(a,b,[x,y]);successful++;}}entries.push({moves,results});}
  catch(e){failed++;entries.push({moves,error:String(e)});}
  if(Date.now()-last>500){parentPort.postMessage({type:'progress',successful,failed,attempted,processed:entries.length*27});last=Date.now();}
 }
 const summary={successful,failed,attempted,processed:movesets.length*27};
 const target=path.join(dir,p.speciesId+'.json'),tmp=target+'.'+crypto.randomUUID()+'.tmp';
 fs.writeFileSync(tmp,JSON.stringify({key,revision,team,speciesId:p.speciesId,summary,entries}));fs.renameSync(tmp,target);
 parentPort.postMessage({type:'done',...summary});
});
parentPort.postMessage({type:'ready'});
