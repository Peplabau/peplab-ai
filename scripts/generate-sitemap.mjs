/**
 * Regenerates public/sitemap.xml from static routes + live storefront slugs.
 * Run before production builds: npm run build (via prebuild).
 *
 * Uses scripts/storefront-product-slugs.mjs — NOT seed ids from src/products.ts.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { STOREFRONT_PRODUCT_SLUGS } from './storefront-product-slugs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://peplab.com.au').replace(/\/$/, '');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.98', changefreq: 'weekly' },
  { path: '/landing', priority: '0.95', changefreq: 'weekly' },
  { path: '/coa', priority: '0.88', changefreq: 'weekly' },
  { path: '/calculator', priority: '0.78', changefreq: 'monthly' },
  { path: '/leaderboard', priority: '0.72', changefreq: 'weekly' },
  { path: '/standards', priority: '0.75', changefreq: 'monthly' },
  { path: '/contact-info', priority: '0.75', changefreq: 'monthly' },
  { path: '/contact', priority: '0.65', changefreq: 'monthly' },
  { path: '/faq', priority: '0.72', changefreq: 'monthly' },
  { path: '/shipping', priority: '0.62', changefreq: 'monthly' },
  { path: '/track-order', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', priority: '0.4', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.38', changefreq: 'yearly' },
  { path: '/refund', priority: '0.38', changefreq: 'yearly' },
  { path: '/legal', priority: '0.38', changefreq: 'yearly' },
  { path: '/rewards-terms', priority: '0.35', changefreq: 'yearly' },
];

function urlEntry(path, priority, changefreq) {
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const productEntries = STOREFRONT_PRODUCT_SLUGS.map(({ slug, priority }) =>
  urlEntry(`/product/${slug}`, priority || '0.82', 'weekly'),
);

const staticEntries = STATIC_ROUTES.map((route) =>
  urlEntry(route.path, route.priority, route.changefreq),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...productEntries].join('\n')}
</urlset>
`;

const outPath = join(root, 'public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(
  `Wrote ${staticEntries.length + productEntries.length} URLs to public/sitemap.xml (${productEntries.length} products)`,
);
