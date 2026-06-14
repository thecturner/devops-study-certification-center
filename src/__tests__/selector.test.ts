import { selectQuestions } from "@/lib/questions/selector";
import * as loader from "@/lib/questions/loader";
import type { Question } from "@/types/quiz";

// Build a small mock question bank
function makeQuestion(id: string, topics: string[], difficulty: "easy" | "medium" | "hard"): Question {
  return {
    id,
    type: "single_choice",
    prompt: `Question ${id}`,
    choices: [
      { id: "a", text: "A" },
      { id: "b", text: "B" },
      { id: "c", text: "C" },
      { id: "d", text: "D" },
    ],
    correct: "a",
    explanation: "Explanation",
    topics,
    difficulty,
    version: 1,
  };
}

const MOCK_BANK: Question[] = [
  ...Array.from({ length: 10 }, (_, i) => makeQuestion(`met-${i}`, ["metrics"], "easy")),
  ...Array.from({ length: 10 }, (_, i) => makeQuestion(`log-${i}`, ["logs"], "medium")),
  ...Array.from({ length: 10 }, (_, i) => makeQuestion(`apm-${i}`, ["apm"], "hard")),
];

const BASE_CONFIG = { certificationId: "datadog-fundamentals" as const };

beforeEach(() => {
  jest.spyOn(loader, "loadQuestionBank").mockResolvedValue(MOCK_BANK);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("selectQuestions", () => {
  it("returns the requested number of questions", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 10, topics: [], difficulty: "all", types: [], balanced: false, learningMode: false },
      42
    );
    expect(qs).toHaveLength(10);
  });

  it("respects difficulty filter", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 30, topics: [], difficulty: "easy", types: [], balanced: false, learningMode: false },
      42
    );
    expect(qs.every((q) => q.difficulty === "easy")).toBe(true);
  });

  it("respects topic filter", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 5, topics: ["metrics"], difficulty: "all", types: [], balanced: false, learningMode: false },
      42
    );
    expect(qs.every((q) => q.topics.includes("metrics"))).toBe(true);
  });

  it("returns no correct answers in client questions", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 5, topics: [], difficulty: "all", types: [], balanced: false, learningMode: false },
      42
    );
    for (const q of qs) {
      expect((q as unknown as { correct?: unknown }).correct).toBeUndefined();
    }
  });

  it("returns unique questions (no duplicates)", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 20, topics: [], difficulty: "all", types: [], balanced: false, learningMode: false },
      42
    );
    const ids = qs.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("caps count at pool size", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 200, topics: ["metrics"], difficulty: "all", types: [], balanced: false, learningMode: false },
      42
    );
    expect(qs.length).toBeLessThanOrEqual(10);
  });

  it("returns empty array when no questions match filters", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 10, topics: ["nonexistent"], difficulty: "all", types: [], balanced: false, learningMode: false },
      42
    );
    expect(qs).toHaveLength(0);
  });

  it("balanced mode distributes across topics", async () => {
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 15, topics: ["metrics", "logs", "apm"], difficulty: "all", types: [], balanced: true, learningMode: false },
      42
    );
    const topicCounts: Record<string, number> = {};
    for (const q of qs) {
      for (const t of q.topics) {
        topicCounts[t] = (topicCounts[t] ?? 0) + 1;
      }
    }
    expect(topicCounts["metrics"]).toBeGreaterThan(0);
    expect(topicCounts["logs"]).toBeGreaterThan(0);
    expect(topicCounts["apm"]).toBeGreaterThan(0);
  });

  it("fills remainder questions when per-topic allocation falls short of requested count", async () => {
    // 10 metrics + 10 logs in pool; request 15 balanced across both topics.
    // perTopic = floor(15/2) = 7; balanced loop takes 7+7=14; remainder fills 1 more.
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 15, topics: ["metrics", "logs"], difficulty: "all", types: [], balanced: true, learningMode: false },
      42
    );
    expect(qs).toHaveLength(15);
    const ids = qs.map((q) => q.id);
    expect(new Set(ids).size).toBe(15);
  });

  it("uses datadog-fundamentals when certificationId is absent from config", async () => {
    const qs = await selectQuestions(
      { count: 5, topics: [], difficulty: "all", types: [], balanced: false, learningMode: false } as unknown as import("@/types/quiz").QuizConfig,
      42
    );
    expect(qs).toHaveLength(5);
    expect(loader.loadQuestionBank).toHaveBeenCalledWith("datadog-fundamentals");
  });

  it("keeps questions whose type is in the types filter", async () => {
    // All MOCK_BANK questions are single_choice; filtering for single_choice keeps all
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 5, topics: [], difficulty: "all", types: ["single_choice"], balanced: false, learningMode: false },
      42
    );
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.every((q) => q.type === "single_choice")).toBe(true);
  });

  it("filters out questions whose type is not in the types filter", async () => {
    // All MOCK_BANK questions are single_choice; filtering for multi_choice excludes all
    const qs = await selectQuestions(
      { ...BASE_CONFIG, count: 5, topics: [], difficulty: "all", types: ["multi_choice"], balanced: false, learningMode: false },
      42
    );
    expect(qs).toHaveLength(0);
  });
});
