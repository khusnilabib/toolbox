// src/shared/lib/rate-limiter.ts — Rate limiter service (Phase 5 Security).
// Provides both in-memory and interface for distributed stores (Redis/KV).

export interface RateLimitConfig {
  // Time window in milliseconds
  windowMs: number;
  // Max requests per window
  max: number;
  // Optional: skip rate limiting for these IPs (allowlist)
  skipIps?: string[];
  // Optional: per-user instead of per-IP (requires userId)
  perUser?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}

export interface RateLimitStore {
  incr(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

// ─── In-Memory Store ─────────────────────────────────────────────────────────
export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async incr(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetAt) {
      const entry = { count: 1, resetAt: now + windowMs };
      this.store.set(key, entry);
      return entry;
    }

    existing.count += 1;
    return existing;
  }

  // Cleanup expired entries (call periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }

  // Reset a specific key (for testing)
  reset(key: string): void {
    this.store.delete(key);
  }

  // Clear all (for testing)
  clear(): void {
    this.store.clear();
  }
}

// ─── Rate Limiter ────────────────────────────────────────────────────────────
export class RateLimiter {
  constructor(
    private store: RateLimitStore,
    private config: RateLimitConfig,
  ) {}

  async check(identifier: string): Promise<RateLimitResult> {
    // Check allowlist
    if (this.config.skipIps?.includes(identifier)) {
      return {
        allowed: true,
        remaining: this.config.max,
        resetAt: Date.now() + this.config.windowMs,
        total: this.config.max,
      };
    }

    const key = `${identifier}:${this.config.windowMs}`;
    const { count, resetAt } = await this.store.incr(key, this.config.windowMs);
    const allowed = count <= this.config.max;

    return {
      allowed,
      remaining: Math.max(0, this.config.max - count),
      resetAt,
      total: this.config.max,
    };
  }
}

// ─── Preset Configurations ──────────────────────────────────────────────────
export const RATE_LIMIT_PRESETS = {
  // Strict: 5 requests per minute (auth endpoints)
  strict: { windowMs: 60_000, max: 5 },
  // Moderate: 30 requests per minute (API endpoints)
  moderate: { windowMs: 60_000, max: 30 },
  // Lenient: 100 requests per minute (general API)
  lenient: { windowMs: 60_000, max: 100 },
  // Very lenient: 200 requests per minute (read-only endpoints)
  readOnly: { windowMs: 60_000, max: 200 },
  // Per-tool execution: 20 tool runs per minute
  toolExecution: { windowMs: 60_000, max: 20 },
  // File uploads: 10 uploads per minute
  fileUpload: { windowMs: 60_000, max: 10 },
} as const;

// ─── Singleton Store ─────────────────────────────────────────────────────────
let globalStore: MemoryRateLimitStore | null = null;

export function getGlobalRateLimitStore(): MemoryRateLimitStore {
  if (!globalStore) {
    globalStore = new MemoryRateLimitStore();
    // Periodic cleanup every 5 minutes
    setInterval(() => globalStore?.cleanup(), 5 * 60_000).unref?.();
  }
  return globalStore;
}
