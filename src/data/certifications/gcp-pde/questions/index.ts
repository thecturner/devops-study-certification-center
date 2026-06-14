import dataProcessingSystems from "./data-processing-systems.json";
import buildingOperationalizing from "./building-operationalizing.json";
import mlModels from "./ml-models.json";
import solutionQuality from "./solution-quality.json";
import infrastructureAutomation from "./infrastructure-automation.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "data-processing-systems": dataProcessingSystems,
  "building-operationalizing": buildingOperationalizing,
  "ml-models": mlModels,
  "solution-quality": solutionQuality,
  "infrastructure-automation": infrastructureAutomation,
};
