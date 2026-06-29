// tests/unit/shared/storage-service.test.ts — Unit tests for StorageService
import { describe, it, expect, beforeEach } from 'vitest';
import {
  StorageService,
  MemoryStorageAdapter,
} from '@/shared/lib/storage-service';

describe('StorageService with MemoryStorageAdapter', () => {
  let storage: StorageService;

  beforeEach(() => {
    storage = new StorageService(new MemoryStorageAdapter());
  });

  it('put + get round-trips a string', async () => {
    await storage.put('key1', 'hello');
    const value = await storage.get('key1');
    expect(value).toBe('hello');
  });

  it('returns null for missing keys', async () => {
    const value = await storage.get('missing');
    expect(value).toBeNull();
  });

  it('deletes a value', async () => {
    await storage.put('key1', 'value1');
    await storage.delete('key1');
    expect(await storage.get('key1')).toBeNull();
  });

  it('clears all values', async () => {
    await storage.put('key1', 'value1');
    await storage.put('key2', 'value2');
    await storage.clear();
    expect(await storage.get('key1')).toBeNull();
    expect(await storage.get('key2')).toBeNull();
  });

  it('can swap adapters via setAdapter', async () => {
    await storage.put('key', 'a');
    const newAdapter = new MemoryStorageAdapter();
    storage.setAdapter(newAdapter);
    expect(await storage.get('key')).toBeNull();
    await storage.put('key', 'b');
    expect(await storage.get('key')).toBe('b');
  });
});

describe('MemoryStorageAdapter', () => {
  it('isolates data per instance', async () => {
    const a = new MemoryStorageAdapter();
    const b = new MemoryStorageAdapter();
    await a.put('key', 'a-value');
    await b.put('key', 'b-value');
    expect(await a.get('key')).toBe('a-value');
    expect(await b.get('key')).toBe('b-value');
  });
});
