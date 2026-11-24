'use strict';
const el=id=>document.getElementById(id);
let catalog,editors=[],dataset,running=false,cancelled=false,requestId=0;
const pages=['dashboard','leaguePage','setup','preparing','battlePage'];
function show(page){for(const id of pages)el(id).hidden=id!==page;el('error').textContent='';}
function status(s){el('status').textContent=s;}
function error(e){el('error').textContent=e.message||String(e);}
async function json(url,opts){const r=await fetch(url,opts);if(!r.ok)throw Error(await r.text());return r.json();}
function options(s,rows,value){s.replaceChildren(...rows.map(([id,name])=>new Option(name,id)));if(rows.some(([id])=>String(id)===String(value)))s.value=value;}
function field(parent,name,tag='select'){const l=document.createElement('label'),s=document.createElement(tag);l.textContent=name;l.append(s);parent.append(l);return s;}
function editor(initial,i){
 const card=document.createElement('article');card.className='card';const h=document.createElement('h3');h.textContent='Pokémon '+(i+1);card.append(h);el('team').append(card);
 const species=field(card,'Pokémon'),cp=field(card,'CP','input');cp.type='number';cp.min=10;cp.step=1;cp.value=initial.cp;
 options(species,catalog.pokemon.map(p=>[p.speciesId,p.speciesName]),initial.speciesId);
 const ivs=document.createElement('div');ivs.className='ivs';card.append(ivs);
 const ivFields={};for(const key of ['attack','defense','stamina']){const s=field(ivs,key+' IV');options(s,Array.from({length:16},(_,n)=>[n,n]),initial.iv[key]);ivFields[key]=s;}
 const level=document.createElement('p');card.append(level);
 const fast=field(card,'Fast move'),c1=field(card,'Charged move 1'),c2=field(card,'Charged move 2'),c3=field(card,'Extra charged move'),mega=field(card,'Mega level');
 const p=()=>catalog.pokemon.find(x=>x.speciesId===species.value);
 const iv=()=>Object.fromEntries(Object.entries(ivFields).map(([k,s])=>[k,Number(s.value)]));
 function levels(){const s=p().baseStats,v=iv();const matches=catalog.multipliers.filter(({cpm})=>Math.max(10,Math.floor((s.atk+v.attack)*Math.sqrt(s.def+v.defense)*Math.sqrt(s.hp+v.stamina)*Math.pow(cpm,2)/10))===Number(cp.value)).map(x=>x.level);level.textContent=matches.length===1?'Level '+matches[0]:'Enter CP matching IVs and a unique level';return matches;}
 const moveRows=ids=>(ids||[]).map(id=>[id,catalog.moves[id]||id]);
 function moves(config){const x=p(),m=config?.moves;options(fast,moveRows(x.fastMoves),m?.fast);options(c1,moveRows(x.chargedMoves),m?.charged[0]);options(c2,[['','None'],...(x.thirdMoveCost===false?[]:moveRows(x.chargedMoves))],m?.charged[1]||'');c2.disabled=x.thirdMoveCost===false;options(c3,[['','None'],...moveRows(x.extraChargedMoves)],m?.charged[2]||'');c3.parentElement.hidden=!x.extraChargedMoves?.length;mega.parentElement.hidden=x.megaLevel==null;options(mega,[[x.megaLevel,String(x.megaLevel)]],x.megaLevel);levels();}
 species.onchange=()=>{cp.value='';moves();};cp.oninput=levels;Object.values(ivFields).forEach(s=>s.onchange=levels);moves(initial);
 return ()=>{const x=p(),ls=levels();if(ls.length!==1||!Number.isInteger(Number(cp.value)))throw Error(x.speciesName+': invalid CP/IV combination');const charged=[c1.value,c2.value,c3.parentElement.hidden?'':c3.value].filter(Boolean);if(!fast.value||!charged.length||new Set(charged).size!==charged.length||(!c3.parentElement.hidden&&c3.value&&!c2.value))throw Error(x.speciesName+': choose valid distinct moves');return {name:x.speciesName,speciesId:x.speciesId,cp:Number(cp.value),iv:iv(),level:ls[0],baseStats:x.baseStats,types:x.types,moves:{fast:fast.value,charged},...(mega.parentElement.hidden?{}:{megaLevel:Number(mega.value)})};};
}
function url(key,species){return '/api/compile?key='+key+(species?'&species='+encodeURIComponent(species):'');}
function render(){
 el('results').replaceChildren();const entry=dataset?.shard?.entries[Number(el('moveset').value)];if(!entry)return;
 if(entry.error){el('opponentInfo').textContent='Simulation unavailable: '+entry.error;return;}
 const shield=el('ours').value+'-'+el('theirs').value;
 for(const p of dataset.team){const r=entry.results[p.speciesId][shield],card=document.createElement('article');card.className='card';
 for(const [tag,text,cls] of [['h3',p.name,''],['p',r.rating+' / 1000','rating '+(r.winner==='ours'?'win':r.winner==='theirs'?'loss':'')],['p',r.winner==='ours'?'Win':r.winner==='theirs'?'Loss':'Tie',''],['p',r.remainingHP+' HP · '+r.remainingEnergy+' energy remaining',''],['small','Opponent: '+r.opponentRemainingHP+' HP · '+r.opponentRemainingEnergy+' energy','']]){const n=document.createElement(tag);n.textContent=text;n.className=cls;card.append(n);}el('results').append(card);}
 const p=catalog.pokemon.find(p=>p.speciesId===dataset.shard.speciesId);
 el('opponentInfo').textContent=p.speciesName+' · Level '+p.opponentLevel+' · '+dataset.shard.entries.length+' candidate movesets';
}
async function loadOpponent(){const token=++requestId,id=el('opponent').value;dataset.shard=null;el('moveset').replaceChildren();el('results').replaceChildren();el('opponentInfo').textContent='Loading…';
 try{const shard=await json(url(dataset.key,id));if(token!==requestId)return;if(!shard)throw Error('Missing compiled opponent');dataset.shard=shard;options(el('moveset'),shard.entries.map((x,i)=>[i,[x.moves.fast,...x.moves.charged].map(m=>catalog.moves[m]||m).join(' / ')+(x.error?' (unavailable)':'')]));render();}catch(e){if(token===requestId)error(e);}}
