import { z } from 'zod';

/*
 * Error System — Per 02_SAD §6.3, PC-08 (ADR-061):
 * Typed errors with user-facing messages.
 * Every error: what happened, why, how to fix.
 * Never expose stack traces.
 */

// ═══ Error Kinds ═══

export const ERROR_KINDS = [
  'validation',
  'processing',
  'quota_exceeded',
  'auth_required',
  'server_unavailable',
] as const;

export type ErrorKind = (typeof ERROR_KINDS)[number];

// ═══ Error Schemas (Zod — for serialization/deserialization) ═══

export const userMessageSchema = z.object({
  what: z.string().min(1),
  why: z.string().optional(),
  howToFix: z.string().min(1),
});

export const toolErrorSchema = z.object({
  kind: z.enum(ERROR_KINDS),
  cause: z.string(),
  userMessage: userMessageSchema,
  retryable: z.boolean().default(false),
  field: z.string().optional(),
});

export type ToolErrorData = z.infer<typeof toolErrorSchema>;

// ═══ Error Classes ═══

export class ToolError extends Error {
  readonly kind: ErrorKind;
  readonly cause_id: string;
  readonly userMessage: { what: string; why?: string; howToFix: string };
  readonly retryable: boolean;
  readonly field?: string;

  constructor(params: ToolErrorData) {
    super(params.userMessage.what);
    this.name = 'ToolError';
    this.kind = params.kind;
    this.cause_id = params.cause;
    this.userMessage = params.userMessage;
    this.retryable = params.retryable;
    this.field = params.field;
  }

  serialize(): ToolErrorData {
    return {
      kind: this.kind,
      cause: this.cause_id,
      userMessage: this.userMessage,
      retryable: this.retryable,
      ...(this.field ? { field: this.field } : {}),
    };
  }

  static fromSerialized(data: unknown): ToolError {
    const parsed = toolErrorSchema.parse(data);
    return new ToolError(parsed);
  }
}

export class ValidationError extends ToolError {
  constructor(field: string, message: string) {
    super({
      kind: 'validation',
      cause: 'validation_failed',
      userMessage: {
        what: `Invalid input for ${field}.`,
        why: message,
        howToFix: `Please check the ${field} field and try again.`,
      },
      retryable: false,
      field,
    });
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends ToolError {
  constructor(cause: string, what: string, why?: string, howToFix?: string) {
    super({
      kind: 'processing',
      cause,
      userMessage: {
        what,
        ...(why ? { why } : {}),
        howToFix: howToFix ?? 'Please try again. If the problem persists, try a different file or input.',
      },
      retryable: true,
    });
    this.name = 'ProcessingError';
  }
}

export class AuthenticationError extends ToolError {
  constructor(feature: string) {
    super({
      kind: 'auth_required',
      cause: 'authentication_required',
      userMessage: {
        what: `${feature} requires an account.`,
        why: 'You need to be signed in to use this feature.',
        howToFix: 'Sign in or create a free account to continue.',
      },
      retryable: false,
    });
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ToolError {
  constructor(retryAfter: number) {
    super({
      kind: 'quota_exceeded',
      cause: 'rate_limited',
      userMessage: {
        what: 'Too many requests.',
        why: `You've exceeded the rate limit. Please wait ${retryAfter} seconds.`,
        howToFix: `Try again in ${retryAfter} seconds.`,
      },
      retryable: true,
    });
    this.name = 'RateLimitError';
  }
}

export class UnexpectedError extends ToolError {
  constructor() {
    super({
      kind: 'processing',
      cause: 'unexpected_error',
      userMessage: {
        what: 'Something went wrong.',
        why: 'An unexpected error occurred during processing.',
        howToFix: 'Please try again. If the problem persists, try a different input or contact support.',
      },
      retryable: true,
    });
    this.name = 'UnexpectedError';
  }
}

// ═══ Error Helpers ═══

export function isToolError(error: unknown): error is ToolError {
  return error instanceof ToolError;
}

export function toToolError(error: unknown): ToolError {
  if (error instanceof ToolError) return error;
  if (error instanceof Error) {
    return new ProcessingError(
      'unknown',
      'An error occurred during processing.',
      error.message,
    );
  }
  return new UnexpectedError();
}
