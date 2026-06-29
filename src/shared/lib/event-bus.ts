// src/shared/lib/event-bus.ts — Application event bus (DGA-02, 16_EventSchemaSpecification).

import { generateId } from '@packages/utils';
import type { BaseEvent } from '@packages/types';

/** The 14 canonical platform event types. */
export const PLATFORM_EVENT_TYPES = [
  'tool:viewed',
  'tool:started',
  'tool:validation_failed',
  'tool:processing_started',
  'tool:processing_completed',
  'tool:download_attempted',
  'tool:download_completed',
  'tool:shared',
  'tool:cancelled',
  'tool:error',
  'tool:progress',
  'registration:prompt_viewed',
  'registration:completed',
  'feature_flag:changed',
] as const;
export type PlatformEventType = (typeof PLATFORM_EVENT_TYPES)[number];

type EventListener<TName extends string = string, TPayload = Record<string, unknown>> = (
  event: BaseEvent<TName, TPayload>,
) => void;

export class EventBus {
  private listeners = new Map<string, Set<EventListener>>();

  on<TName extends string, TPayload = Record<string, unknown>>(
    name: TName,
    listener: EventListener<TName, TPayload>,
  ): () => void {
    const set = this.listeners.get(name) ?? new Set();
    set.add(listener as EventListener);
    this.listeners.set(name, set);
    return () => {
      set.delete(listener as EventListener);
    };
  }

  emit<TName extends string, TPayload = Record<string, unknown>>(
    name: TName,
    payload: TPayload,
    context?: BaseEvent['context'],
  ): void {
    const event: BaseEvent<TName, TPayload> = {
      id: generateId('evt'),
      name,
      timestamp: Date.now(),
      payload,
      context,
    };
    const set = this.listeners.get(name);
    if (set) {
      for (const listener of set) {
        try {
          listener(event as BaseEvent);
        } catch {
          /* listeners must never break the bus */
        }
      }
    }
    // Wildcard listeners
    const wildcard = this.listeners.get('*');
    if (wildcard) {
      for (const listener of wildcard) {
        try {
          listener(event as BaseEvent);
        } catch {
          /* no-op */
        }
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

let singleton: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!singleton) singleton = new EventBus();
  return singleton;
}
