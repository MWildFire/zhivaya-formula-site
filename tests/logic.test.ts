import test from 'node:test';
import assert from 'node:assert/strict';
import { gradeQuiz } from '../src/lib/quiz';
import { matches } from '../src/lib/filters';
import { readContent } from '../scripts/content';
const {lessons,quizzes}=readContent();
test('All 36 quizzes: all 32 correct/incorrect answer patterns score correctly',()=>{
 for(const q of quizzes)for(let bits=0;bits<32;bits++){
  let count=0;const answers=Object.fromEntries(q.questions.map((question,i)=>{const right=Boolean(bits&(1<<i));if(right)count++;return [question.id,right?question.correctOptionId:question.options.find(o=>o.id!==question.correctOptionId)!.id];}));
  assert.deepEqual(gradeQuiz(q,answers),{correct:count,total:5,percent:count*20},`${q.topicId}: ${bits}`);
 }
});
test('Missing and unknown answers cannot produce a result',()=>{
 const q=quizzes[0]!;assert.throws(()=>gradeQuiz(q,{}));
 const valid=Object.fromEntries(q.questions.map(q=>[q.id,q.correctOptionId]));delete valid[q.questions[4]!.id];assert.throws(()=>gradeQuiz(q,valid));
 valid[q.questions[4]!.id]='unrecognized';assert.throws(()=>gradeQuiz(q,valid));
});
test('Every class and subject uses exact membership, including B17 grade gap',()=>{
 const b17=lessons.find(l=>l.data.id==='B17')!.data;
 assert.deepEqual([5,6,7,8,9,10,11].filter(g=>matches({search:b17.title,...b17},'','',String(g))),[5,6,7,10,11]);
 for(const subject of ['biology','chemistry'])for(const grade of [5,6,7,8,9,10,11]){
  const actual=lessons.filter(({data:l})=>matches({search:l.title,...l},'',subject,String(grade))).map(l=>l.data.id);
  assert.deepEqual(actual,lessons.filter(l=>l.data.subject===subject&&l.data.grades.includes(grade)).map(l=>l.data.id));
 }
});
test('Search supports Russian case, ё/е, multiple words, reset and empty result',()=>{
 const item={search:'Твёрдое, жидкое и газообразное состояния',subject:'chemistry',grades:[5,6,7]};
 assert.equal(matches(item,'  ТВЕРДОЕ   состояния ','chemistry','6'),true);assert.equal(matches(item,'несуществующее','',''),false);
 assert.equal(matches(item,'','',''),true);assert.equal(matches(item,'','biology',''),false);
});
