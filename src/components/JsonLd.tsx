import { useEffect } from 'react';

type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
};

/** Injects page-specific JSON-LD; removed on unmount to avoid stale schema on SPA navigation. */
export function JsonLd({ data, id = 'peplab-jsonld' }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data, id]);

  return null;
}
