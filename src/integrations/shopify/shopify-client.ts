import { ApiVersion, Session, shopifyApi } from '@shopify/shopify-api';

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
    apiVersion: ApiVersion.January26,
    isEmbeddedApp: false,
  });
}

export type ShopifyOrdersSummary = {
  since: string;
  ordersCount: number;
  revenue: number;
  aov: number;
  currency: string | null;
};

export async function fetchOrdersSummary(opts: { shop: string; accessToken: string }): Promise<ShopifyOrdersSummary> {
  const shopify = getShopifyApp();
  const session = new Session({
    id: `offline_${opts.shop}`,
    shop: opts.shop,
    state: '',
    isOnline: false,
  });
  session.accessToken = opts.accessToken;

  const client = new shopify.clients.Rest({ session });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  type ShopifyOrder = {
    id: number;
    total_price: string;
    created_at: string;
    currency: string;
  };

  // Note: Shopify REST is paginated; MVP uses first 250 orders.
  const ordersResp = await client.get({
    path: 'orders',
    query: {
      status: 'any',
      created_at_min: since,
      limit: 250,
      fields: 'id,total_price,created_at,currency',
    },
  });

  const body = ordersResp.body as { orders?: ShopifyOrder[] };
  const orders = body.orders ?? [];
  const revenue = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
  const ordersCount = orders.length;
  const aov = ordersCount > 0 ? revenue / ordersCount : 0;

  return {
    since,
    ordersCount,
    revenue: Number(revenue.toFixed(2)),
    aov: Number(aov.toFixed(2)),
    currency: orders[0]?.currency ?? null,
  };
}
