import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

export function getShopifyApp() {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecretKey = process.env.SHOPIFY_API_SECRET;
  const scopes = (process.env.SHOPIFY_SCOPES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const appUrl = process.env.SHOPIFY_APP_URL;

  if (!apiKey || !apiSecretKey || !appUrl) {
    throw new Error(
      'Missing Shopify env vars. Required: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL',
    );
  }

  return shopifyApi({
    apiKey,
    apiSecretKey,
    scopes,
    hostName: new URL(appUrl).host,
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: false,
  });
}

export async function fetchBasicMetrics(opts: { shop: string; accessToken: string }) {
  const shopify = getShopifyApp();
  const client = new shopify.clients.Rest({
    session: {
      id: `offline_${opts.shop}`,
      shop: opts.shop,
      isOnline: false,
      state: '',
      accessToken: opts.accessToken,
    },
  });

  // Minimal: last 30 days orders + gross sales (very rough).
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const ordersResp = await client.get({
    path: 'orders',
    query: {
      status: 'any',
      created_at_min: since,
      limit: 50,
      fields: 'id,total_price,created_at,currency',
    },
  });

  type ShopifyOrder = {
    id: number;
    total_price: string;
    created_at: string;
    currency: string;
  };

  const body = ordersResp.body as { orders?: ShopifyOrder[] };
  const orders = body.orders ?? [];
  const revenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  return {
    ordersCount: orders.length,
    revenue,
    currency: orders[0]?.currency ?? null,
    since,
  };
}
