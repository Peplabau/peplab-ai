import { useMemo, useState } from 'react';
import {
  getOriginalProductImageUrl,
  getProductImageSources,
  PRODUCT_CARD_IMAGE_SIZES,
  PRODUCT_DETAIL_IMAGE_SIZES,
  type ProductImageVariant,
} from '@/lib/product-image';

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Above-fold cards: eager load + high fetch priority */
  priority?: boolean;
  variant?: ProductImageVariant;
  sizes?: string;
  onLoad?: () => void;
};

export default function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  variant = 'card',
  sizes,
  onLoad,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [useOriginal, setUseOriginal] = useState(false);

  const sources = useMemo(
    () => getProductImageSources(src, variant),
    [src, variant],
  );

  const fallbackWidth = variant === 'detail' ? 1200 : 640;
  const responsiveSizes = sizes ?? (variant === 'detail' ? PRODUCT_DETAIL_IMAGE_SIZES : PRODUCT_CARD_IMAGE_SIZES);
  const displaySrc = useOriginal
    ? src
    : sources.src || getOptimizedProductImageUrl(src, { width: fallbackWidth });

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!useOriginal && src) setUseOriginal(true);
  };

  if (!src) return null;

  return (
    <span className="relative flex h-full w-full items-center justify-center">
      {!loaded && (
        <span
          className="pointer-events-none absolute inset-[10%] rounded-xl bg-[rgba(244,246,250,0.06)] animate-pulse"
          aria-hidden
        />
      )}
      <img
        src={displaySrc}
        srcSet={useOriginal ? undefined : sources.srcSet}
        sizes={useOriginal ? undefined : responsiveSizes}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
      />
    </span>
  );
}
