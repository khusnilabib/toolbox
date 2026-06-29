// src/shared/config/routes.ts — Route constants (single source of truth for navigation).

export const routes = {
  home: '/',
  admin: '/admin',
  health: '/api/health',
  tool: (category: string, slug: string) => `/tools/${category}/${slug}`,
  category: (category: string) => `/tools/${category}`,
  tools: '/tools',
} as const;

export type RouteKey = keyof typeof routes;
