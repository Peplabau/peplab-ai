import { products, type Product } from '@/landing/products';

export function getStaticProducts(): Product[] {
  return products.filter((p) => !p.hidden);
}

export async function loadProductsFromSupabase(): Promise<Product[]> {
  return getStaticProducts();
}

export { normalizeImageUrl } from '@/landing/lib/site';
