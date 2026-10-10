import type { Quiz } from './schema';
export function gradeQuiz(quiz: Quiz, answers: Record<string,string>) {
 if(!quiz.questions.every(q=>q.options.some(o=>o.id===answers[q.id]))) throw new Error('Ответь на все вопросы');
 const correct=quiz.questions.filter(q=>answers[q.id]===q.correctOptionId).length;
 return {correct,total:quiz.questions.length,percent:Math.round(correct/quiz.questions.length*100)};
}
