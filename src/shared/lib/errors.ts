// src/shared/lib/errors.ts — Platform error hierarchy (PC-08 Error Experience).

import type { ToolError, ToolErrorKind } from '@packages/types';

export class PlatformError extends Error {
  readonly kind: ToolErrorKind;
  readonly cause: string;
  readonly userMessage: { what: string; why?: string; howToFix: string };
  readonly raw?: unknown;

  constructor(params: {
    kind: ToolErrorKind;
    cause: string;
    userMessage: { what: string; why?: string; howToFix: string };
    raw?: unknown;
  }) {
    super(params.cause);
    this.name = 'PlatformError';
    this.kind = params.kind;
    this.cause = params.cause;
    this.userMessage = params.userMessage;
    this.raw = params.raw;
  }

  toToolError(): ToolError {
    return {
      kind: this.kind,
      cause: this.cause,
      userMessage: this.userMessage,
      raw: this.raw,
    };
  }
}

export class ValidationError extends PlatformError {
  constructor(cause: string, userMessage?: { what: string; why?: string; howToFix: string }) {
    super({
      kind: 'validation',
      cause,
      userMessage:
        userMessage ?? {
          what: 'Some of the information you provided is not valid.',
          howToFix: 'Please review the highlighted fields and try again.',
        },
    });
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends PlatformError {
  constructor(cause: string, userMessage?: { what: string; why?: string; howToFix: string }) {
    super({
      kind: 'processing',
      cause,
      userMessage:
        userMessage ?? {
          what: 'We could not process your request.',
          howToFix: 'Please try again. If the problem persists, refresh the page.',
        },
    });
    this.name = 'ProcessingError';
  }
}

export class AuthenticationError extends PlatformError {
  constructor(cause = 'Authentication required') {
    super({
      kind: 'auth_required',
      cause,
      userMessage: {
        what: 'You need to sign in to use this feature.',
        howToFix: 'Sign in or create a free account to continue.',
      },
    });
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends PlatformError {
  constructor(cause = 'Rate limit exceeded') {
    super({
      kind: 'rate_limited',
      cause,
      userMessage: {
        what: 'You have made too many requests in a short time.',
        howToFix: 'Please wait a minute and try again.',
      },
    });
    this.name = 'RateLimitError';
  }
}

export class UnexpectedError extends PlatformError {
  constructor(cause: string, raw?: unknown) {
    super({
      kind: 'unexpected',
      cause,
      userMessage: {
        what: 'Something unexpected happened.',
        howToFix: 'Please try again. If the problem persists, contact support.',
      },
      raw,
    });
    this.name = 'UnexpectedError';
  }
}

/**
 * Serialise an error into a plain object safe to log / send to analytics.
 * Stack traces are never exposed to the user (PC-08).
 */
export function serializeError(err: unknown): ToolError {
  if (err instanceof PlatformError) return err.toToolError();
  const cause = err instanceof Error ? err.message : String(err);
  return {
    kind: 'unexpected',
    cause,
    userMessage: {
      what: 'Something went wrong.',
      howToFix: 'Please try again. If the problem persists, refresh the page.',
    },
    raw: err,
  };
}

/**
 * Return a human-friendly message suitable for UI display (PC-08).
 */
export function getFriendlyMessage(err: unknown): string {
  if (err instanceof PlatformError) {
    const { what, why, howToFix } = err.userMessage;
    return [what, why, howToFix].filter(Boolean).join(' ');
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong.';
}
