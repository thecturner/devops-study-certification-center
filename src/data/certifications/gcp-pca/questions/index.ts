import solutionDesign from "./solution-design.json";
import infrastructureManagement from "./infrastructure-management.json";
import securityCompliance from "./security-compliance.json";
import technicalProcesses from "./technical-processes.json";
import reliabilityOperations from "./reliability-operations.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "solution-design": solutionDesign,
  "infrastructure-management": infrastructureManagement,
  "security-compliance": securityCompliance,
  "technical-processes": technicalProcesses,
  "reliability-operations": reliabilityOperations,
};
