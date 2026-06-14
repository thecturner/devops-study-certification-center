import identityAccess from "./identity-access.json";
import dataStorage from "./data-storage.json";
import businessContinuity from "./business-continuity.json";
import infrastructure from "./infrastructure.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "identity-access": identityAccess,
  "data-storage": dataStorage,
  "business-continuity": businessContinuity,
  "infrastructure": infrastructure,
};
