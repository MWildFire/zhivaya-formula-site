import { site } from '../config/site';

// GitHub Pages отдаёт сайт из подпути site.base: все внутренние адреса собираются здесь.
export const withBase = (path: string) => `${site.base}${path}`;
// Абсолютный адрес для canonical, sitemap и robots.
export const absoluteUrl = (path: string) => new URL(withBase(path), site.origin).href;
