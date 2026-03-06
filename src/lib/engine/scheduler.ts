export type SchedulerJob = {
  id: string;
  name: string;
  schedule: string; // cron-like string, e.g. "0 8 * * *"
  run: () => Promise<void>;
};

// MVP stub: no runtime scheduler yet.
// Later we can wire this to Vercel Cron, node-cron, or a queue worker.
export function getDailyBriefingJobs(): SchedulerJob[] {
  return [
    {
      id: 'daily-briefing',
      name: 'Generate daily morning briefing',
      schedule: '0 8 * * *',
      run: async () => {
        // Placeholder: actual implementation will iterate shops and call the briefing pipeline.
        return;
      },
    },
  ];
}
