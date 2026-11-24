'use strict';
const MonoGo = (() => {
    function createPokemon(config, index, battle, shields) {
        const p = new Pokemon(config.speciesId, index, battle);
        battle.setNewPokemon(p, index);
        if (config.megaLevel) p.setMegaLevel(config.megaLevel);
        p.autoLevel = false;
        p.setIV('atk', config.iv.attack);
        p.setIV('def', config.iv.defense);
        p.setIV('hp', config.iv.stamina);
        p.setLevel(config.level);
        p.selectMove('fast', config.moves.fast, 0, true);
        // Set exact slots from the simulator's initialized pools; selectMove may
        // silently replace duplicate defaults or leave unused slots equipped.
        p.chargedMoves = config.moves.charged.map((id,i)=>{
            const move=(i===2?p.extraChargedMovePool:p.chargedMovePool).find(m=>m.moveId===id);
            if(!move)throw Error('Unsupported charged move: '+id);
            return move;
        });
        p.resetMoves();
        if (p.fastMove?.moveId !== config.moves.fast || config.moves.charged.some((m,i)=>p.chargedMoves[i]?.moveId !== m)) throw Error('Moveset mismatch: '+config.speciesId);
        if (config.cp != null && p.cp !== config.cp) throw Error(`${config.speciesId}: CP mismatch ${p.cp} != ${config.cp}`);
        p.setShields(shields);
        p.setStartHp(p.stats.hp);
        p.setStartEnergy(0);
        return p;
    }
    function simulate(a,b,shields=[1,1]) {
        const battle = new Battle();
        battle.setCP(10000);
        battle.setCup('mega');
        const p1 = createPokemon(a,0,battle,shields[0]);
        const p2 = createPokemon(b,1,battle,shields[1]);
        battle.simulate();
        const [rating,opponentRating] = battle.getBattleRatings();
        if (![rating,opponentRating,p1.hp,p2.hp,p1.energy,p2.energy].every(Number.isFinite)) throw Error('Invalid battle result');
        return {rating,opponentRating,winner:rating>opponentRating?'ours':rating<opponentRating?'theirs':'tie',remainingHP:p1.hp,opponentRemainingHP:p2.hp,remainingEnergy:p1.energy,opponentRemainingEnergy:p2.energy,durationMs:battle.getDuration(),opponentCP:p2.cp};
    }
    function opponentConfig(row,gm) {
        const p = gm.getPokemonById(row.speciesId);
        if (!p) throw Error('Missing species: '+row.speciesId);
        const moves = row.moveset;
        if (!Array.isArray(moves)||!moves.length) throw Error('Missing moveset: '+row.speciesId);
        return {speciesId:row.speciesId,name:p.speciesName,level:p.levelCap===52?52:50,megaLevel:p.levelCap===52?4:undefined,iv:{attack:15,defense:15,stamina:15},moves:{fast:moves[0],charged:moves.slice(1).filter(m=>m && m!=='NONE')}};
    }
    return {simulate,opponentConfig};
})();
