import { type ShopSettings } from '@/lib/settings';

export type DecisionPolicy = {
  currency: string;

  spendKillThreshold: number;
  breakEvenCpa: number;
  minConversionsToScale: number;

  ctrDeclineTriggersTestBelow: number; // 0-1
  frequencyFatigueThreshold: number;
};

export function policyFromSettings(opts: {
  currency: string;
  settings: ShopSettings;
}): DecisionPolicy {
  const { currency, settings } = opts;

  return {
    currency,
    spendKillThreshold: settings.thresholds.spendKillThreshold,
    breakEvenCpa: settings.breakEvenCpa,
    minConversionsToScale: settings.thresholds.minConversionsToScale,
    ctrDeclineTriggersTestBelow: settings.thresholds.ctrDeclineTriggersTestBelow,
    frequencyFatigueThreshold: settings.thresholds.frequencyFatigueThreshold,
  };
}
