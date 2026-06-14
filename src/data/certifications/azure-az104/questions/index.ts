import identityGovernance from "./identity-governance.json";
import storage from "./storage.json";
import compute from "./compute.json";
import networking from "./networking.json";
import monitoringBackup from "./monitoring-backup.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "identity-governance": identityGovernance,
  "storage": storage,
  "compute": compute,
  "networking": networking,
  "monitoring-backup": monitoringBackup,
};
