import { gradeQuiz } from '../lib/quiz';
import type { Quiz } from '../lib/schema';
const form=document.querySelector<HTMLFormElement>('#quiz');
if(form){
 const quiz=JSON.parse(form.dataset.quiz!) as Quiz;
 const submit=form.querySelector<HTMLButtonElement>('button[type=submit]')!;
 const counter=document.querySelector<HTMLElement>('#answered')!;
 const result=document.querySelector<HTMLElement>('#result')!;
 let submitted=false;
 const read=()=>Object.fromEntries(new FormData(form)) as Record<string,string>;
 const update=()=>{const answers=read();const n=quiz.questions.filter(q=>answers[q.id]).length;counter.textContent=`Отвечено ${n} из ${quiz.questions.length}`;submit.disabled=submitted || n!==quiz.questions.length;};
 form.reset();form.querySelectorAll<HTMLInputElement>('input').forEach(input=>input.disabled=false);update();
 form.hidden=false;form.addEventListener('change',update);
 form.addEventListener('submit',event=>{event.preventDefault();if(submitted)return;const answers=read();if(!quiz.questions.every(q=>answers[q.id]))return;const score=gradeQuiz(quiz,answers);submitted=true;
 quiz.questions.forEach(q=>{const field=form.querySelector<HTMLFieldSetElement>(`[data-question="${q.id}"]`)!;const feedback=field.querySelector<HTMLElement>('[data-feedback]')!;const correct=q.options.find(o=>o.id===q.correctOptionId)!;const chosen=q.options.find(o=>o.id===answers[q.id])!;const ok=chosen.id===correct.id;field.dataset.result=ok?'correct':'incorrect';feedback.replaceChildren();for(const [tag,text] of [['strong',ok?'Верно':'Пока не совсем'],['p',`Твой ответ: ${chosen.text}`],['p',`Правильный ответ: ${correct.text}`],['p',q.explanation]]){const element=document.createElement(tag);element.textContent=text;feedback.append(element);}feedback.hidden=false;field.querySelectorAll<HTMLInputElement>('input').forEach(input=>input.disabled=true);});
 result.querySelector('[data-score]')!.textContent=`${score.correct} из ${score.total} · ${score.percent}%`;
 result.querySelector('[data-result-message]')!.textContent=score.correct===5?'Всё верно! Можно переходить к новой теме.':score.correct===0?'Начало положено. Разбор ответов поможет увидеть, что стоит повторить.':'Есть, на что опереться. Загляни в разбор и попробуй ещё раз.';
 submit.disabled=true;result.hidden=false;result.focus();result.scrollIntoView({block:'center',behavior:'instant'});
 });
 document.querySelector('#retry')?.addEventListener('click',()=>{submitted=false;form.reset();form.querySelectorAll<HTMLInputElement>('input').forEach(input=>input.disabled=false);form.querySelectorAll<HTMLElement>('[data-feedback]').forEach(f=>{f.hidden=true;f.replaceChildren();});form.querySelectorAll<HTMLElement>('[data-question]').forEach(f=>delete f.dataset.result);result.hidden=true;update();form.querySelector<HTMLInputElement>('input')?.focus();});
}
