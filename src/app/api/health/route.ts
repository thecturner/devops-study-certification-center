import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Captured once at module load — used to compute process_start_unix in the response.
const PROCESS_START_MS = Date.now() - process.uptime() * 1000;

// Emitted once: the first time the readiness probe hits this endpoint.
// Datadog log agent captures this from container stdout; create a log-based
// metric on `startup_ms` filtered by `event:pod_ready` to track cold-start time.
let startupLogged = false;

export function GET() {
  const sha = process.env.APP_SHA ?? "dev";
  const service = process.env.DD_SERVICE ?? "devops-cert-study-center";
  const env = process.env.DD_ENV ?? process.env.NEXT_PUBLIC_DD_ENV ?? "local";
  const uptimeSeconds = process.uptime();

  if (!startupLogged) {
    startupLogged = true;
    process.stdout.write(
      JSON.stringify({
        level: "info",
        event: "pod_ready",
        startup_ms: Math.round(uptimeSeconds * 1000),
        sha,
        service,
        env,
        timestamp: new Date().toISOString(),
      }) + "\n"
    );
  }

  return NextResponse.json({
    status: "ok",
    service,
    env,
    sha,
    sha_short: sha === "dev" ? "dev" : sha.slice(0, 7),
    node: process.version,
    uptime_seconds: Math.floor(uptimeSeconds),
    process_start_unix: Math.floor(PROCESS_START_MS / 1000),
  });
}
