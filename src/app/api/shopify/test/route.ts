import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { fetchBasicMetrics } from '@/integrations/shopify/shopify-client';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');
  if (!shop) {
    return NextResponse.json({ error: 'Missing ?shop=example.myshopify.com' }, { status: 400 });
  }

  const jar = await cookies();
  const token = jar.get(`shopify_token_${shop}`)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not connected. Run /api/shopify/connect?shop=...' }, { status: 401 });
  }

  const metrics = await fetchBasicMetrics({ shop, accessToken: token });
  return NextResponse.json({ ok: true, shop, metrics });
}
