import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { buildAuthUrl, getShopCookieName, getStateCookieName, makeState } from '@/integrations/shopify/auth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing ?shop=example.myshopify.com' }, { status: 400 });
  }

  const state = makeState();
  const redirectUri = `${url.origin}/api/shopify/callback`;
  const authUrl = buildAuthUrl({ shop, state, redirectUri });

  const jar = await cookies();
  jar.set(getStateCookieName(), state, { httpOnly: true, sameSite: 'lax', path: '/' });
  jar.set(getShopCookieName(), shop, { httpOnly: true, sameSite: 'lax', path: '/' });

  return NextResponse.redirect(authUrl);
}
