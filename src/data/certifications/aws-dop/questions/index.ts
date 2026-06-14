// Explicit static imports so Next.js standalone output tracing can find all files.
import sdlcAutomation from "./sdlc-automation.json";
import configurationManagementIac from "./configuration-management-iac.json";
import resilientCloudSolutions from "./resilient-cloud-solutions.json";
import monitoringLogging from "./monitoring-logging.json";
import incidentEventResponse from "./incident-event-response.json";
import securityCompliance from "./security-compliance.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "sdlc-automation": sdlcAutomation,
  "configuration-management-iac": configurationManagementIac,
  "resilient-cloud-solutions": resilientCloudSolutions,
  "monitoring-logging": monitoringLogging,
  "incident-event-response": incidentEventResponse,
  "security-compliance": securityCompliance,
};
