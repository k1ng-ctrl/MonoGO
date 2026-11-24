'use strict';
// Selection policy, not an assertion of independently verified live legality.
const id='master-mega',version=1,cp=10000,cup='mega';
const unique=xs=>[...new Set(xs)].sort();
function eligible(p){return p.released===true;}
function normalize(p){
 const tags=p.tags||[],mega=tags.includes('mega'),supermega=tags.includes('supermega');
 const charged=[...p.chargedMoves];
 if(tags.includes('shadow'))charged.push('FRUSTRATION');
 // Mirror upstream pool construction, but do not assume purified Mega eligibility.
 if(tags.includes('shadoweligible')&&!mega&&p.level25CP<=cp)charged.push('RETURN');
 return {...p,fastMoves:unique(p.fastMoves),chargedMoves:unique(charged),extraChargedMoves:unique(mega?(p.extraChargedMoves||[]):[]),opponentLevel:supermega?52:(p.levelCap||50),megaLevel:mega?(supermega?4:3):null};
}
function configs(p){
 const result=[];
 for(const fast of p.fastMoves){
  for(let i=0;i<p.chargedMoves.length;i++){
   const a=p.chargedMoves[i];
   result.push({fast,charged:[a]});
   // Keep both orders: upstream tie-breaking may depend on ordering.
   for(let j=0;j<p.chargedMoves.length;j++){
    if(i===j)continue;
    const pair=[a,p.chargedMoves[j]];
    result.push({fast,charged:pair});
    for(const extra of p.extraChargedMoves)if(!pair.includes(extra))result.push({fast,charged:[...pair,extra]});
   }
  }
 }
 return result;
}
module.exports={id,version,cp,cup,eligible,normalize,configs};
