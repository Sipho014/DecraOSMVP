import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 14) || 14, 50);

  const shopRow = shop
    ? await prisma.shop.findUnique({ where: { shopDomain: shop } })
    : null;

  const rows = await prisma.briefing.findMany({
    where: shopRow?.id ? { shopId: shopRow.id } : undefined,
    orderBy: [{ date: 'desc' }],
    take: limit,
  });

  return NextResponse.json({
    shop: shop ?? null,
    items: rows.map((r) => ({
      id: r.id,
      date: r.date,
      generatedAt: r.generatedAt.toISOString(),
      briefing: r.payload,
    })),
  });
}
