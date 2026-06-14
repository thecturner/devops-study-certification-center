import storage from "./storage.json";
import troubleshooting from "./troubleshooting.json";
import workloadsScheduling from "./workloads-scheduling.json";
import clusterArchitecture from "./cluster-architecture.json";
import servicesNetworking from "./services-networking.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  storage,
  troubleshooting,
  "workloads-scheduling": workloadsScheduling,
  "cluster-architecture": clusterArchitecture,
  "services-networking": servicesNetworking,
};
