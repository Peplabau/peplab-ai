/**
 * Supabase Storage image URLs — full-resolution originals for product display;
 * optional transforms for small thumbnails (cart, search).
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const SUPABASE_OBJECT_RE =
  /^(https?:\/\/[^/]+)\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/i;

const SUPABASE_RENDER_RE =
  /^(https?:\/\/[^/]+)\/storage\/v1\/render\/image\/public\/([^/]+)\/(.+?)(?:\?.*)?$/i;

export type ProductImageVariant = 'card' | 'thumb' | 'detail';

const VARIANT_WIDTH: Record<ProductImageVariant, number> = {
  card: 640,
  thumb: 96,
  detail: 1200,
};

export type OptimizeImageOptions = {
  width?: number;
  quality?: number;
  format?: 'webp' | 'origin';
};

/** Untransformed Supabase object URL — the file as uploaded. */
export function getOriginalProductImageUrl(raw: string | null | undefined): string {
  const url = (raw ?? '').trim();
  if (!url) return '';

  const renderMatch = url.match(SUPABASE_RENDER_RE);
  if (renderMatch) {
    const [, origin, bucket, objectPath] = renderMatch;
    return `${origin}/storage/v1/object/public/${bucket}/${objectPath}`;
  }

  if (SUPABASE_OBJECT_RE.test(url)) return url;
  return url;
}

/** Build a resized Supabase render URL; local/static paths pass through unchanged. */
export function getOptimizedProductImageUrl(
  raw: string | null | undefined,
  opts: OptimizeImageOptions = {},
): string {
  const url = getOriginalProductImageUrl(raw);
  if (!url) return '';

  const match = url.match(SUPABASE_OBJECT_RE);
  if (!match) return url;

  const [, origin, bucket, objectPath] = match;
  const width = opts.width ?? 640;
  const quality = opts.quality ?? 92;
  const params = new URLSearchParams({
    width: String(width),
    quality: String(quality),
    resize: 'contain',
  });
  if (opts.format !== 'origin') params.set('format', 'webp');

  return `${origin}/storage/v1/render/image/public/${bucket}/${objectPath}?${params}`;
}

export function getProductImageSources(
  raw: string | null | undefined,
  variant: ProductImageVariant = 'card',
) {
  const base = (raw ?? '').trim();
  if (!base) return { src: '', srcSet: undefined as string | undefined };

  if (variant === 'thumb') {
    const src = getOptimizedProductImageUrl(base, { width: THUMB_WIDTH });
    const srcSet = [
      `${getOptimizedProductImageUrl(base, { width: THUMB_WIDTH })} ${THUMB_WIDTH}w`,
      `${getOptimizedProductImageUrl(base, { width: THUMB_WIDTH * 2 })} ${THUMB_WIDTH * 2}w`,
    ].join(', ');
    return { src, srcSet };
  }

  return { src: getOriginalProductImageUrl(base), srcSet: undefined };
}

/** Responsive `sizes` for catalog product cards (2-col mobile → 4-col desktop). */
export const PRODUCT_CARD_IMAGE_SIZES =
  '(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 220px';

export const PRODUCT_THUMB_IMAGE_SIZES = '96px';

export const PRODUCT_DETAIL_IMAGE_SIZES =
  '(max-width: 768px) 88vw, 480px';

/** Warm the browser cache for the first visible row on the homepage. */
export function preloadProductImages(
  urls: Array<string | null | undefined>,
  max = 6,
  variant: ProductImageVariant = 'card',
): void {
  urls.slice(0, max).forEach((raw) => {
    const href =
      variant === 'thumb'
        ? getOptimizedProductImageUrl(raw, { width: THUMB_WIDTH })
        : getOriginalProductImageUrl(raw);
    if (!href) return;
    if (document.querySelector(`link[rel="preload"][as="image"][href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = href;
    document.head.appendChild(link);
  });
}
