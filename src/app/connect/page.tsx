import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConnectPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Connect</h1>
      <p className="mt-2 text-sm text-muted-foreground">Connect your data sources.</p>

      <div className="mt-6 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Shopify</CardTitle>
            <CardDescription>Connect a Shopify store via OAuth.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Dev flow: open{' '}
              <code className="rounded bg-muted px-1 py-0.5">/api/shopify/connect?shop=…</code>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Morning Briefing</CardTitle>
            <CardDescription>View the briefing dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="text-sm underline" href="/briefing">
              Go to /briefing
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
