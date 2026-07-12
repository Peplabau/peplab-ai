import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CONFIG } from '@/lib/config';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function SEO({
  title = SITE_SEO_TITLE,
  description = SITE_SEO_DESCRIPTION,
  keywords = SITE_SEO_KEYWORDS,
  ogImage = `${CONFIG.SITE_URL.replace(/\/$/, '')}${CONFIG.SHARE_PREVIEW_IMAGE_PATH}`,
  noIndex = false,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title;

    const faviconHref = `${CONFIG.SITE_URL.replace(/\/$/, '')}${CONFIG.FAVICON_PATH}`;
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

    // Update meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'PEPLAB — Peptides Australia' },
      { property: 'og:site_name', content: SITE_SEO_TITLE },
      { property: 'og:url', content: `${CONFIG.SITE_URL.replace(/\/$/, '')}${location.pathname}${location.search}` },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
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
      if (tag) {
        tag.setAttribute('content', content);
      }
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      'href',
      `${CONFIG.SITE_URL.replace(/\/$/, '')}${location.pathname}${location.search}`,
    );
  }, [title, description, keywords, ogImage, noIndex, location.pathname, location.search]);

  return null;
}

// Google Analytics — disabled pending new GTM/GMC setup
export function GoogleAnalytics() {
  /*
  useEffect(() => {
    if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', CONFIG.GA_MEASUREMENT_ID);
  }, []);
  */

  return null;
}

/** Fires GA page_view on client-side route changes (BrowserRouter). Disabled pending new GTM/GMC setup. */
export function RouteChangeTracker() {
  /*
  const location = useLocation();

  useEffect(() => {
    if (!CONFIG.GA_MEASUREMENT_ID || CONFIG.GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
      return;
    }
    if (typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
  */

  return null;
}

// Add gtag to window — disabled pending new GTM/GMC setup
/*
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
*/
export default SEO;