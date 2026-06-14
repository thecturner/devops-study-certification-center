// Explicit static imports so Next.js standalone output tracing can find all files.
import metrics from "./metrics.json";
import logs from "./logs.json";
import apm from "./apm.json";
import dashboards from "./dashboards.json";
import monitors from "./monitors.json";
import agents from "./agents.json";
import rumSynthetics from "./rum-synthetics.json";
import tagging from "./tagging.json";
import infrastructure from "./infrastructure.json";
import serviceCatalog from "./service-catalog.json";
import security from "./security.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  metrics,
  logs,
  apm,
  dashboards,
  monitors,
  agents,
  "rum-synthetics": rumSynthetics,
  tagging,
  infrastructure,
  "service-catalog": serviceCatalog,
  security,
};
