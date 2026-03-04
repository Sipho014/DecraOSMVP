export type ShopifyShop = {
  id: string;
  domain: string;
};

export type ShopifyConnection = {
  shop: string; // e.g. "example.myshopify.com"
  accessToken: string;
  installedAt: string; // ISO
};
