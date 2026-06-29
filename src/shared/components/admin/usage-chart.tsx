// src/shared/components/admin/usage-chart.tsx — CSS-only usage chart for admin.

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DATA = [
  { label: 'PDF Merge', value: 342, color: 'bg-blue-500' },
  { label: 'Image Resize', value: 287, color: 'bg-green-500' },
  { label: 'JSON Formatter', value: 256, color: 'bg-purple-500' },
  { label: 'Base64 Encoder', value: 198, color: 'bg-orange-500' },
  { label: 'Image Compress', value: 176, color: 'bg-pink-500' },
  { label: 'Case Converter', value: 143, color: 'bg-cyan-500' },
];

export function UsageChart() {
  const max = Math.max(...DATA.map((d) => d.value));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top tools (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {DATA.map((item) => {
            const width = max > 0 ? (item.value / max) * 100 : 0;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
