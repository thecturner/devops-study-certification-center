import platformScripting from "./platform-scripting.json";
import businessRules from "./business-rules.json";
import apiIntegration from "./api-integration.json";
import applicationDevelopment from "./application-development.json";
import glideApi from "./glide-api.json";
import automation from "./automation.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "platform-scripting": platformScripting,
  "business-rules": businessRules,
  "api-integration": apiIntegration,
  "application-development": applicationDevelopment,
  "glide-api": glideApi,
  automation,
};
