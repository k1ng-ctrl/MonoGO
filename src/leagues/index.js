'use strict';
const masterMega=require('./master-mega');
const leagues=new Map([[masterMega.id,masterMega]]);
function getLeague(id){const league=leagues.get(id);if(!league)throw Error('Unsupported league: '+id);return league;}
module.exports={getLeague};
