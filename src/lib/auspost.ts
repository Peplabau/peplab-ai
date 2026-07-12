// Australia Post API Integration
// API Key: e9d46a02-4dd2-49fb-9f8a-67bed3491f41

// const AUSPOST_API_KEY = 'e9d46a02-4dd2-49fb-9f8a-67bed3491f41';
// const AUSPOST_BASE_URL = 'https://digitalapi.auspost.com.au/postage';

// Shipping rates configuration
export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

// Default shipping rates (fallback if API fails)
export const DEFAULT_SHIPPING_RATES: ShippingRate[] = [
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-4 business days',
    price: 15.00,
    estimatedDays: '2-4 days',
  },
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-8 business days',
    price: 10.00,
    estimatedDays: '5-8 days',
  },
];

// Calculate shipping cost based on weight and postcode
export const calculateShipping = async (
  _toPostcode: string,
  _weightInGrams: number = 500
): Promise<ShippingRate[]> => {
  try {
    // For now, return default rates
    // In production, you would call the Australia Post API:
    // const response = await fetch(
    //   `${AUSPOST_BASE_URL}/parcel/domestic/calculate.json?` +
    //   `from_postcode=2000&to_postcode=${toPostcode}&length=10&width=10&height=5&weight=${weightInGrams}`,
    //   {
    //     headers: {
    //       'AUTH-KEY': AUSPOST_API_KEY,
    //     },
    //   }
    // );
    // const data = await response.json();
    // return parseShippingRates(data);
    
    return DEFAULT_SHIPPING_RATES;
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return DEFAULT_SHIPPING_RATES;
  }
};

// Validate Australian postcode
export const validatePostcode = async (postcode: string): Promise<boolean> => {
  try {
    // Australian postcodes are 4 digits
    const postcodeRegex = /^\d{4}$/;
    if (!postcodeRegex.test(postcode)) {
      return false;
    }
    
    // In production, you could validate against Australia Post API:
    // const response = await fetch(
    //   `${AUSPOST_BASE_URL}/postcode/search.json?q=${postcode}`,
    //   {
    //     headers: {
    //       'AUTH-KEY': AUSPOST_API_KEY,
    //     },
    //   }
    // );
    // const data = await response.json();
    // return data.localities && data.localities.locality !== undefined;
    
    return true;
  } catch (error) {
    console.error('Error validating postcode:', error);
    return false;
  }
};

// Get suburb suggestions for autocomplete
export const searchSuburbs = async (query: string): Promise<string[]> => {
  try {
    if (query.length < 3) return [];
    
    // In production, call Australia Post API:
    // const response = await fetch(
    //   `${AUSPOST_BASE_URL}/postcode/search.json?q=${encodeURIComponent(query)}`,
    //   {
    //     headers: {
    //       'AUTH-KEY': AUSPOST_API_KEY,
    //     },
    //   }
    // );
    // const data = await response.json();
    // return parseSuburbs(data);
    
    return [];
  } catch (error) {
    console.error('Error searching suburbs:', error);
    return [];
  }
};

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = 250;

// Check if order qualifies for free shipping
export const qualifiesForFreeShipping = (subtotal: number): boolean => {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
};

// Get shipping cost with free shipping check
export const getShippingCost = (
  subtotal: number,
  selectedRate: ShippingRate
): number => {
  if (qualifiesForFreeShipping(subtotal)) {
    return 0;
  }
  return selectedRate.price;
};
