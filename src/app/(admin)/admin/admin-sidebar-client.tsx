// src/app/(admin)/admin/admin-sidebar-client.tsx — Collapsible sidebar client component.

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  tools: Wrench,
  seo: Search,
  analytics: BarChart3,
  audit: ScrollText,
  flags: Flag,
  monitoring: Activity,
  settings: Settings,
  content: FileText,
  health: HeartPulse,
};

export function AdminSidebarClient({ items }: { items: Array<{ href: string; label: string; icon: string }> }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const resolvedItems: NavItem[] = items.map((item) => ({
    href: item.href,
    label: item.label,
    icon: ICON_MAP[item.icon] ?? LayoutDashboard,
  }));

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-sidebar-collapsed');
    if (stored === 'true') {
      queueMicrotask(() => setCollapsed(true));
    }
  }, []);

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu trigger */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-16 z-40 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open admin menu"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 mt-14 flex flex-col border-r border-border bg-background transition-all duration-300 ease-out lg:sticky lg:top-14 lg:mt-0 lg:h-[calc(100vh-3.5rem)]',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin navigation">
          <ul className="space-y-1">
            {resolvedItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center',
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop) */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </aside>
    </>
  );
}
