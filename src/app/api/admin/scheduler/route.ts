import { NextResponse } from 'next/server';

import { getDailyBriefingJobs } from '@/lib/engine/scheduler';

export async function GET() {
  const jobs = getDailyBriefingJobs();
  return NextResponse.json({
    ok: true,
    jobs: jobs.map((j) => ({ id: j.id, name: j.name, schedule: j.schedule })),
  });
}
