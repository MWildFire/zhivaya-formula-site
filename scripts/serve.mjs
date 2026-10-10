// Local acceptance server for the production dist, including headers and real 404s.
// Serves dist under the GitHub Pages base path so local checks use the same URLs as the public site.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const mount='/zhivaya-formula-site';
const root=path.resolve('dist');
if(!fs.existsSync(path.join(root,'index.html')))throw new Error('Run npm run build first');
const common=JSON.parse(fs.readFileSync('dist/customHttp.yml','utf8')).customHeaders[0].headers;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
 if(pathname===mount){res.writeHead(301,{Location:mount+'/'});res.end();return;}
 // Paths outside the base are not part of the site: they map to a missing file and get the real 404 page.
 const local=pathname.startsWith(mount+'/')?pathname.slice(mount.length):'/outside-base';
 let file=path.resolve(root,'.'+local);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
 // Safari upgrades local HTTP assets when upgrade-insecure-requests is present.
 // Production keeps this directive; localhost intentionally has no TLS.
 for(const {key,value} of common)res.setHeader(key,key==='Content-Security-Policy'?value.replace('; upgrade-insecure-requests',''):value);
 let status=200;
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
  if(!local.endsWith('/')){res.writeHead(301,{Location:mount+local+'/'});res.end();return;}
  file=path.join(file,'index.html');
 }
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()||local==='/customHttp.yml'){status=404;file=path.join(root,'404.html');}
 if(local==='/404.html')status=404;
 if(status===200&&local.startsWith('/_astro/'))res.setHeader('Cache-Control','public, max-age=31536000, immutable');
 res.setHeader('Content-Type',types[path.extname(file)]??'application/octet-stream');
 res.writeHead(status);if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);
});
server.listen(Number(process.env.PORT??4322),'127.0.0.1',()=>console.log('Production preview: http://127.0.0.1:'+(process.env.PORT??4322)+mount+'/'));
