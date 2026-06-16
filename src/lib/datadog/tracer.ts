/**
 * Datadog APM tracer initialization for Next.js API routes.
 * Import this at the top of API route files that need tracing.
 *
 * Only initializes when DD_API_KEY is set (server-side).
 */

let _initialized = false;

export function initTracer(): void {
  if (_initialized) return;
  if (typeof window !== "undefined") return; // client-side guard

  if (!process.env.DD_API_KEY) {
    // No credentials; skip initialization.
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tracer = require("dd-trace");
    tracer.init({
      service: process.env.DD_SERVICE ?? "devops-cert-study-center",
      env: process.env.DD_ENV ?? "development",
      logInjection: true,
    });
    _initialized = true;
  } catch (err) {
    console.warn("[tracer] Failed to initialize dd-trace:", err);
  }
}
