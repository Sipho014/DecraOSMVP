import { NextResponse } from 'next/server';

import { type MorningBriefing } from '@/lib/contracts/briefing';
import { evaluateAdSets } from '@/lib/engine/decision-engine';
import { generateSampleAdSets } from '@/lib/dev/sample-data';

export async function GET() {
  const today = new Date();
  const date = today.toISOString().slice(0, 10);

  // Until integrations exist, generate sample adset metrics.
  const adsets = generateSampleAdSets(7);

  // Simple derived KPIs
  const spend = adsets.reduce((s, a) => s + a.spend, 0);
  const revenue = adsets.reduce((s, a) => s + a.revenue, 0);
  const purchases = adsets.reduce((s, a) => s + a.purchases, 0);
  const roas = spend > 0 ? revenue / spend : undefined;

  // Config (temporary constants)
  const currency = 'EUR';
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
      revenue: Number(revenue.toFixed(2)),
      spend: Number(spend.toFixed(2)),
      roas: roas ? Number(roas.toFixed(2)) : undefined,
      orders: purchases,
      currency,
    },
    actions,
  };

  return NextResponse.json({ ...briefing, _debug: { adsets, breakEvenCpa } });
}
