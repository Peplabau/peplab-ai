import { CONFIG } from '@/lib/config';
import { mergeSeoKeywords } from '@/lib/seo-keywords';
import { getDefaultStorefrontDosage, type Product } from '@/products';

const SITE_ORIGIN = CONFIG.SITE_URL.replace(/\/$/, '');

function truncate(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function stripMarkup(text: string): string {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildProductSeo(product: Product, slug: string) {
  const peptidex = product.longDescription?.trim();
  const fallback = product.description?.trim() || product.moreInfo?.trim();
  const rawDescription =
    peptidex ||
    fallback ||
    `${product.name} for in-vitro laboratory research. HPLC-verified batches, published COAs, Australia-wide dispatch from PEPLAB. Research use only.`;

  const title = `${product.name} Australia | PEPLAB — Research Peptides`;
  const description = truncate(stripMarkup(rawDescription));
  const keywords = mergeSeoKeywords(
    [product.name, `${product.name} Australia`, slug.replace(/-/g, ' '), 'research peptides Australia', 'buy peptides Australia', 'HPLC verified peptides'],
  );

  return { title, description, keywords };
}

export function buildProductJsonLd(product: Product, slug: string) {
  const productUrl = `${SITE_ORIGIN}/product/${slug}`;
  const defaultDosage = getDefaultStorefrontDosage(product);
  const imagePath = product.image?.startsWith('http')
    ? product.image
    : `${SITE_ORIGIN}${product.image?.startsWith('/') ? product.image : `/${product.image || 'favicon.png'}`}`;
  const inStock = (product.dosages ?? []).some((d) => d.inStock);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: truncate(stripMarkup(product.description || product.moreInfo || product.name), 500),
    image: imagePath,
    sku: slug,
    brand: {
      '@type': 'Brand',
      name: 'PEPLAB',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'AUD',
      price: defaultDosage?.originalPrice ?? 0,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'PEPLAB',
      },
    },
  };
}
