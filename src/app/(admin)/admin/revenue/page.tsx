// src/app/(admin)/admin/revenue/page.tsx — Revenue Dashboard (Sprint 12 Phase 10).

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MousePointerClick, Mail, Users, TrendingUp, Eye } from 'lucide-react';

export const metadata = {
  title: 'Revenue — Admin',
  description: 'Revenue and monetization dashboard.',
  robots: { index: false, follow: false },
};

export default function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenue Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monetization metrics — connect AdSense and analytics for live data.
        </p>
      </div>

      {/* Revenue KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <DollarSign className="h-4 w-4 text-green-500" aria-hidden />
              </div>
              <Badge variant="outline" className="text-xs">Est.</Badge>
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">$—</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <MousePointerClick className="h-4 w-4 text-blue-500" aria-hidden />
              </div>
              <Badge variant="outline" className="text-xs">CTR</Badge>
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">—%</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Ads CTR</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-purple-500" aria-hidden />
              </div>
              <Badge variant="outline" className="text-xs">Subs</Badge>
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">—</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Newsletter Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Users className="h-4 w-4 text-orange-500" aria-hidden />
              </div>
              <Badge variant="outline" className="text-xs">Waitlist</Badge>
            </div>
            <div className="mt-3 text-2xl font-bold tabular-nums">—</div>
            <p className="mt-0.5 text-xs text-muted-foreground">Premium Waitlist</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Display Ads', value: '—', pct: 70 },
                { label: 'Affiliate', value: '—', pct: 15 },
                { label: 'Newsletter Sponsor', value: '—', pct: 10 },
                { label: 'Premium (future)', value: '—', pct: 5 },
              ].map((src) => (
                <div key={src.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{src.label}</span>
                    <span className="tabular-nums text-muted-foreground">{src.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${src.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">RPM</p>
                <p className="mt-1 text-lg font-bold tabular-nums">$—</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">ARPU</p>
                <p className="mt-1 text-lg font-bold tabular-nums">$—</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="mt-1 text-lg font-bold tabular-nums">—%</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-center">
                <p className="text-xs text-muted-foreground">Returning</p>
                <p className="mt-1 text-lg font-bold tabular-nums">—%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Pages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />
            Top Revenue Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['PDF Merger', 'Image Resizer', 'JSON Formatter', 'Base64 Encoder', 'Image Compressor'].map((tool, i) => (
              <div key={tool} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
                <span className="font-medium">{tool}</span>
                <span className="tabular-nums text-muted-foreground">$— RPM</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> Set NEXT_PUBLIC_ADSENSE_CLIENT
            to enable ads. Revenue data populates from GA4 + AdSense when connected.
            Ads never appear during tool execution.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
