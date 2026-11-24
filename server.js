const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=__dirname, upstream=path.join(root,'src/pvpoke');
if(!fs.existsSync(path.join(upstream,'src/data/gamemaster.json'))){console.log('Cloning PvPoke…');execFileSync('git',['clone','https://github.com/pvpoke/pvpoke.git',upstream],{stdio:'inherit'});execFileSync('git',['-C',upstream,'checkout','797820327642f49deb8e9706492090ccac680bc7'],{stdio:'inherit'});}
const {league,pokemons}=require('./settings'),{team}=require('./index');
const {gamemaster,multipliers}=require('./src/database');
const crypto=require('node:crypto');
const rankingFile=path.join(upstream,'src/data/rankings/mega/overall/rankings-10000.json');
const rankingRows=require(rankingFile),rankedIds=new Set(rankingRows.map(r=>r.speciesId));
const revision=crypto.createHash('sha256').update(execFileSync('git',['-C',upstream,'rev-parse','HEAD'])).update(fs.readFileSync(path.join(upstream,'src/data/gamemaster.json'))).update(fs.readFileSync(rankingFile)).update(fs.readFileSync(path.join(root,'public/simulator.js'))).digest('hex');
const catalog={revision,multipliers,pokemon:gamemaster.pokemon.filter(p=>rankedIds.has(p.speciesId)).sort((a,b)=>a.speciesName.localeCompare(b.speciesName)),moves:Object.fromEntries(gamemaster.moves.map(m=>[m.moveId,m.name]))};
const port=Number(process.env.PORT||3000);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/team'&&req.method==='GET'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({league,pokemons,team}));}
 if(url.pathname==='/api/catalog'&&req.method==='GET'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(catalog));}
 if(url.pathname==='/api/cache'&&['GET','POST'].includes(req.method)){
  res.setHeader('Content-Type','application/json');
  const dir=path.join(root,'data','cache'),valid=k=>typeof k==='string'&&/^[a-f0-9]{64}$/.test(k);
  if(req.method==='GET'){const k=url.searchParams.get('key');if(!valid(k)){res.writeHead(400);return res.end('{}');}try{return res.end(await fs.promises.readFile(path.join(dir,k+'.json')));}catch(e){if(e.code==='ENOENT')return res.end('null');throw e;}}
  if(![`http://localhost:${port}`,`http://127.0.0.1:${port}`].includes(req.headers.origin)){res.writeHead(403);return res.end('{}');}
  let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>100*1024*1024){res.writeHead(413);return res.end('{}');}chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks));
  if(!valid(data.cacheKey)||!data.complete||data.upstream!==revision||data.errors?.length!==0||!Array.isArray(data.team)||data.team.length!==3||Object.keys(data.matchups||{}).length!==rankingRows.length){res.writeHead(400);return res.end('Invalid dataset');}
  fs.mkdirSync(dir,{recursive:true});const target=path.join(dir,data.cacheKey+'.json'),tmp=target+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data));fs.renameSync(tmp,target);
  const latest=path.join(root,'data','matchups.json');fs.writeFileSync(latest+'.tmp',JSON.stringify(data,null,2));fs.renameSync(latest+'.tmp',latest);return res.end('{"saved":true}');
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
