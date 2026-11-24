const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=__dirname, upstream=path.join(root,'src/pvpoke');
if(!fs.existsSync(path.join(upstream,'src/data/gamemaster.json'))){console.log('Cloning PvPoke…');execFileSync('git',['clone','https://github.com/pvpoke/pvpoke.git',upstream],{stdio:'inherit'});execFileSync('git',['-C',upstream,'checkout','797820327642f49deb8e9706492090ccac680bc7'],{stdio:'inherit'});}
const {league,pokemons}=require('./settings'),{team}=require('./index');
const port=Number(process.env.PORT||3000);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/team'&&req.method==='GET'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({league,pokemons,team}));}
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
