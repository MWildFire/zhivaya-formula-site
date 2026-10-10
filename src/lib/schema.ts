import { z } from 'zod';
export const sourceSchema = z.object({ title: z.string().min(5), url: z.url().startsWith('https://'), checked: z.literal('2026-09-23') });
export const lessonSchema = z.object({
 id: z.string().regex(/^[BC]\d{2}$/), subject: z.enum(['biology', 'chemistry']), slug: z.string().regex(/^[a-z0-9-]+$/), order: z.number().int().min(1).max(18), title: z.string().min(5), description: z.string().min(30), grades: z.array(z.number().int().min(5).max(11)).min(1), readingMinutes: z.number().int().min(3), introductory: z.boolean().default(false), learningObjectives: z.array(z.string().min(10)).min(1), fact: z.object({ title: z.string().min(5), text: z.string().min(150), sourceUrl: z.url() }), sources: z.array(sourceSchema).min(1).max(3),
});
export const quizSchema = z.object({ id: z.string(), topicId: z.string().regex(/^[BC]\d{2}$/), questions: z.array(z.object({ id: z.string(), prompt: z.string().min(10), kind: z.enum(['understanding', 'application', 'misconception']), options: z.array(z.object({ id: z.string(), text: z.string().min(1) })).length(4), correctOptionId: z.string(), explanation: z.string().min(30), lessonAnchor: z.string(), sourceUrl: z.url() })).length(5) });
export type Lesson = z.infer<typeof lessonSchema>;
export type Quiz = z.infer<typeof quizSchema>;
