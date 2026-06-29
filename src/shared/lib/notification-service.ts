// src/shared/lib/notification-service.ts — User-facing notifications.

import { toast } from 'sonner';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

/**
 * Thin wrapper around sonner toasts — keeps the rest of the app decoupled
 * from any specific notification library (EC-03 Component Reuse First).
 */
export const notificationService = {
  success(title: string, options?: NotificationOptions): void {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    });
  },
  error(title: string, options?: NotificationOptions): void {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 6000,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    });
  },
  info(title: string, options?: NotificationOptions): void {
    toast.info(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    });
  },
  warning(title: string, options?: NotificationOptions): void {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    });
  },
  dismissAll(): void {
    toast.dismiss();
  },
};

export function notify(kind: NotificationKind, title: string, options?: NotificationOptions): void {
  notificationService[kind](title, options);
}
