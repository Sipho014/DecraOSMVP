import { NextResponse } from 'next/server';

import { fetchBasicMetrics } from '@/integrations/shopify/shopify-client';
import { getShopifyAccessToken } from '@/lib/integrations';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');
  if (!shop) {
    return NextResponse.json({ error: 'Missing ?shop=example.myshopify.com' }, { status: 400 });
  }

  const conn = await getShopifyAccessToken(shop);
  if (!conn) {
    return NextResponse.json({ error: 'Not connected. Run /api/shopify/connect?shop=...' }, { status: 401 });
  }

  const metrics = await fetchBasicMetrics({ shop, accessToken: conn.accessToken });
  return NextResponse.json({ ok: true, shop, metrics });
}
