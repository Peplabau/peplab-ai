/**
 * peplab.ai is not submitted to Google. The sitemap stays empty so Search
 * Console has no URLs to index. Pages also send noindex.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
`;

const outPath = join(root, 'public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log('Wrote an empty sitemap to public/sitemap.xml');
