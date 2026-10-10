import { defineConfig } from 'astro/config';
import { site } from './src/config/site';
export default defineConfig({ site: site.origin, base: site.base, output: 'static', trailingSlash: 'always', vite: { build: { assetsInlineLimit: 0 } }, build: { format: 'directory', inlineStylesheets: 'never' } });
