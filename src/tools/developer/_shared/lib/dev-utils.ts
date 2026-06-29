// src/tools/developer/_shared/lib/dev-utils.ts — Pure developer-tool helpers.

export function encodeBase64(input: string, urlSafe = false): string {
  let result: string;
  if (typeof btoa === 'function') {
    // Handle UTF-8 via encodeURIComponent trick.
    const utf8 = unescape(encodeURIComponent(input));
    result = btoa(utf8);
  } else if (typeof Buffer !== 'undefined') {
    result = Buffer.from(input, 'utf-8').toString('base64');
  } else {
    throw new Error('No Base64 encoder available in this environment.');
  }
  return urlSafe ? result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : result;
}

export function decodeBase64(input: string, urlSafe = false): string {
  let normalized = input.trim();
  if (urlSafe) {
    normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) normalized += '=';
  }
  if (typeof atob === 'function') {
    const utf8 = atob(normalized);
    return decodeURIComponent(escape(utf8));
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(normalized, 'base64').toString('utf-8');
  }
  throw new Error('No Base64 decoder available in this environment.');
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    throw new Error('Invalid URL-encoded string.');
  }
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback.
  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
}

export function generateUuids(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < Math.max(1, count); i += 1) {
    result.push(generateUuid());
  }
  return result;
}

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT: expected 3 dot-separated segments.');
  }
  try {
    const header = JSON.parse(decodeBase64(parts[0]!, true));
    const payload = JSON.parse(decodeBase64(parts[1]!, true));
    return { header, payload, signature: parts[2]! };
  } catch (err) {
    throw new Error(
      `Invalid JWT payload: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export type HashAlgorithm = 'sha-1' | 'sha-256' | 'sha-384' | 'sha-512';

export async function generateHash(
  data: string,
  algorithm: HashAlgorithm,
): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  throw new Error('Web Crypto is not available in this environment.');
}

export function formatJson(input: string, indent = 2): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}
