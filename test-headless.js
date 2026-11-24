'use strict';
const assert=require('node:assert/strict'),engine=require('./src/pokeGOD/headless').createEngine(),{team}=require('./index');
const b={speciesId:'groudon',level:50,iv:{attack:15,defense:15,stamina:15},moves:{fast:'MUD_SHOT',charged:['PRECIPICE_BLADES','FIRE_PUNCH']}};
for(const p of team)for(let x=0;x<3;x++)for(let y=0;y<3;y++){const a={...p,...(p.speciesId==='mewtwo_mega_y'?{megaLevel:4}:{})};const result=engine.simulate(a,b,[x,y]);assert.ok(Number.isFinite(result.rating));assert.deepEqual(engine.simulate(a,b,[x,y]),result);}
console.log('Headless engine smoke test passed');
