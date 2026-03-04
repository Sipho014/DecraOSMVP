import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: 'Missing ADMIN_PASSWORD' }, { status: 500 });
  }

  const url = new URL(req.url);
  const provided = url.searchParams.get('password');
  if (!provided || provided !== password) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shops = await prisma.shop.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      tokens: {
        select: { provider: true, scopes: true, updatedAt: true, createdAt: true },
      },
    },
  });

  return NextResponse.json({ ok: true, shops });
}
