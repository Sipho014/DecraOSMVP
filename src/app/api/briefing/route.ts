import { NextResponse } from 'next/server';

import { type MorningBriefing } from '@/lib/contracts/briefing';
import { generateSampleAdSets } from '@/lib/dev/sample-data';
import { evaluateAdSets } from '@/lib/engine/decision-engine';
import { computeBriefingKpis } from '@/lib/engine/metrics-engine';
import { getShopifyAccessToken } from '@/lib/integrations';
import { prisma } from '@/lib/prisma';
import { persistBriefing } from '@/lib/briefing/store';
import { DEFAULT_SETTINGS, parseShopSettings } from '@/lib/settings';
import { fetchOrdersSummary } from '@/integrations/shopify/shopify-client';

export async function GET(req: Request) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  // Shopify metrics (if connected)
  let shopify: null | Awaited<ReturnType<typeof fetchOrdersSummary>> = null;
  if (shop) {
    const conn = await getShopifyAccessToken(shop);
    if (conn) {
      shopify = await fetchOrdersSummary({ shop, accessToken: conn.accessToken });
    }
  }

  // Ads (sample until Meta exists)
  const adsets = generateSampleAdSets(7);
  const spend = adsets.reduce((s, a) => s + a.spend, 0);
  const purchases = adsets.reduce((s, a) => s + a.purchases, 0);

  // Economics inputs (settings override)
  const currency = shopify?.currency ?? 'EUR';
  const shopRow = shop ? await prisma.shop.findUnique({ where: { shopDomain: shop } }) : null;
  const settings = shopRow ? parseShopSettings(shopRow.settings) : DEFAULT_SETTINGS;
  const breakEvenCpa = settings.breakEvenCpa;

  const metrics = computeBriefingKpis({
    date,
    currency,
    shopDomain: shop ?? undefined,
    revenue: shopify?.revenue ?? 0,
    orders: shopify?.ordersCount ?? 0,
    aov: shopify?.aov ?? 0,
    spend,
    purchases,
    breakEvenCpa,
  });

  const actions = evaluateAdSets({
    adsets,
    config: {
      currency,
      spendKillThreshold: settings.thresholds.spendKillThreshold,
      breakEvenCpa,
      minConversionsToScale: settings.thresholds.minConversionsToScale,
      ctrDeclineTriggersTestBelow: settings.thresholds.ctrDeclineTriggersTestBelow,
      frequencyFatigueThreshold: settings.thresholds.frequencyFatigueThreshold,
    },
  });

  const briefing: MorningBriefing = {
    id: `briefing_${date}`,
    generatedAt: now.toISOString(),
    kpis: metrics.kpis,
    actions,
  };

  // Persist (best-effort)
  try {
    await persistBriefing({
      shopDomain: shop ?? undefined,
      date,
      briefing,
    });
  } catch {
    // ignore; MVP should still render
  }

  return NextResponse.json({
    ...briefing,
    _debug: {
      analyzedAt: now.toISOString(),
      shopify,
      adsets,
      computed: {
        mer: metrics.mer,
        cpa: metrics.cpa,
        roas: metrics.roas,
        breakEvenCpa: metrics.breakEvenCpa,
      },
    },
  });
}
