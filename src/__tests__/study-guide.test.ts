import { generateStudyGuide } from "@/lib/study-guide/generator";
import type { QuestionResult, TopicScore } from "@/types/quiz";

jest.mock("@/data/taxonomy.json", () => ({
  topics: [
    {
      id: "logs",
      label: "Log Management",
      description: "Log collection and processing.",
      studyPointers: [{ label: "Log docs", url: "https://docs.datadoghq.com/logs/" }],
      examScenarios: [
        {
          title: "Parsing 500 errors",
          prompt: "The team sees raw messages but cannot filter on status code.",
          focus: "Use log pipelines to create structured attributes.",
        },
      ],
    },
    {
      id: "apm",
      label: "APM & Tracing",
      description: "Traces and spans.",
      studyPointers: [{ label: "APM docs", url: "https://docs.datadoghq.com/tracing/" }],
      examScenarios: [],
    },
  ],
}));

describe("generateStudyGuide", () => {
  it("includes exam scenarios for weak topics when available", async () => {
    const byTopic: TopicScore[] = [
      { topicId: "logs", label: "logs", attempted: 3, correct: 1, pct: 33 },
      { topicId: "apm", label: "apm", attempted: 3, correct: 3, pct: 100 },
    ];

    const questionResults: QuestionResult[] = [
      {
        questionId: "log-051",
        correct: false,
        userAnswer: "a",
        correctAnswer: "b",
        explanation: "Explanation",
        shortExplanation: "Short",
        longExplanation: "Long",
        preparationNote: "Prep",
        studyPointers: [],
        topics: ["logs"],
        difficulty: "medium",
        prompt: "Prompt",
        choices: [
          { id: "a", text: "A" },
          { id: "b", text: "B" },
        ],
      },
      {
        questionId: "log-052",
        correct: false,
        userAnswer: null,
        correctAnswer: "b",
        explanation: "Explanation",
        shortExplanation: "Short",
        longExplanation: "Long",
        preparationNote: "Prep",
        studyPointers: [],
        topics: ["logs"],
        difficulty: "medium",
        prompt: "Prompt",
        choices: [
          { id: "a", text: "A" },
          { id: "b", text: "B" },
        ],
      },
    ];

    const guide = await generateStudyGuide(byTopic, questionResults);

    expect(guide.weakTopics).toHaveLength(1);
    expect(guide.weakTopics[0].label).toBe("Log Management");
    expect(guide.weakTopics[0].examScenarios).toHaveLength(1);
    expect(guide.weakTopics[0].examScenarios[0].title).toBe("Parsing 500 errors");
    expect(guide.nextSteps).toContain(
      "Work through the exam-style scenarios below to practice recognizing the same patterns in plain language."
    );
  });

  it("does not surface topics with too few attempts", async () => {
    const byTopic: TopicScore[] = [{ topicId: "logs", label: "logs", attempted: 1, correct: 0, pct: 0 }];
    const questionResults: QuestionResult[] = [];

    const guide = await generateStudyGuide(byTopic, questionResults);

    expect(guide.weakTopics).toHaveLength(0);
    expect(guide.nextSteps[0]).toContain("Great job!");
  });

  it("falls back to topicId as label when topic is not in the taxonomy", async () => {
    const byTopic: TopicScore[] = [
      { topicId: "unknown-topic-xyz", label: "Unknown", attempted: 3, correct: 0, pct: 0 },
    ];

    const guide = await generateStudyGuide(byTopic, []);

    expect(guide.weakTopics[0].label).toBe("unknown-topic-xyz");
    expect(guide.weakTopics[0].studyPointers).toEqual([]);
    expect(guide.weakTopics[0].examScenarios).toEqual([]);
  });

  it("uses plural 'topics' in next steps when multiple weak topics exist", async () => {
    const byTopic: TopicScore[] = [
      { topicId: "logs", label: "logs", attempted: 3, correct: 0, pct: 20 },
      { topicId: "apm", label: "apm", attempted: 3, correct: 1, pct: 33 },
    ];

    const guide = await generateStudyGuide(byTopic, []);

    expect(guide.weakTopics).toHaveLength(2);
    expect(guide.nextSteps[0]).toMatch(/\btopics\b/);
  });

  it("omits below-50 and exam-scenario hints when not applicable", async () => {
    // "apm" is in the mock taxonomy with an empty examScenarios array
    // pct=60 means it is weak (< 80) but not critically low (>= 50)
    const byTopic: TopicScore[] = [
      { topicId: "apm", label: "apm", attempted: 3, correct: 2, pct: 60 },
    ];

    const guide = await generateStudyGuide(byTopic, []);

    expect(guide.weakTopics).toHaveLength(1);
    expect(guide.nextSteps.some((s) => s.includes("below 50%"))).toBe(false);
    expect(guide.nextSteps.some((s) => s.includes("exam-style scenarios"))).toBe(false);
  });
});
