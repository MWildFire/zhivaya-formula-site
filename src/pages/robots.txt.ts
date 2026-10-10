import { absoluteUrl } from '../lib/paths';
export function GET(){return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`,{headers:{'Content-Type':'text/plain'}});}
