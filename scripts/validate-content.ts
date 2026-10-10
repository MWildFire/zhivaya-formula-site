import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readContent,writeReport } from './content';
const {lessons,quizzes}=readContent();
const expected=['B','C'].flatMap(p=>Array.from({length:18},(_,i)=>p+String(i+1).padStart(2,'0')));
assert.deepEqual(lessons.map(l=>l.data.id),expected,'36 unique lesson IDs');
assert.deepEqual(quizzes.map(q=>q.topicId),expected,'one quiz per lesson');
assert.equal(new Set(quizzes.map(q=>q.id)).size,36);
assert.equal(new Set(lessons.map(l=>l.data.fact.text)).size,36);
assert.equal(new Set(lessons.map(l=>`/${l.data.subject}/${l.data.slug}/`)).size,36);
const curriculum=JSON.parse(fs.readFileSync('scripts/curriculum.json','utf8')) as {id:string;title:string;classes:string}[];
const details=lessons.map(({file,data:l,body})=>{
 const row=curriculum.find(r=>r.id===l.id)!;
 const grades=[...row.classes.matchAll(/(\d+)(?:–(\d+))?/g)].flatMap(m=>Array.from({length:Number(m[2]??m[1])-Number(m[1])+1},(_,i)=>Number(m[1])+i));
 assert.equal(l.title,row.title,`${l.id}: curriculum title`);assert.deepEqual(l.grades,grades,`${l.id}: grade gaps`);
 assert.equal(l.subject,l.id.startsWith('B')?'biology':'chemistry');assert.equal(l.order,Number(l.id.slice(1)));
 const words=body.trim().split(/\s+/).length;const factWords=l.fact.text.trim().split(/\s+/).length;
 assert.ok(words>=(l.introductory?300:450)&&words<=(l.introductory?500:750),`${l.id}: ${words} words`);
 assert.ok(factWords>=40&&factWords<=80,`${l.id}: ${factWords} fact words`);
 assert.ok(!/TODO|TBD|Lorem ipsum|здесь будет|заглушка|content goes here/i.test(body+l.fact.text),`${l.id}: no placeholder`);
 for(const heading of ['Разобранный пример','Главное','Мини-словарь'])assert.ok(body.includes(`## ${heading}`),`${l.id}: ${heading}`);
 const bullets=(section:string)=>section.split('\n').filter(s=>s.startsWith('- ')).length;
 const takeaways=bullets(body.split('## Главное')[1]!.split('## Мини-словарь')[0]!);
 const glossary=bullets(body.split('## Мини-словарь')[1]!);
 assert.ok(takeaways>=3&&takeaways<=5,`${l.id}: takeaways`);assert.ok(glossary>=3&&glossary<=6,`${l.id}: glossary`);
 assert.ok(body.includes('|'),'labeled table');
 const urls=l.sources.map(s=>s.url);assert.ok(urls.includes(l.fact.sourceUrl),`${l.id}: fact source`);
 const quiz=quizzes.find(q=>q.topicId===l.id)!;
 assert.deepEqual(quiz.questions.map(q=>q.kind),['understanding','understanding','application','application','misconception']);
 assert.equal(new Set(quiz.questions.map(q=>q.id)).size,5);
 for(const [i,q] of quiz.questions.entries()){
  assert.equal(q.id,`${l.id}-Q${i+1}`);assert.equal(new Set(q.options.map(o=>o.id)).size,4);assert.equal(new Set(q.options.map(o=>o.text)).size,4);
  assert.equal(q.options.filter(o=>o.id===q.correctOptionId).length,1);assert.ok(q.lessonAnchor.length>2);assert.ok(urls.includes(q.sourceUrl),`${q.id}: source is in lesson`);
 }
 return {id:l.id,file,words,factWords,questions:5,grades:l.grades,sources:urls.length};
});
const report={checkedAt:new Date().toISOString(),biology:18,chemistry:18,lessons:lessons.length,quizzes:quizzes.length,questions:quizzes.reduce((n,q)=>n+q.questions.length,0),options:720,facts:36,details};
writeReport('content-validation',report);console.log('Content OK: 18 + 18 lessons, 36 quizzes, 180 questions, 720 options, 36 facts.');
