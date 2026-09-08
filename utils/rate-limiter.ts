/**
 * In-Memory Sliding-Window Rate Limiter
 * Protects against brute-force attacks, credential stuffing, and abusive automated requests.
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface RateLimitOptions {
  maxAttempts?: number; // Default: 5 attempts
  windowMs?: number;    // Default: 5 minutes (300,000 ms)
}

/**
 * Checks if a given identifier (e.g. IP or email) has exceeded rate limits.
 * Returns { allowed: boolean, remaining: number, retryAfterSeconds: number }
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const maxAttempts = options.maxAttempts ?? 5;
  const windowMs = options.windowMs ?? 5 * 60 * 1000;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Window expired or new key
    rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (record.attempts >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.attempts += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets the rate limit counter for an identifier upon successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}
