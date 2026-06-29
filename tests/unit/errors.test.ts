import { describe, it, expect } from 'vitest';
import { PlatformError, ValidationError, ProcessingError, serializeError, getFriendlyMessage } from '@/shared/lib/errors';

describe('Error System', () => {
  it('creates ValidationError', () => {
    const error = new ValidationError('File required');
    expect(error.kind).toBe('validation');
    expect(error.cause).toBe('File required');
  });

  it('creates ProcessingError', () => {
    const error = new ProcessingError('Failed');
    expect(error.kind).toBe('processing');
  });

  it('creates PlatformError', () => {
    const error = new PlatformError({
      kind: 'validation',
      cause: 'Test',
      userMessage: { what: 'Failed', howToFix: 'Try again' },
    });
    expect(error.kind).toBe('validation');
    expect(error.cause).toBe('Test');
  });

  it('serializes error', () => {
    const error = new ValidationError('Required');
    const serialized = serializeError(error);
    expect(serialized).toBeDefined();
  });

  it('returns friendly message', () => {
    const message = getFriendlyMessage(new Error('unknown'));
    expect(message).toBeDefined();
  });
});
