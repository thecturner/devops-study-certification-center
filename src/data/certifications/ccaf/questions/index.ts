import agentSkills from "./agent-skills.json";
import claudeApi from "./claude-api.json";
import mcp from "./mcp.json";
import claudeCode from "./claude-code.json";
import cowork from "./cowork.json";
import claudeCode101 from "./claude-code-101.json";
import mcpAdvanced from "./mcp-advanced.json";
import subagents from "./subagents.json";
import agenticOrchestration from "./agentic-orchestration.json";
import contextReliability from "./context-reliability.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "agent-skills": agentSkills,
  "claude-api": claudeApi,
  "mcp": mcp,
  "claude-code": claudeCode,
  "cowork": cowork,
  "claude-code-101": claudeCode101,
  "mcp-advanced": mcpAdvanced,
  "subagents": subagents,
  "agentic-orchestration": agenticOrchestration,
  "context-reliability": contextReliability,
};
