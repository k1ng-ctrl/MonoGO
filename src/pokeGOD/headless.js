'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),upstream=path.join(root,'src/pvpoke/src');
const scripts=['GameMaster.js','pokemon/Pokemon.js','battle/DamageCalculator.js','battle/actions/ActionLogic.js','battle/timeline/TimelineAction.js','battle/timeline/TimelineEvent.js','battle/Battle.js'];
function createEngine(){
 const data=JSON.parse(fs.readFileSync(path.join(upstream,'data/gamemaster.json'),'utf8')),pending=[];
 const $=()=>({insertAfter(){},eq(){return this;}});
 $.ajax=o=>pending.push(()=>o.success(data));
 $.each=(items,fn)=>{for(const key of Object.keys(items))if(fn(key,items[key])===false)break;};
 // Original scripts use non-strict globals; keep their lexical scope together.
 const source=scripts.map(file=>fs.readFileSync(path.join(upstream,'js',file),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(root,'public/simulator.js'),'utf8');
 return new Function('$','host','webRoot','siteVersion','settings','pending','console',source+'\nGameMaster.getInstance();pending.forEach(f=>f());return MonoGo;')($,'http://localhost/','','monogo',{gamemaster:'gamemaster'},pending,{log(){},error:console.error.bind(console)});
}
module.exports={createEngine};
