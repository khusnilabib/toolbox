// src/app/(admin)/admin/users/page.tsx — User management (Phase 8).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus } from 'lucide-react';

export const metadata = {
  title: 'Users — Admin',
  description: 'User management and profiles.',
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage user accounts and profiles.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-md border p-2">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Search by email or user ID…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search users"
            />
            <button
              type="button"
              className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
            >
              Search
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UserPlus className="mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">No users connected yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Users will appear here once they sign up via the registration flow.
              Connect Supabase to enable user management.
            </p>
            <Badge variant="outline" className="mt-3">Supabase not configured</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
