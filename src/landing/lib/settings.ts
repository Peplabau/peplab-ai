export type DiscountSettings = {
  discount_enabled?: boolean;
  discount_percentage?: number;
  buy2_percentage?: number;
  buy3_percentage?: number;
};

export const DEFAULT_DISCOUNT_SETTINGS: DiscountSettings = {
  discount_enabled: true,
  discount_percentage: 20,
  buy2_percentage: 5,
  buy3_percentage: 10,
};

export const DEFAULT_SUPPORT_LINKS = {
  telegram_link: 'https://t.me/peplabau',
  whatsapp_link: '',
};
