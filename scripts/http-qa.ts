import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { absoluteUrl } from '../src/lib/paths';
import { writeReport } from './content';
const base=(process.argv[2]??'http://127.0.0.1:4322').replace(/\/$/,'');
const remote=!new URL(base).hostname.match(/^(localhost|127\.0\.0\.1)$/);
const pages=new URL(base).hostname.endsWith('.github.io');
if(remote)assert.equal(new URL(base).protocol,'https:');
const build=JSON.parse(fs.readFileSync('artifacts/qa/build-validation.json','utf8')) as {publicRoutes:string[]};
const files=fs.readdirSync('dist',{recursive:true}).map(String).filter(f=>fs.statSync(path.join('dist',f)).isFile());
const assets=files.filter(f=>/\.(js|css|svg)$/.test(f));
const checks:unknown[]=[];
const sha=(data:Uint8Array)=>createHash('sha256').update(data).digest('hex');
async function check(route:string,expected:number){
 const response=await fetch(base+route,{signal:AbortSignal.timeout(30000)});const bytes=new Uint8Array(await response.arrayBuffer());const text=new TextDecoder().decode(bytes);
 assert.equal(response.status,expected,`${route}: HTTP status`);if(remote)assert.ok(response.url.startsWith('https://'));
 const type=response.headers.get('content-type')??'';
 if(expected===200){
  const file=route.endsWith('/')?route.slice(1)+'index.html':route.slice(1);
  if(assets.includes(file)){
   assert.equal(sha(bytes),sha(fs.readFileSync('dist/'+file)),`${route}: asset bytes`);
   assert.ok(type.includes(file.endsWith('.js')?'javascript':file.endsWith('.css')?'text/css':'image/svg+xml'),`${route}: MIME ${type}`);
  }else if(route.endsWith('/')){
   assert.ok(type.includes('text/html'));const $=load(text);
   assert.equal($('link[rel=canonical]').attr('href'),absoluteUrl(route));assert.ok($('meta[http-equiv="Content-Security-Policy"]').attr('content')?.includes("script-src 'self'"),`${route}: CSP meta`);assert.equal($('h1').length,1);
   assert.equal(sha(bytes),sha(fs.readFileSync('dist/'+file)),`${route}: deployed HTML equals dist`);
  }
  if(remote&&!pages){assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.ok(response.headers.get('content-security-policy')?.includes("script-src 'self'"));assert.ok(response.headers.get('strict-transport-security')?.includes('max-age='));}
 }else{assert.ok(text.includes('Такой страницы здесь нет')||text.includes('Страница не найдена'),`${route}: custom error body`);}
 checks.push({route,status:response.status,finalUrl:response.url,type,bytes:bytes.length,sha256:sha(bytes),cacheControl:response.headers.get('cache-control')});
}
const routes=[...build.publicRoutes,...assets.map(f=>'/'+f),'/sitemap.xml','/robots.txt'];
for(let i=0;i<routes.length;i+=6)await Promise.all(routes.slice(i,i+6).map(r=>check(r,200)));
for(const route of ['/not-a-page-qa/','/missing-qa.js','/biology/not-a-lesson/','/missing-qa.md','/.env'])await check(route,404);
for(const route of ['/biology','/tests/C09','/chemistry']){const r=await fetch(base+route,{redirect:'manual'});assert.ok([301,302,307,308].includes(r.status),`${route}: clean URL redirect`);assert.ok(r.headers.get('location')?.endsWith(route+'/'));checks.push({route,status:r.status,location:r.headers.get('location')});}
writeReport(remote?'public-http':'local-http',{checkedAt:new Date().toISOString(),base,remote,checks});console.log(`HTTP QA passed: ${checks.length} route/asset/404/redirect checks on ${base}`);
