import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { lessonSchema, quizSchema } from './lib/schema';
const lessons = defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/lessons' }), schema: lessonSchema });
const quizzes = defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/quizzes' }), schema: quizSchema });
export const collections = { lessons, quizzes };
