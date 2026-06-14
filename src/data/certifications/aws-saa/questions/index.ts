import secureArchitectures from "./secure-architectures.json";
import resilientArchitectures from "./resilient-architectures.json";
import highPerformingArchitectures from "./high-performing-architectures.json";
import costOptimizedArchitectures from "./cost-optimized-architectures.json";

export const QUESTION_BANK: Record<string, unknown[]> = {
  "secure-architectures": secureArchitectures,
  "resilient-architectures": resilientArchitectures,
  "high-performing-architectures": highPerformingArchitectures,
  "cost-optimized-architectures": costOptimizedArchitectures,
};
