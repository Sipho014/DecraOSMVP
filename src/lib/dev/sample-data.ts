import { type AdSetMetrics } from '@/lib/engine/decision-engine';

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSampleAdSets(count = 6): AdSetMetrics[] {
  const angles = ['Broad Prospecting', 'Retargeting 7D', 'UGC Hook', 'Offer Stack', 'Interest Stack', 'Lookalike'];
  const products = ['Starter Kit', 'Bundle A', 'Bundle B', 'Hero SKU', 'Subscription'];

  return Array.from({ length: count }).map((_, i) => {
    const spend = Number(rnd(20, 450).toFixed(2));
    const purchases = Math.random() < 0.25 ? 0 : Math.floor(rnd(1, 18));
    const aov = rnd(35, 120);
    const revenue = Number((purchases * aov).toFixed(2));
    const cpa = purchases > 0 ? Number((spend / purchases).toFixed(2)) : null;
    const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
    const ctr = Number(rnd(0.004, 0.03).toFixed(4));
    const frequency = Number(rnd(1.0, 4.2).toFixed(1));

    const ctrTrend7d = pick(['up', 'down', 'flat'] as const);
    const cpaTrend7d = pick(['up', 'down', 'flat'] as const);

    return {
      id: `adset_${i + 1}`,
      name: `${pick(angles)} • ${pick(products)}`,
      spend,
      purchases,
      revenue,
      cpa,
      roas,
      ctr,
      frequency,
      ctrTrend7d,
      cpaTrend7d,
      learning: Math.random() < 0.2,
    };
  });
}
