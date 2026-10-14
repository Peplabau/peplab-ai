/**
 * peplab.ai sitemap — only the lock page and /landing.
 * Every other URL 301s to the same path on peplab.com.au, so it must not be listed here.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const URLS = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/landing', priority: '0.9', changefreq: 'weekly' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${URLS.map(
  ({ path, priority, changefreq }) => `  <url>
    <loc>https://peplab.ai${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`;

const outPath = join(root, 'public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(`Wrote ${URLS.length} URLs to public/sitemap.xml`);
