const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=__dirname, upstream=path.join(root,'src/pvpoke');
if(!fs.existsSync(path.join(upstream,'src/data/gamemaster.json'))){console.log('Cloning PvPoke…');execFileSync('git',['clone','https://github.com/pvpoke/pvpoke.git',upstream],{stdio:'inherit'});execFileSync('git',['-C',upstream,'checkout','797820327642f49deb8e9706492090ccac680bc7'],{stdio:'inherit'});}
const {league,pokemons}=require('./settings'),{team}=require('./index');
const {gamemaster,multipliers}=require('./src/database');
const crypto=require('node:crypto');
const rules=require('./src/leagues').getLeague('master-mega');
const pokemon=gamemaster.pokemon.filter(rules.eligible).map(rules.normalize).sort((a,b)=>a.speciesName.localeCompare(b.speciesName));
const candidates=new Map(pokemon.map(p=>[p.speciesId,rules.configs(p)]));
const revision=crypto.createHash('sha256').update(execFileSync('git',['-C',upstream,'rev-parse','HEAD'])).update(fs.readFileSync(path.join(upstream,'src/data/gamemaster.json'))).update(fs.readFileSync(path.join(root,'public/simulator.js'))).update(fs.readFileSync(path.join(root,'src/leagues/master-mega.js'))).digest('hex');
const catalog={revision,league:rules.id,ruleVersion:rules.version,multipliers,pokemon,moves:Object.fromEntries(gamemaster.moves.map(m=>[m.moveId,m.name])),coverage:{total:gamemaster.pokemon.length,released:pokemon.length,excluded:gamemaster.pokemon.filter(p=>!rules.eligible(p)).map(p=>({speciesId:p.speciesId,reason:'not marked released in GameMaster'})),movesets:[...candidates.values()].reduce((n,x)=>n+x.length,0)},counts:Object.fromEntries([...candidates].map(([id,x])=>[id,x.length]))};
const port=Number(process.env.PORT||3000);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/team'&&req.method==='GET'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({league,pokemons,team}));}
 if(url.pathname==='/api/catalog'&&req.method==='GET'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(catalog));}
 if(url.pathname==='/api/compile'&&['GET','POST'].includes(req.method)){
  res.setHeader('Content-Type','application/json');
  const key=url.searchParams.get('key'),species=url.searchParams.get('species');
  if(!/^[a-f0-9]{64}$/.test(key||'')||(species!==null&&!candidates.has(species))){res.writeHead(400);return res.end('Invalid key or species');}
  const dir=path.join(root,'data','teams',key),manifest=path.join(dir,'manifest.json');
  if(req.method==='GET'){
   if(species){try{return res.end(await fs.promises.readFile(path.join(dir,species+'.json')));}catch(e){if(e.code==='ENOENT')return res.end('null');throw e;}}
   let saved=[];try{saved=(await fs.promises.readdir(dir)).filter(n=>n.endsWith('.json')&&candidates.has(n.slice(0,-5))).map(n=>n.slice(0,-5));}catch(e){if(e.code!=='ENOENT')throw e;}
   return res.end(JSON.stringify({saved}));
  }
  if(![`http://localhost:${port}`,`http://127.0.0.1:${port}`].includes(req.headers.origin)){res.writeHead(403);return res.end('Forbidden');}
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>100*1024*1024){res.writeHead(413);return res.end('Too large');}chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks));
  if(data.revision!==revision||data.key!==key){res.writeHead(400);return res.end('Revision mismatch');}
  if(!Array.isArray(data.team)||data.team.length!==3){res.writeHead(400);return res.end('Invalid team');}
  const expectedKey=crypto.createHash('sha256').update(JSON.stringify({version:2,revision,league:rules.id,team:data.team})).digest('hex');
  if(expectedKey!==key){res.writeHead(400);return res.end('Team key mismatch');}
  if(species){
   const expected=candidates.get(species);
   if(data.speciesId!==species||!Array.isArray(data.entries)||data.entries.length!==expected.length||!data.entries.every((entry,i)=>JSON.stringify(entry.moves)===JSON.stringify(expected[i])&&(entry.error||data.team.every(p=>Object.keys(entry.results?.[p.speciesId]||{}).length===9)))){res.writeHead(400);return res.end('Invalid shard');}
  }else{
   const saved=await fs.promises.readdir(dir);
   if(!pokemon.every(p=>saved.includes(p.speciesId+'.json'))){res.writeHead(400);return res.end('Missing shards');}
  }
  fs.mkdirSync(dir,{recursive:true});const target=species?path.join(dir,species+'.json'):manifest,tmp=target+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data));fs.renameSync(tmp,target);return res.end('{"saved":true}');
 }
 if(url.pathname==='/api/movesets'&&req.method==='GET'){
  const species=url.searchParams.get('species');if(!candidates.has(species)){res.writeHead(404);return res.end('Unknown species');}
  res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(candidates.get(species)));
 }
 if(url.pathname==='/api/matchups'&&req.method==='POST'){
  if(req.headers.origin!==`http://localhost:${port}`&&req.headers.origin!==`http://127.0.0.1:${port}`){res.writeHead(403);return res.end('Forbidden');}
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>100*1024*1024){res.writeHead(413);return res.end('Too large');}chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks));if(!data.matchups||!Array.isArray(data.errors))throw Error('Invalid dataset');
  fs.mkdirSync(path.join(root,'data'),{recursive:true});const target=path.join(root,'data','matchups.json');fs.writeFileSync(target+'.tmp',JSON.stringify(data,null,2));fs.renameSync(target+'.tmp',target);return res.end('Saved data/matchups.json');
 }
 if(req.method!=='GET'){res.writeHead(405);return res.end();}
 const isUpstream=url.pathname.startsWith('/pvpoke/');const base=isUpstream?path.join(upstream,'src'):path.join(root,'public');const rel=isUpstream?url.pathname.replace(/^\/pvpoke\/src\//,''):url.pathname==='/'?'index.html':url.pathname.slice(1);const file=path.resolve(base,rel);
 if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end('Forbidden');}
 const content=await fs.promises.readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(content);
}catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end(String(e.message));}}).listen(port,'127.0.0.1',()=>console.log(`MonoGo: http://localhost:${port}`));
