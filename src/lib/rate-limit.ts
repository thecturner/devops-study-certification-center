type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

/**
 * Returns true if the request is allowed, false if rate limited.
 * Uses a fixed window per key. Expired entries are pruned on each call.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Prune expired entries to prevent unbounded growth
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }

  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/** Extract the client IP from a Next.js request, preferring x-forwarded-for. */
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