function openBattle(team,key){dataset={team,key,shard:null};options(el('opponent'),catalog.pokemon.map(p=>[p.speciesId,p.speciesName]),'groudon');show('battlePage');status(catalog.pokemon.length+' opponent forms compiled.');loadOpponent();}
async function prepare(){
 if(running)return;let team;try{team=editors.map(read=>read());if(new Set(team.map(p=>p.speciesId)).size!==3)throw Error('Choose three distinct Pokémon');}catch(e){error(e);return;}
 running=true;cancelled=false;el('home').disabled=true;show('preparing');el('progress').value=0;status('Starting backend compiler…');
 try{let job=await json('/api/compile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team})});const key=job.key;
  while(job&&['running','stopping'].includes(job.state)){
   if(cancelled&&job.state==='running'){job=await json(url(key),{method:'DELETE'});break;}
   el('progress').value=job.processed/job.total;
   status(job.processed.toLocaleString()+' / '+job.total.toLocaleString()+' cases · '+job.successful.toLocaleString()+' successful · '+job.failed+' failed movesets · '+job.rate.toLocaleString()+' successful/sec · '+job.workers+' workers');
   await new Promise(r=>setTimeout(r,600));job=await json(url(key));
  }
  if(job?.state==='complete'){openBattle(team,key);status(job.successful.toLocaleString()+' successful simulations · '+job.failed+' failed movesets · '+Math.round(job.elapsedSeconds)+' seconds');}
  else if(job?.state==='cancelled'){show('setup');status('Cancelled. Completed opponents saved for resume.');}
  else throw Error(job?.error||'Compilation unavailable');
 }catch(e){show('setup');error(e);status('Preparation interrupted. Saved opponents can be resumed.');}finally{running=false;el('home').disabled=false;}
}
el('home').onclick=()=>show('dashboard');el('pvp').onclick=()=>show('leaguePage');el('next').onclick=()=>show('setup');el('edit').onclick=()=>show('setup');el('prepare').onclick=prepare;el('cancel').onclick=()=>{cancelled=true;};el('opponent').onchange=loadOpponent;for(const id of ['moveset','ours','theirs'])el(id).onchange=render;
async function init(){const [data,db]=await Promise.all([json('/api/team'),json('/api/catalog')]);catalog=db;editors=data.team.map(editor);el('pvp').disabled=false;status('Ready · '+catalog.coverage.released+' released forms · '+catalog.coverage.movesets.toLocaleString()+' candidate movesets · '+(catalog.coverage.movesets*27).toLocaleString()+' planned cases');}
init().catch(e=>{status('Initialization failed');error(e);});
