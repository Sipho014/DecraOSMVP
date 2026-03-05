import { prisma } from '@/lib/prisma';

import type { MorningBriefing } from '@/lib/contracts/briefing';

export async function persistBriefing(opts: {
  shopDomain?: string;
  date: string; // YYYY-MM-DD
  briefing: MorningBriefing;
}) {
  const shop = opts.shopDomain
    ? await prisma.shop.findUnique({ where: { shopDomain: opts.shopDomain } })
    : null;

  return prisma.briefing.upsert({
    where: {
      shopId_date: {
        shopId: shop?.id ?? null,
        date: opts.date,
      },
    },
    create: {
      shopId: shop?.id ?? null,
      date: opts.date,
      generatedAt: new Date(opts.briefing.generatedAt),
      payload: opts.briefing,
    },
    update: {
      generatedAt: new Date(opts.briefing.generatedAt),
      payload: opts.briefing,
    },
  });
}
