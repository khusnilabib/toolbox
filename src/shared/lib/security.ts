// src/shared/lib/security.ts — Security utilities (Phase 5 Sprint 6).
// Input sanitization, file scanning hooks, nonce generation, secure cookies.

import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';

// ─── Nonce Generation (for CSP) ──────────────────────────────────────────────
const NONCE_LENGTH = 16;

/**
 * Generate a cryptographically random base64-encoded nonce.
 * Used for per-request CSP nonces.
 */
export function generateNonce(): string {
  return randomBytes(NONCE_LENGTH).toString('base64');
}

// ─── Input Sanitization ─────────────────────────────────────────────────────
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters. Use when inserting untrusted text into HTML.
 * (React already escapes by default — use this for dangerouslySetInnerHTML.)
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`=\/]/g, (c) => HTML_ENTITIES[c] ?? c);
}

/**
 * Strip HTML tags from a string. Useful for plain-text display of rich input.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a filename: remove path traversal attempts, normalize, truncate.
 */
export function sanitizeFilename(filename: string, maxLength = 255): string {
  // Remove path separators and traversal
  const cleaned = filename
    .replace(/\.\./g, '') // no parent traversal
    .replace(/[\/\\]/g, '_') // no path separators
    .replace(/[<>:"|?*\x00-\x1f]/g, '_') // no forbidden chars
    .replace(/^\.+/, '') // no leading dots
    .trim();

  // Truncate to maxLength while preserving extension
  if (cleaned.length <= maxLength) return cleaned;
  const dotIndex = cleaned.lastIndexOf('.');
  if (dotIndex === -1) return cleaned.slice(0, maxLength);
  const ext = cleaned.slice(dotIndex);
  return cleaned.slice(0, maxLength - ext.length) + ext;
}

// ─── File Scanning Hooks (Phase 5) ───────────────────────────────────────────
export interface FileScanResult {
  safe: boolean;
  reasons: string[];
}

export interface FileScanOptions {
  // Max file size in bytes (default: 50 MB)
  maxBytes?: number;
  // Allowed MIME types (empty = allow all)
  allowedMimeTypes?: string[];
  // Allowed extensions (empty = allow all)
  allowedExtensions?: string[];
  // Block these magic numbers (file signatures)
  blockedMagicNumbers?: Array<{ bytes: number[]; description: string }>;
}

const DEFAULT_BLOCKED_MAGIC_NUMBERS: Array<{ bytes: number[]; description: string }> = [
  // Executables
  { bytes: [0x4d, 0x5a], description: 'Windows executable (MZ)' },
  { bytes: [0x7f, 0x45, 0x4c, 0x46], description: 'Linux ELF executable' },
  { bytes: [0xca, 0xfe, 0xba, 0xbe], description: 'Java class file' },
  // Scripts that could be embedded
  { bytes: [0x23, 0x21], description: 'Shell script shebang' },
];

/**
 * Scan a file before processing. Returns whether the file is safe to process.
 */
export async function scanFile(file: File | Blob, options: FileScanOptions = {}): Promise<FileScanResult> {
  const reasons: string[] = [];
  const {
    maxBytes = 50 * 1024 * 1024,
    allowedMimeTypes = [],
    allowedExtensions = [],
    blockedMagicNumbers = DEFAULT_BLOCKED_MAGIC_NUMBERS,
  } = options;

  // Size check
  if (file.size > maxBytes) {
    reasons.push(`File exceeds maximum size of ${maxBytes} bytes`);
  }

  // MIME type check
  if (allowedMimeTypes.length > 0 && file.type) {
    if (!allowedMimeTypes.includes(file.type)) {
      reasons.push(`MIME type ${file.type} is not allowed`);
    }
  }

  // Extension check
  if (allowedExtensions.length > 0 && file instanceof File && file.name) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext && !allowedExtensions.includes(ext)) {
      reasons.push(`File extension .${ext} is not allowed`);
    }
  }

  // Magic number check (read first 8 bytes)
  try {
    const header = await file.slice(0, 8).arrayBuffer();
    const bytes = Array.from(new Uint8Array(header));
    for (const { bytes: sig, description } of blockedMagicNumbers) {
      if (sig.every((b, i) => bytes[i] === b)) {
        reasons.push(`Blocked file signature: ${description}`);
      }
    }
  } catch {
    reasons.push('Could not read file header for magic number check');
  }

  return { safe: reasons.length === 0, reasons };
}

// ─── Secure Cookies ─────────────────────────────────────────────────────────
export interface SecureCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
  domain?: string;
}

/**
 * Set a cookie with secure defaults (HttpOnly, Secure, SameSite=Lax).
 */
export async function setSecureCookie(name: string, value: string, options: SecureCookieOptions = {}): Promise<void> {
  const store = await cookies();
  const {
    httpOnly = true,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
    maxAge = 60 * 60 * 24 * 7, // 7 days
    path = '/',
    domain,
  } = options;

  store.set(name, value, {
    httpOnly,
    secure,
    sameSite,
    maxAge,
    path,
    domain,
  });
}

/**
 * Clear a cookie by setting it to expired with the same secure options.
 */
export async function clearSecureCookie(name: string, path = '/'): Promise<void> {
  const store = await cookies();
  store.set(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path,
  });
}

// ─── Constant-Time Comparison (for tokens) ───────────────────────────────────
/**
 * Compare two strings in constant time to prevent timing attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── CSRF Token (for non-Next.js-form contexts) ──────────────────────────────
const CSRF_COOKIE = 'csrf-token';

/**
 * Generate and set a CSRF token in a cookie. Returns the token.
 * The cookie is HttpOnly=false so the client can read it and include it in
 * request headers (X-CSRF-Token). The server compares the header against the cookie.
 */
export async function issueCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const store = await cookies();
  store.set(CSRF_COOKIE, token, {
    httpOnly: false, // client must read this to send back
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  return token;
}

/**
 * Verify the CSRF token from the request header matches the cookie.
 */
export async function verifyCsrfToken(headerToken: string | null | undefined): Promise<boolean> {
  if (!headerToken) return false;
  const store = await cookies();
  const cookieToken = store.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;
  return constantTimeCompare(headerToken, cookieToken);
}
