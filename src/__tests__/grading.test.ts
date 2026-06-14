import { gradeQuiz } from "@/lib/grading/engine";
import type { Question } from "@/types/quiz";

// Mock taxonomy import: must use inline factory (jest hoisting)
jest.mock("@/data/taxonomy.json", () => ({
  topics: [
    {
      id: "metrics",
      label: "Metrics",
      description: "Metrics fundamentals and metric types.",
      studyPointers: [{ label: "Introduction to Metrics", url: "https://docs.datadoghq.com/metrics/" }],
      examScenarios: [
        {
          title: "Metric type review",
          prompt: "A metric shows an unexpected shape on a graph.",
          focus: "Review the metric type and aggregation behavior.",
        },
      ],
    },
  ],
}));

const QUESTIONS: Question[] = [
  {
    id: "q1",
    type: "single_choice",
    prompt: "Which metric type represents an instantaneous value?",
    choices: [
      { id: "a", text: "Gauge" },
      { id: "b", text: "Counter" },
      { id: "c", text: "Rate" },
      { id: "d", text: "Histogram" },
    ],
    correct: "a",
    explanation: "Gauge represents an instantaneous value.",
    topics: ["metrics"],
    difficulty: "easy",
    version: 1,
  },
  {
    id: "q2",
    type: "multi_choice",
    prompt: "Which are valid Datadog metric types?",
    choices: [
      { id: "a", text: "Gauge" },
      { id: "b", text: "Count" },
      { id: "c", text: "Histogram" },
      { id: "d", text: "Flow" },
    ],
    correct: ["a", "b", "c"],
    explanation: "Gauge, Count, and Histogram are valid Datadog metric types.",
    topics: ["metrics"],
    difficulty: "medium",
    version: 1,
  },
  {
    id: "q3",
    type: "true_false",
    prompt: "DogStatsD is enabled by default in the Datadog Agent.",
    choices: [
      { id: "a", text: "True" },
      { id: "b", text: "False" },
    ],
    correct: "a",
    explanation: "DogStatsD is enabled by default in the Datadog Agent.",
    topics: ["metrics"],
    difficulty: "easy",
    version: 1,
  },
];

describe("gradeQuiz", () => {
  it("grades all correct answers", async () => {
    const results = await gradeQuiz(QUESTIONS, {
      q1: "a",
      q2: ["a", "b", "c"],
      q3: "a",
    });
    expect(results.totalCorrect).toBe(3);
    expect(results.totalQuestions).toBe(3);
    expect(results.pct).toBe(100);
    expect(results.passed).toBe(true);
  });

  it("grades all wrong answers", async () => {
    const results = await gradeQuiz(QUESTIONS, {
      q1: "b",
      q2: ["a", "b"],
      q3: "b",
    });
    expect(results.totalCorrect).toBe(0);
    expect(results.pct).toBe(0);
    expect(results.passed).toBe(false);
  });

  it("grades single_choice correctly", async () => {
    const results = await gradeQuiz([QUESTIONS[0]], { q1: "a" });
    expect(results.questionResults[0].correct).toBe(true);
  });

  it("marks single_choice wrong if wrong choice", async () => {
    const results = await gradeQuiz([QUESTIONS[0]], { q1: "c" });
    expect(results.questionResults[0].correct).toBe(false);
  });

  it("grades multi_choice: correct only if exact set matches", async () => {
    const results = await gradeQuiz([QUESTIONS[1]], { q2: ["a", "b", "c"] });
    expect(results.questionResults[0].correct).toBe(true);
  });

  it("grades multi_choice: wrong if partial set", async () => {
    const results = await gradeQuiz([QUESTIONS[1]], { q2: ["a", "b"] });
    expect(results.questionResults[0].correct).toBe(false);
  });

  it("grades multi_choice: correct regardless of order", async () => {
    const results = await gradeQuiz([QUESTIONS[1]], { q2: ["c", "a", "b"] });
    expect(results.questionResults[0].correct).toBe(true);
  });

  it("treats unanswered questions as incorrect", async () => {
    const results = await gradeQuiz([QUESTIONS[0]], {});
    expect(results.questionResults[0].correct).toBe(false);
    expect(results.questionResults[0].userAnswer).toBeNull();
  });

  it("pass threshold is 70%", async () => {
    // 2 out of 3 = 67%, should fail
    const results = await gradeQuiz(QUESTIONS, { q1: "a", q2: ["a", "b", "c"], q3: "b" });
    expect(results.pct).toBe(67);
    expect(results.passed).toBe(false);
  });

  it("handles an empty question list (returns pct=0 without dividing by zero)", async () => {
    const results = await gradeQuiz([], {});
    expect(results.totalQuestions).toBe(0);
    expect(results.pct).toBe(0);
    expect(results.passed).toBe(false);
    expect(results.byTopic).toHaveLength(0);
  });

  it("aggregates topic scores correctly", async () => {
    const results = await gradeQuiz(QUESTIONS, {
      q1: "a", // correct
      q2: ["a", "b"], // wrong
      q3: "a", // correct
    });
    const metricsScore = results.byTopic.find((t) => t.topicId === "metrics");
    expect(metricsScore?.attempted).toBe(3);
    expect(metricsScore?.correct).toBe(2);
    expect(metricsScore?.pct).toBe(67);
  });

  it("adds default short and long explanations plus study help", async () => {
    const results = await gradeQuiz([QUESTIONS[0], QUESTIONS[1]], { q1: "b", q2: ["a", "b"] });
    const question = results.questionResults[1];

    expect(question.shortExplanation).toContain("multi-select questions require the exact set");
    expect(question.longExplanation).toContain("The correct answer is");
    expect(question.preparationNote).toContain("Metrics");
    expect(question.studyPointers[0]?.label).toBe("Introduction to Metrics");
    expect(results.studyGuide.weakTopics[0]?.examScenarios[0]?.title).toBe("Metric type review");
  });
});
