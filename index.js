const {league,pokemons}=require('./settings');
const {findLevels}=require('./src/utils');
const {getPokemon,getMove,multipliers}=require('./src/database');
const team=pokemons.map(p=>{
 const d=getPokemon(p.name); if(!d)throw Error('Unknown Pokémon: '+p.name);
 const levels=findLevels(d,p.cp,p.iv,multipliers);if(levels.length!==1)throw Error('Invalid CP/IV: '+p.name);
 function move(name,pool){const m=getMove(name);if(!m||!pool.includes(m.moveId))throw Error('Invalid move: '+name);return m.moveId;}
 return {...p,speciesId:d.speciesId,level:levels[0],baseStats:d.baseStats,types:d.types,moves:{fast:move(p.moves.fast,d.fastMoves),charged:p.moves.charged.map((m,i)=>move(m,i===2?d.extraChargedMoves||[]:d.chargedMoves))}};
});
module.exports={team};if(require.main===module)console.dir({league,team},{depth:null});
