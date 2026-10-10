export const normalize = (value: string) => value.toLocaleLowerCase('ru-RU').replaceAll('ё','е').trim();
export function matches(item: { search: string; subject: string; grades: number[] }, query: string, subject: string, grade: string) {
 return normalize(query).split(/\s+/).every(word => normalize(item.search).includes(word)) && (!subject || item.subject === subject) && (!grade || item.grades.includes(Number(grade)));
}
