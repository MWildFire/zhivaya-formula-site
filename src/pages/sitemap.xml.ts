import { allLessons, lessonUrl } from '../lib/catalog';
import { absoluteUrl } from '../lib/paths';
export async function GET(){const lessons=await allLessons();const paths=['/','/biology/','/chemistry/','/tests/','/facts/',...lessons.map(l=>lessonUrl(l.data)),...lessons.map(l=>`/tests/${l.data.id}/`)];return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path=>`<url><loc>${absoluteUrl(path)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});}
