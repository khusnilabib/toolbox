// src/app/(admin)/admin/analytics/page.tsx — Analytics dashboard (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analyticsConfig } from '@/generated/analytics-config';

export const metadata = {
  title: 'Analytics — Admin',
  description: 'Funnel metrics and tool popularity.',
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Funnel metrics, tool popularity, and conversion rates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">—</div>
            <p className="mt-1 text-xs text-muted-foreground">Total sessions (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">—</div>
            <p className="mt-1 text-xs text-muted-foreground">Tool executions (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">—</div>
            <p className="mt-1 text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {analyticsConfig.slice(0, 10).map((entry) => (
              <div key={entry.slug} className="flex items-center justify-between p-3">
                <div>
                  <div className="text-sm font-mono">{entry.slug}</div>
                  <div className="text-xs text-muted-foreground">
                    Funnel: {entry.funnelSteps.join(' -> ')}
                  </div>
                </div>
                <Badge variant="outline">
                  {entry.customEvents.length} custom events
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2">Notice</Badge>
            Connect a production analytics backend (Vercel Analytics, PostHog, Mixpanel)
            to populate live metrics here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
