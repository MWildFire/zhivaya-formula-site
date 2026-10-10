import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { lessonSchema, quizSchema } from '../src/lib/schema';
export function readContent() {
 const lessons = ['biology','chemistry'].flatMap(subject => fs.readdirSync(`src/content/lessons/${subject}`).filter(f=>f.endsWith('.md')).map(f=>{
  const file=path.join('src/content/lessons',subject,f);const parsed=matter(fs.readFileSync(file,'utf8'));
  return {file,data:lessonSchema.parse(parsed.data),body:parsed.content};
 })).sort((a,b)=>a.data.id.localeCompare(b.data.id));
 const quizzes=fs.readdirSync('src/content/quizzes').filter(f=>f.endsWith('.json')).map(f=>quizSchema.parse(JSON.parse(fs.readFileSync(`src/content/quizzes/${f}`,'utf8')))).sort((a,b)=>a.topicId.localeCompare(b.topicId));
 return {lessons,quizzes};
}
export function writeReport(name:string, data:unknown) {fs.mkdirSync('artifacts/qa',{recursive:true});fs.writeFileSync(`artifacts/qa/${name}.json`,JSON.stringify(data,null,2)+'\n');}
