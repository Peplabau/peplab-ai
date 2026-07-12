import { useEffect } from 'react';
import { CONFIG } from '@/landing/lib/config';
import { SITE_SEO_KEYWORDS } from '@/landing/lib/seo-keywords';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function SEO({
  title = "Australia's independent research peptide supplier. Every batch HPLC tested with published COAs. Express same-day dispatch Mon–Fri. Research use only.",
  description = "Australia's independent research peptide supplier. Every batch HPLC tested with published COAs. Express same-day dispatch Mon–Fri. Research use only.",
  keywords = SITE_SEO_KEYWORDS,
  ogImage = `${CONFIG.SITE_URL}${CONFIG.SHARE_PREVIEW_IMAGE_PATH}`,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    document.title = title;

    const faviconHref = `${CONFIG.SITE_URL}${CONFIG.FAVICON_PATH}`;
    const ensureLink = (rel: string, attrs: Record<string, string>) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.href = faviconHref;
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };
    ensureLink('icon', { type: 'image/png', sizes: 'any' });
    ensureLink('apple-touch-icon', {});

    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'geo.region', content: 'AU-NSW' },
      { name: 'geo.placename', content: 'Sydney, New South Wales, Australia' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:url', content: CONFIG.SITE_URL },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'PEPLAB' },
      { property: 'og:locale', content: 'en_AU' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'PEPLAB — Peptides Australia' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@peplab_au' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ];

    if (noIndex) {
      metaTags.push({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      metaTags.push({ name: 'robots', content: 'index, follow' });
    }

    metaTags.forEach(({ name, property, content }) => {
      let tag: HTMLMetaElement | null = null;
      if (property) {
        tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('property', property);
          document.head.appendChild(tag);
        }
      } else if (name) {
        tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
      }
      tag?.setAttribute('content', content);
    });

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', CONFIG.SITE_URL);
  }, [title, description, keywords, ogImage, noIndex]);

  return null;
}

export default SEO;
