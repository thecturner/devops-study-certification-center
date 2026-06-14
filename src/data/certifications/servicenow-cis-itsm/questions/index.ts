import incidentManagement from "./incident-management.json";
import problemManagement from "./problem-management.json";
import changeManagement from "./change-management.json";
import slaManagement from "./sla-management.json";
import cmdb from "./cmdb.json";
import knowledgeManagement from "./knowledge-management.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "incident-management": incidentManagement,
  "problem-management": problemManagement,
  "change-management": changeManagement,
  "sla-management": slaManagement,
  cmdb,
  "knowledge-management": knowledgeManagement,
};
