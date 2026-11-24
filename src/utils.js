function calculateCP(s,iv,cpm){return Math.max(10,Math.floor((s.atk+iv.attack)*Math.sqrt(s.def+iv.defense)*Math.sqrt(s.hp+iv.stamina)*cpm**2/10));}
function findLevels(p,cp,iv,multipliers){return multipliers.filter(x=>calculateCP(p.baseStats,iv,x.cpm)===cp).map(x=>x.level);}
module.exports={calculateCP,findLevels};
