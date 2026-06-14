import applicationDesignBuild from "./application-design-build.json";
import applicationDeployment from "./application-deployment.json";
import applicationObservability from "./application-observability.json";
import appEnvConfigSecurity from "./app-env-config-security.json";
import servicesNetworking from "./services-networking.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "application-design-build": applicationDesignBuild,
  "application-deployment": applicationDeployment,
  "application-observability": applicationObservability,
  "app-env-config-security": appEnvConfigSecurity,
  "services-networking": servicesNetworking,
};
