import platformOverview from "./platform-overview.json";
import userAdministration from "./user-administration.json";
import itsmFundamentals from "./itsm-fundamentals.json";
import reporting from "./reporting.json";
import notifications from "./notifications.json";
import dataManagement from "./data-management.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "platform-overview": platformOverview,
  "user-administration": userAdministration,
  "itsm-fundamentals": itsmFundamentals,
  reporting,
  notifications,
  "data-management": dataManagement,
};
