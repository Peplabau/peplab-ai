import { siteOrigin } from '@/lib/domain';

export type BreadcrumbItem = {
  name: string;
  path: string;
};

/** Build BreadcrumbList JSON-LD for inner pages. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const origin = siteOrigin();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
