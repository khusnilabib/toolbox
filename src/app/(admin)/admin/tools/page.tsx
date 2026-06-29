// src/app/(admin)/admin/tools/page.tsx — Tool inventory management (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminInventory } from '@/generated/admin-inventory';

export const metadata = {
  title: 'Tools — Admin',
  description: 'Tool inventory management.',
  robots: { index: false, follow: false },
};

export default function AdminToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tool Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {adminInventory.length} tools across {new Set(adminInventory.map((t) => t.category)).size} categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Tools</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Slug</th>
                  <th className="px-4 py-2 text-left font-medium">Category</th>
                  <th className="px-4 py-2 text-left font-medium">Lifecycle</th>
                  <th className="px-4 py-2 text-left font-medium">Version</th>
                  <th className="px-4 py-2 text-left font-medium">Auth</th>
                  <th className="px-4 py-2 text-left font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adminInventory.map((tool) => (
                  <tr key={`${tool.category}-${tool.slug}`} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono">{tool.slug}</td>
                    <td className="px-4 py-2 capitalize">{tool.category}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          tool.lifecycle === 'stable'
                            ? 'default'
                            : tool.lifecycle === 'beta'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {tool.lifecycle}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{tool.version}</td>
                    <td className="px-4 py-2">
                      {tool.requiresAuth ? (
                        <Badge variant="destructive">required</Badge>
                      ) : (
                        <Badge variant="outline">guest</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {new Date(tool.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
