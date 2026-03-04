import { type BriefingKpis } from '@/lib/contracts/briefing';

export type MetricsEngineInput = {
  date: string;
  currency: string;
  shopDomain?: string;

  // Shopify
  revenue: number;
  orders: number;
  aov?: number;

  // Ads
  spend: number;
  purchases: number;

  // Economics
  breakEvenCpa: number;
};

export type MetricsEngineOutput = {
  kpis: BriefingKpis;
  mer: number | null; // revenue / spend
  cpa: number | null; // spend / purchases
  roas: number | null; // revenue / spend
  breakEvenCpa: number;
};

export function computeBriefingKpis(input: MetricsEngineInput): MetricsEngineOutput {
  const spend = input.spend;
  const revenue = input.revenue;

  const mer = spend > 0 ? revenue / spend : null;
  const roas = spend > 0 ? revenue / spend : null;
  const cpa = input.purchases > 0 ? spend / input.purchases : null;

  const kpis: BriefingKpis = {
    date: input.date,
    shopDomain: input.shopDomain,
    revenue: Number(revenue.toFixed(2)),
    spend: Number(spend.toFixed(2)),
    profit: undefined,
    roas: roas !== null ? Number(roas.toFixed(2)) : undefined,
    orders: input.orders,
    currency: input.currency,
  };

  return {
    kpis,
    mer,
    cpa,
    roas,
    breakEvenCpa: input.breakEvenCpa,
  };
}
