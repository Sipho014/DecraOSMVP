import crypto from 'crypto';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { exchangeCodeForAccessToken, getShopCookieName, getStateCookieName } from '@/integrations/shopify/auth';

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function verifyHmac(params: URLSearchParams, secret: string) {
  const hmac = params.get('hmac');
  if (!hmac) return false;

  const sorted = [...params.entries()]
    .filter(([k]) => k !== 'hmac' && k !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const digest = crypto.createHmac('sha256', secret).update(sorted).digest('hex');
  return safeEqual(digest, hmac);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');
  const state = url.searchParams.get('state');

  const jar = await cookies();
  const expectedState = jar.get(getStateCookieName())?.value;
  const expectedShop = jar.get(getShopCookieName())?.value;

  if (!code || !shop || !state) {
    return NextResponse.json({ error: 'Missing code/shop/state' }, { status: 400 });
  }

  if (!expectedState || state !== expectedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  if (expectedShop && expectedShop !== shop) {
    return NextResponse.json({ error: 'Shop mismatch' }, { status: 400 });
  }

  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Missing SHOPIFY_API_SECRET' }, { status: 500 });
  }

  if (!verifyHmac(url.searchParams, secret)) {
    return NextResponse.json({ error: 'HMAC validation failed' }, { status: 400 });
  }

  const accessToken = await exchangeCodeForAccessToken({ shop, code });

  // MVP secure storage: cookie (httpOnly). Replace with DB (Prisma) ASAP.
  jar.set(`shopify_token_${shop}`, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.json({ ok: true, shop });
}
