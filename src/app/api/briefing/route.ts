import { NextResponse } from 'next/server';

import { type MorningBriefing } from '@/lib/contracts/briefing';
import { generateSampleAdSets } from '@/lib/dev/sample-data';
import { evaluateAdSets } from '@/lib/engine/decision-engine';
import { getShopifyAccessToken } from '@/lib/integrations';
import { fetchOrdersSummary } from '@/integrations/shopify/shopify-client';

export async function GET(req: Request) {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  const url = new URL(req.url);
  const shop = url.searchParams.get('shop');

  // Shopify metrics (if connected)
  let shopify = null as null | Awaited<ReturnType<typeof fetchOrdersSummary>>;
  if (shop) {
    const conn = await getShopifyAccessToken(shop);
    if (conn) {
      shopify = await fetchOrdersSummary({ shop, accessToken: conn.accessToken });
    }
  }

  // Until Meta integration exists, generate sample adset metrics.
  const adsets = generateSampleAdSets(7);
  const spend = adsets.reduce((s, a) => s + a.spend, 0);

  const currency = shopify?.currency ?? 'EUR';
  const breakEvenCpa = 28;

  const actions = evaluateAdSets({
    adsets,
    config: {
      currency,
      spendKillThreshold: 120,
      breakEvenCpa,
      minConversionsToScale: 4,
      ctrDeclineTriggersTestBelow: 0.012,
      frequencyFatigueThreshold: 2.6,
    },
  });

  const briefing: MorningBriefing = {
    id: `briefing_${date}`,
    generatedAt: new Date().toISOString(),
    kpis: {
      date,
      shopDomain: shop ?? undefined,
      revenue: shopify?.revenue ?? 0,
      spend: Number(spend.toFixed(2)),
      roas: spend > 0 ? Number(((shopify?.revenue ?? 0) / spend).toFixed(2)) : undefined,
      orders: shopify?.ordersCount ?? 0,
      currency,
    },
    actions,
  };

  return NextResponse.json({
    ...briefing,
    _debug: {
      shopify,
      adsets,
      aov: shopify?.aov ?? 0,
      breakEvenCpa,
    },
  });
}
