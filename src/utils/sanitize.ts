/**
 * Input hygiene for user-generated content.
 * React already escapes text content, and this codebase never uses
 * dangerouslySetInnerHTML. These helpers are defence-in-depth: they normalise
 * input before it is persisted so stored data can never carry markup,
 * control characters or oversized payloads into a future backend.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const TAGS = /<\/?[a-z][^>]*>/gi;
const ANGLE = /[<>]/g;

export function sanitizeText(input: string, maxLength = 2000): string {
  return input.replace(CONTROL_CHARS, '').replace(TAGS, '').replace(ANGLE, '').replace(/\s{3,}/g, '  ').trim().slice(0, maxLength);
}

export function sanitizeSingleLine(input: string, maxLength = 120): string {
  return sanitizeText(input, maxLength).replace(/[\r\n\t]+/g, ' ');
}

/** Search queries: strip markup and regex-significant noise, collapse whitespace. */
export function sanitizeQuery(input: string): string {
  return sanitizeSingleLine(input, 80).replace(/\s+/g, ' ');
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Only allow in-app relative redirects (prevents open-redirect via ?redirect=). */
export function safeRedirect(target: string | null | undefined, fallback = '/'): string {
  if (!target) return fallback;
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  return target;
}
