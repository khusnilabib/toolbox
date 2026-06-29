// src/app/(admin)/admin/monitoring/page.tsx — Monitoring dashboard (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Monitoring — Admin',
  description: 'Sentry, Web Vitals, error reporting.',
  robots: { index: false, follow: false },
};

export default function AdminMonitoringPage() {
  const sentryConfigured = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
  const vercelAnalyticsConfigured = Boolean(process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Error reporting, performance, and Web Vitals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" aria-hidden />
              Sentry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sentryConfigured ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" aria-hidden />
                <span className="text-sm">Not configured</span>
                <Badge variant="outline" className="ml-2 text-xs">Set NEXT_PUBLIC_SENTRY_DSN</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" aria-hidden />
              Vercel Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vercelAnalyticsConfigured ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" aria-hidden />
                <span className="text-sm">Not configured</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Web Vitals Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs">POST /api/web-vitals</span>
              <Badge variant="default">active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs">GET /api/health</span>
              <Badge variant="default">active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
