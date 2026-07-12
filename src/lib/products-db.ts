import { supabase } from './supabase';
import type { Product } from '@/products';

// Default products data (fallback if Supabase fails)
export const defaultProducts: Product[] = [];

// Load products from Supabase (legacy helper — prefer supabase-db.ts loadProductsFromSupabase)
export const loadProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: false });

    if (error) {
      console.error('Error loading products from Supabase:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map(transformProductFromDB);
    }

    return [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

// Save product to Supabase (admin only)
export const saveProductToSupabase = async (product: Product): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .upsert(transformProductToDB(product));

    if (error) {
      console.error('Error saving product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving product:', error);
    return false;
  }
};

// Update stock status for a dosage
export const updateStockStatus = async (
  productId: string,
  dosageIndex: number,
  inStock: boolean
): Promise<boolean> => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('dosages')
      .eq('id', productId)
      .single();

    if (!product) return false;

    const updatedDosages = [...product.dosages];
    updatedDosages[dosageIndex] = { ...updatedDosages[dosageIndex], inStock };

    const { error } = await supabase
      .from('products')
      .update({ dosages: updatedDosages })
      .eq('id', productId);

    if (error) {
      console.error('Error updating stock:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
};

// Update dosage original price
export const updateDosagePricing = async (
  productId: string,
  dosageIndex: number,
  originalPrice: number
): Promise<boolean> => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('dosages')
      .eq('id', productId)
      .single();

    if (!product) return false;

    const updatedDosages = [...product.dosages];
    updatedDosages[dosageIndex] = {
      ...updatedDosages[dosageIndex],
      originalPrice,
    };

    const { error } = await supabase
      .from('products')
      .update({ dosages: updatedDosages })
      .eq('id', productId);

    if (error) {
      console.error('Error updating pricing:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating pricing:', error);
    return false;
  }
};

// Transform product from DB format to app format
const transformProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    moreInfo: dbProduct.more_info ?? null,
    coaUrl: dbProduct.coa_url ?? null,
    category: dbProduct.category,
    type: dbProduct.type,
    dosages: dbProduct.dosages,
    image: dbProduct.image,
    badge: dbProduct.badge,
    vialType: dbProduct.vial_type,
    bundlePricing: dbProduct.bundle_pricing,
    reviewCount: dbProduct.review_count,
    technicalSpecs: dbProduct.technical_specs,
  };
};

// Transform product to DB format
const transformProductToDB = (product: Product) => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    more_info: product.moreInfo ?? null,
    coa_url: product.coaUrl ?? null,
    category: product.category,
    type: product.type,
    dosages: product.dosages,
    image: product.image,
    badge: product.badge,
    vial_type: product.vialType,
    bundle_pricing: product.bundlePricing,
    review_count: product.reviewCount,
    technical_specs: product.technicalSpecs,
  };
};

// Sync local products to Supabase (run once to populate)
export const syncProductsToSupabase = async (products: Product[]): Promise<boolean> => {
  try {
    const dbProducts = products.map(transformProductToDB);

    const { error } = await supabase
      .from('products')
      .upsert(dbProducts, { onConflict: 'id' });

    if (error) {
      console.error('Error syncing products:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing products:', error);
    return false;
  }
};
