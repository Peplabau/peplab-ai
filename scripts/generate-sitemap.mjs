/**
 * Regenerates public/sitemap.xml from static routes + live storefront slugs.
 * Run before production builds: npm run build (via prebuild).
 *
 * Uses scripts/storefront-product-slugs.mjs — NOT seed ids from src/products.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { STOREFRONT_PRODUCT_SLUGS } from './storefront-product-slugs.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

/** Read VITE_* from process.env or `.env` (prebuild runs before Vite loads env). */
function envVar(name, fallback) {
  if (process.env[name]) return process.env[name];
  try {
    const text = readFileSync(join(root, '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key !== name) continue;
      return trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    /* no .env */
  }
  return fallback;
}

// Always peplab.ai for this storefront repo.
const SITE_URL = 'https://peplab.ai';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.98', changefreq: 'weekly' },
  { path: '/coa', priority: '0.88', changefreq: 'weekly' },
  { path: '/calculator', priority: '0.78', changefreq: 'monthly' },
  { path: '/protocols', priority: '0.86', changefreq: 'monthly' },
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
  { path: '/research', priority: '0.85', changefreq: 'monthly' },
  { path: '/research/compounds', priority: '0.84', changefreq: 'weekly' },
];

/** Known published research compound slugs (seed defaults). Extended from Supabase when credentials exist. */
const DEFAULT_RESEARCH_SLUGS = [
  'retatrutide',
  'ghk-cu',
  'mots-c',
  'bpc-157-tb-500',
  'tirzepatide',
  'tesamorelin',
  'cjc-1295-no-dac-ipamorelin',
  'bpc-157',
  'glow',
  'hcg',
  'ipamorelin',
  'klow',
  'kpv',
  'melanotan-2',
  'nad-plus',
  'pt-141',
  'ss-31',
  'semax',
  '5-amino-1mq',
  'aod-9604',
  'thymosin-alpha-1',
  'epitalon',
  'ara-290',
  'cagrilintide',
  'cjc-1295-no-dac',
  'cjc-1295-dac',
  'slu-pp-332',
];

async function fetchPublishedResearchSlugs() {
  const url = envVar('VITE_SUPABASE_URL', '');
  const key = envVar('VITE_SUPABASE_ANON_KEY', '');
  if (!url || !key) return DEFAULT_RESEARCH_SLUGS;
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/research_articles?select=slug&status=eq.published`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) return DEFAULT_RESEARCH_SLUGS;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return DEFAULT_RESEARCH_SLUGS;
    const fromDb = rows.map((r) => String(r.slug || '').trim()).filter(Boolean);
    // Keep seed defaults even when the live table only has a subset published yet.
    return [...new Set([...DEFAULT_RESEARCH_SLUGS, ...fromDb])];
  } catch {
    return DEFAULT_RESEARCH_SLUGS;
  }
}

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

const researchSlugs = await fetchPublishedResearchSlugs();
const researchEntries = researchSlugs.map((slug) =>
  urlEntry(`/research/compounds/${slug}`, '0.82', 'monthly'),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...researchEntries, ...productEntries].join('\n')}
</urlset>
`;

const outPath = join(root, 'public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');
console.log(
  `Wrote ${staticEntries.length + researchEntries.length + productEntries.length} URLs to public/sitemap.xml (${researchEntries.length} research, ${productEntries.length} products)`,
);
