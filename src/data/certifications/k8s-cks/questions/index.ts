// Explicit static imports so Next.js standalone output tracing can find all files.
import clusterSetup from "./cluster-setup.json";
import clusterHardening from "./cluster-hardening.json";
import systemHardening from "./system-hardening.json";
import microserviceVulnerabilities from "./microservice-vulnerabilities.json";
import supplyChainSecurity from "./supply-chain-security.json";
import runtimeSecurity from "./runtime-security.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "cluster-setup": clusterSetup,
  "cluster-hardening": clusterHardening,
  "system-hardening": systemHardening,
  "microservice-vulnerabilities": microserviceVulnerabilities,
  "supply-chain-security": supplyChainSecurity,
  "runtime-security": runtimeSecurity,
};
