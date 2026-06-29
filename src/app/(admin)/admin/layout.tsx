// src/app/(admin)/admin/layout.tsx — Admin layout with sidebar navigation.
// Phase 8 Sprint 6 — Admin Completion.

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Wrench,
  Search,
  BarChart3,
  ScrollText,
  Flag,
  Activity,
  Settings,
  FileText,
  HeartPulse,
} from 'lucide-react';
import { PageContainer } from '@/shared/components/page-container';

export const metadata = {
  title: 'Admin Console — Toolbox',
  description: 'Operational control center for the Toolbox platform.',
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/tools', label: 'Tools', icon: Wrench },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/audit', label: 'Audit Trail', icon: ScrollText },
  { href: '/admin/flags', label: 'Feature Flags', icon: Flag },
  { href: '/admin/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/health', label: 'System Health', icon: HeartPulse },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <PageContainer className="flex h-14 items-center justify-between py-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Toolbox Admin</span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">v1.0.0</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View site →
            </Link>
          </nav>
        </PageContainer>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 border-r bg-muted/30 lg:block">
          <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-x-hidden">
          <PageContainer className="py-8">{children}</PageContainer>
        </main>
      </div>
    </div>
  );
}
