import { rateLimit, clientIp } from "@/lib/rate-limit";

// Each test uses unique keys to avoid cross-test state
let keyCounter = 0;
function uniqueKey(prefix: string) {
  return `${prefix}-${++keyCounter}`;
}

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const key = uniqueKey("allow");
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const key = uniqueKey("block");
    rateLimit(key, 2, 60_000);
    rateLimit(key, 2, 60_000);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("resets after the window expires", () => {
    const key = uniqueKey("reset");
    rateLimit(key, 1, 1); // 1ms window
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 1)).toBe(true);
        resolve();
      }, 10);
    });
  });

  it("isolates different keys", () => {
    const keyA = uniqueKey("isolate-a");
    const keyB = uniqueKey("isolate-b");
    rateLimit(keyA, 1, 60_000);
    // keyA is now exhausted, keyB should still be allowed
    expect(rateLimit(keyA, 1, 60_000)).toBe(false);
    expect(rateLimit(keyB, 1, 60_000)).toBe(true);
  });
});

describe("clientIp", () => {
  const makeReq = (headers: Record<string, string>) => ({
    headers: { get: (name: string) => headers[name] ?? null },
  });

  it("returns the first IP from x-forwarded-for", () => {
    const req = makeReq({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = makeReq({ "x-real-ip": "9.9.9.9" });
    expect(clientIp(req)).toBe("9.9.9.9");
  });

  it("returns unknown when no IP headers are present", () => {
    const req = makeReq({});
    expect(clientIp(req)).toBe("unknown");
  });
});
