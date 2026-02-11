/**
 * Simple in-memory rate limiter for Next.js API routes.
 * In production, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60000);

interface RateLimitConfig {
  /** Maximum requests per window */
  max: number;
  /** Time window in seconds */
  windowSec: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { max: 30, windowSec: 60 }
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowSec * 1000;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.max - 1, resetAt };
  }

  entry.count++;
  if (entry.count > config.max) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

/**
 * Get the client IP from a request (for rate limit keying)
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
