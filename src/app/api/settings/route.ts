import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { parseShopSettings } from '@/lib/settings';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json(
      { error: 'Missing ?shop=example.myshopify.com' },
      { status: 400 },
    );
  }

  const row = await prisma.shop.findUnique({ where: { shopDomain: shop } });
  if (!row) {
    return NextResponse.json({ error: 'Unknown shop' }, { status: 404 });
  }

  return NextResponse.json({
    shop,
    settings: parseShopSettings(row.settings),
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json(
      { error: 'Missing ?shop=example.myshopify.com' },
      { status: 400 },
    );
  }

  const row = await prisma.shop.findUnique({ where: { shopDomain: shop } });
  if (!row) {
    return NextResponse.json({ error: 'Unknown shop' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as unknown;
  const settings = parseShopSettings(body);

  await prisma.shop.update({
    where: { id: row.id },
    data: { settings },
  });

  return NextResponse.json({ ok: true, shop, settings });
}
