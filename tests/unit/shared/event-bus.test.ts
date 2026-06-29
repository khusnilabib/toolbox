// tests/unit/shared/event-bus.test.ts — Unit tests for EventBus
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '@/shared/lib/event-bus';
import type { BaseEvent } from '@packages/types';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('subscribes and receives events with full BaseEvent shape', () => {
    const handler = vi.fn();
    bus.on('test-event', handler);
    bus.emit('test-event', { foo: 'bar' });
    expect(handler).toHaveBeenCalledTimes(1);
    const call = handler.mock.calls[0]?.[0] as BaseEvent | undefined;
    expect(call).toBeDefined();
    expect(call!.name).toBe('test-event');
    expect(call!.payload).toEqual({ foo: 'bar' });
    expect(call!.id).toBeTruthy();
    expect(call!.timestamp).toBeGreaterThan(0);
  });

  it('supports multiple subscribers', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.on('evt', h1);
    bus.on('evt', h2);
    bus.emit('evt', null);
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe function returned by on() works', () => {
    const handler = vi.fn();
    const unsub = bus.on('evt', handler);
    bus.emit('evt', null);
    expect(handler).toHaveBeenCalledTimes(1);
    unsub();
    bus.emit('evt', null);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('listeners that throw do not break the bus', () => {
    const goodHandler = vi.fn();
    bus.on('evt', () => {
      throw new Error('listener failure');
    });
    bus.on('evt', goodHandler);
    expect(() => bus.emit('evt', null)).not.toThrow();
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });

  it('clear() removes all subscribers', () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.on('evt1', h1);
    bus.on('evt2', h2);
    bus.clear();
    bus.emit('evt1', null);
    bus.emit('evt2', null);
    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('wildcard listener receives all events', () => {
    const wildcard = vi.fn();
    bus.on('*', wildcard);
    bus.emit('a', { x: 1 });
    bus.emit('b', { y: 2 });
    expect(wildcard).toHaveBeenCalledTimes(2);
  });
});
