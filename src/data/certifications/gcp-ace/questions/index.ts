import cloudSolutionEnvironment from "./cloud-solution-environment.json";
import planningConfiguring from "./planning-configuring.json";
import deployingImplementing from "./deploying-implementing.json";
import ensuringOperation from "./ensuring-operation.json";
import accessSecurity from "./access-security.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "cloud-solution-environment": cloudSolutionEnvironment,
  "planning-configuring": planningConfiguring,
  "deploying-implementing": deployingImplementing,
  "ensuring-operation": ensuringOperation,
  "access-security": accessSecurity,
};
