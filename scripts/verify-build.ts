import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { load } from 'cheerio';
import { readContent,writeReport } from './content';
import { site } from '../src/config/site';
import { absoluteUrl, withBase } from '../src/lib/paths';
const files=fs.readdirSync('dist',{recursive:true}).map(String).filter(f=>fs.statSync(path.join('dist',f)).isFile());
const pages=files.filter(f=>f.endsWith('.html'));assert.equal(pages.length,78);
const urls=pages.map(f=>f==='index.html'?'/':f.endsWith('/index.html')?'/'+f.slice(0,-10):'/'+f);
const parsed=new Map(pages.map((f,i)=>[urls[i]!,load(fs.readFileSync(path.join('dist',f),'utf8'))]));
let links=0;
for(const [url,$] of parsed){
 assert.equal($('html').attr('lang'),'ru');assert.equal($('h1').length,1,`${url}: one h1`);
 assert.ok($('title').text().length>10);assert.ok($('meta[name=description]').attr('content'));
 assert.equal($('link[rel=canonical]').attr('href'),absoluteUrl(url));
 assert.equal($('meta[name=robots]').attr('content'),site.indexing&&url!='/404.html'?'index, follow':'noindex, follow');
 assert.equal($('img:not([alt])').length,0);assert.equal($('script:not([src])').length,0,`${url}: CSP requires external JS`);
 assert.equal($('[style]').length,0,`${url}: no inline styles`);
 $('a[href],link[href],script[src],img[src],use[href]').each((_,el)=>{
  const value=$(el).attr('href')??$(el).attr('src')!;if(/^(https?:|mailto:|tel:|data:)/.test(value))return;
  const target=new URL(value,absoluteUrl(url));assert.ok(target.pathname.startsWith(site.base+'/')||target.pathname===site.base,`${url}: link outside base ${value}`);const pathname=decodeURI(target.pathname).slice(site.base.length);
  const file=pathname.endsWith('/')?pathname.slice(1)+'index.html':pathname.slice(1);
  assert.ok(files.includes(file),`${url}: missing ${value}`);links++;
  if(target.hash&&parsed.has(pathname))assert.ok(parsed.get(pathname)!('[id]').toArray().some(e=>parsed.get(pathname)!(e).attr('id')===decodeURIComponent(target.hash.slice(1))),`${url}: broken anchor ${value}`);
 });
}
const {lessons,quizzes}=readContent();
for(const {data:l} of lessons){
 const url=`/${l.subject}/${l.slug}/`;const $=parsed.get(url)!;assert.ok($(`a[href="${withBase(`/tests/${l.id}/`)}"]`).length);
 assert.ok(parsed.get(`/tests/${l.id}/`)!(`a[href="${withBase(url)}"]`).length);
 for(const q of quizzes.find(q=>q.topicId===l.id)!.questions)assert.ok($('[id]').toArray().some(e=>$(e).attr('id')===q.lessonAnchor),`${q.id}: missing lesson anchor ${q.lessonAnchor}`);
}
assert.equal(parsed.get('/facts/')!('[data-item]').length,36);
for(const f of files)assert.ok(/^(?:_astro\/[^/]+\.(?:js|css)|images\/[a-z-]+\.svg|favicon\.svg|(?:[a-zA-Z0-9-]+\/)*index\.html|404\.html|sitemap\.xml|robots\.txt|customHttp\.yml)$/.test(f),`Unexpected public file ${f}`);
const sitemap=load(fs.readFileSync('dist/sitemap.xml','utf8'),{xmlMode:true});assert.equal(sitemap('loc').length,77);
sitemap('loc').each((_,el)=>assert.ok(sitemap(el).text().startsWith(absoluteUrl('/'))));
const jsGzip=files.filter(f=>f.endsWith('.js')).reduce((n,f)=>n+gzipSync(fs.readFileSync(path.join('dist',f))).length,0);
assert.ok(jsGzip<100*1024);const bytes=files.reduce((n,f)=>n+fs.statSync(path.join('dist',f)).size,0);
const report={checkedAt:new Date().toISOString(),site:absoluteUrl('/'),pages:pages.length,publicRoutes:urls.filter(u=>u!='/404.html'),internalLinks:links,files:files.length,bytes,allJavaScriptGzipBytes:jsGzip,checks:'titles, descriptions, canonical, robots, lang, h1, alt, CSP, files, internal links and fragments, all quiz lesson anchors, sitemap'};
writeReport('build-validation',report);console.log(`Build OK: ${pages.length} HTML pages, ${links} internal links, ${jsGzip} bytes gzipped JS.`);
