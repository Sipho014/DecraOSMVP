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

  // Prisma upsert requires a unique selector; composite uniques don’t accept null cleanly.
  // MVP approach: update existing if present, otherwise create.
  const existing = await prisma.briefing.findFirst({
    where: {
      shopId: shop?.id,
      date: opts.date,
    },
  });

  if (existing) {
    return prisma.briefing.update({
      where: { id: existing.id },
      data: {
        generatedAt: new Date(opts.briefing.generatedAt),
        payload: opts.briefing,
      },
    });
  }

  return prisma.briefing.create({
    data: {
      shopId: shop?.id,
      date: opts.date,
      generatedAt: new Date(opts.briefing.generatedAt),
      payload: opts.briefing,
    },
  });
}
