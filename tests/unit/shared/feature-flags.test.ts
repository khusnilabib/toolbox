// tests/unit/shared/feature-flags.test.ts — Unit tests for FeatureFlagService
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FeatureFlagService } from '@/shared/lib/feature-flags';
import type { FeatureFlag } from '@packages/types';

const FLAGS: FeatureFlag[] = [
  { key: 'new-dashboard', enabled: true, description: 'New dashboard UI' },
  { key: 'beta-tools', enabled: false, description: 'Beta tools visible' },
  {
    key: 'rollout-50',
    enabled: true,
    description: '50% rollout',
    rolloutPercentage: 50,
  },
];

describe('FeatureFlagService', () => {
  let svc: FeatureFlagService;

  beforeEach(() => {
    svc = new FeatureFlagService(FLAGS);
  });

  it('isEnabled returns the configured value', () => {
    expect(svc.isEnabled('new-dashboard')).toBe(true);
    expect(svc.isEnabled('beta-tools')).toBe(false);
  });

  it('isEnabled returns false for unknown keys', () => {
    expect(svc.isEnabled('unknown-flag')).toBe(false);
  });

  it('register() adds a new flag and notifies subscribers', () => {
    const subscriber = vi.fn();
    svc.subscribe(subscriber);
    svc.register({ key: 'new-flag', enabled: true, description: 'New' });
    expect(svc.isEnabled('new-flag')).toBe(true);
    expect(subscriber).toHaveBeenCalledWith(expect.objectContaining({ key: 'new-flag' }));
  });

  it('setEnabled() updates an existing flag', () => {
    expect(svc.isEnabled('beta-tools')).toBe(false);
    svc.setEnabled('beta-tools', true);
    expect(svc.isEnabled('beta-tools')).toBe(true);
  });

  it('setEnabled() on unknown flag is a no-op', () => {
    svc.setEnabled('does-not-exist', true);
    expect(svc.isEnabled('does-not-exist')).toBe(false);
  });

  it('all() returns every registered flag', () => {
    const all = svc.all();
    expect(all.length).toBe(FLAGS.length);
    expect(all.map((f) => f.key).sort()).toEqual(['beta-tools', 'new-dashboard', 'rollout-50']);
  });

  it('evaluate() respects 100% rollout', () => {
    svc.register({ key: 'full-rollout', enabled: true, description: 'full', rolloutPercentage: 100 });
    expect(svc.evaluate('full-rollout', 'user-1')).toBe(true);
    expect(svc.evaluate('full-rollout', 'user-2')).toBe(true);
  });

  it('evaluate() respects 0% rollout', () => {
    svc.register({ key: 'zero-rollout', enabled: true, description: 'zero', rolloutPercentage: 0 });
    expect(svc.evaluate('zero-rollout', 'user-1')).toBe(false);
  });

  it('evaluate() returns false when flag is disabled', () => {
    expect(svc.evaluate('beta-tools', 'user-1')).toBe(false);
  });

  it('subscribe() returns an unsubscribe function', () => {
    const subscriber = vi.fn();
    const unsub = svc.subscribe(subscriber);
    svc.setEnabled('beta-tools', true);
    expect(subscriber).toHaveBeenCalledTimes(1);
    unsub();
    svc.setEnabled('beta-tools', false);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });
});
