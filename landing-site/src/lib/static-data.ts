import { products, type Product } from '@/products';

export function getStaticProducts(): Product[] {
  return products.filter((p) => !p.hidden);
}

export async function loadProductsFromSupabase(): Promise<Product[]> {
  return getStaticProducts();
}

export { normalizeImageUrl } from '@/lib/site';
