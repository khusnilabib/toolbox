// src/shared/config/env.ts — Zod-validated environment variables (EC-08).

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Toolbox'),
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_CONSENT_DEFAULT: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse the environment once (cached). Throws if validation fails.
 */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Environment validation failed — ${issues}`);
  }
  return result.data;
}

let cached: Env | null = null;

/**
 * Get the parsed environment. Cached after first call.
 */
export function getEnv(): Env {
  if (cached) return cached;
  cached = parseEnv();
  return cached;
}

/**
 * Subset of the environment that is safe to expose to the browser
 * (must be prefixed with NEXT_PUBLIC_).
 */
export function getPublicEnv(): {
  siteUrl: string;
  siteName: string;
  ga4MeasurementId?: string;
  plausibleDomain?: string;
  analyticsConsentDefault: boolean;
} {
  const env = getEnv();
  return {
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    ga4MeasurementId: env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    plausibleDomain: env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    analyticsConsentDefault: env.NEXT_PUBLIC_ANALYTICS_CONSENT_DEFAULT,
  };
}
