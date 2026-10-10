import { getCollection } from 'astro:content';
export const subjects = {
 biology: { title: 'Биология', caption: 'Наука о живом', description: 'От первой клетки до целой биосферы. Разберёмся, как устроена жизнь и что связывает нас с природой.', symbol: '✳' },
 chemistry: { title: 'Химия', caption: 'Наука о превращениях', description: 'От привычных веществ до молекул жизни. Узнаем, из чего состоит мир и почему он меняется.', symbol: '⌬' },
};
export type Subject = keyof typeof subjects;
export const allLessons = async () => (await getCollection('lessons')).sort((a,b) => a.data.id.localeCompare(b.data.id));
export const lessonUrl = (lesson: { subject: string; slug: string }) => `/${lesson.subject}/${lesson.slug}/`;
export const gradesLabel = (grades: number[]) => grades.join(', ') === '5, 6, 7, 10, 11' ? '5–7, 10–11 классы' : `${grades[0]}–${grades.at(-1)} классы`;
